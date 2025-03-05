// src/components/TicketComponent/TicketBoardComponent.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateTicketMutation, useAssignTicketMutation } from '@/services/endpoints/ticketApi';
import { SortableTicketItem } from './SortableTicketItem';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetMasterQuery } from '@/services/endpoints/masterApi';
import TicketComponent from './TicketComponent';

// Define column types with proper typing
interface Ticket {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  department: {
    _id: string;
    name: string;
  };
  category: {
    _id: string;
    name: string;
  };
  creator: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  assignee?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  efforts: number;
  totalEfforts: number;
}

interface Column {
  id: string;
  title: string;
  status: string;
  tickets: Ticket[];
}

interface TicketBoardComponentProps {
  tickets: Ticket[];
  onTicketClick: (ticketId: string) => void;
  userId: string;
}

// Droppable container component
const DroppableColumn = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id
  });

  return (
    <div 
      ref={setNodeRef}
      className={`space-y-3 min-h-[500px] p-2 rounded-md transition-all duration-200 
                  ${isOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''}`}
    >
      {children}
    </div>
  );
};

const TicketBoardComponent: React.FC<TicketBoardComponentProps> = ({ 
  tickets, 
  onTicketClick,
  userId
}) => {
  const router = useRouter();
  const [columns, setColumns] = useState<{ [key: string]: Column }>({});
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [updateTicket] = useUpdateTicketMutation();
  const [assignTicket] = useAssignTicketMutation();
  
  // Assignment dialog state
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [ticketToAssign, setTicketToAssign] = useState<Ticket | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<string | null>(null);
  
  // Set up sensors for drag and drop with activation constraints to help differentiate from clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Drag starts after moving 10px (helps distinguish from clicks)
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Fetch users for assignment dialog
  const { data: usersData = {}, isLoading: usersLoading } = useGetMasterQuery({
    db: 'USER_MASTER',
    filter: ticketToAssign ? { department: ticketToAssign.department._id, isActive: true } : {},
    sort: { firstName: 1 }
  }, { skip: !ticketToAssign });

  // Initialize columns with tickets
  useEffect(() => {
    const initialColumns: { [key: string]: Column } = {
      new: {
        id: 'new',
        title: 'New',
        status: 'NEW',
        tickets: []
      },
      assigned: {
        id: 'assigned',
        title: 'Assigned',
        status: 'ASSIGNED',
        tickets: []
      },
      inProgress: {
        id: 'inProgress',
        title: 'In Progress',
        status: 'IN_PROGRESS',
        tickets: []
      },
      resolved: {
        id: 'resolved',
        title: 'Resolved',
        status: 'RESOLVED',
        tickets: []
      },
      closed: {
        id: 'closed',
        title: 'Closed',
        status: 'CLOSED',
        tickets: []
      }
    };

    // Distribute tickets to columns based on status
    tickets.forEach(ticket => {
      switch (ticket.status.toUpperCase()) {
        case 'NEW':
          initialColumns.new.tickets.push(ticket);
          break;
        case 'ASSIGNED':
          initialColumns.assigned.tickets.push(ticket);
          break;
        case 'IN_PROGRESS':
          initialColumns.inProgress.tickets.push(ticket);
          break;
        case 'RESOLVED':
          initialColumns.resolved.tickets.push(ticket);
          break;
        case 'CLOSED':
          initialColumns.closed.tickets.push(ticket);
          break;
        default:
          initialColumns.new.tickets.push(ticket);
      }
    });

    setColumns(initialColumns);
  }, [tickets]);

  // Find which column a ticket is in
  const findColumnOfTicket = (ticketId: string): { columnId: string, ticketIndex: number } | null => {
    for (const [columnId, column] of Object.entries(columns)) {
      const ticketIndex = column.tickets.findIndex(t => t._id === ticketId);
      if (ticketIndex !== -1) {
        return { columnId, ticketIndex };
      }
    }
    return null;
  };

  // Handle start of drag to track which ticket is being dragged
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const ticketId = active.id as string;
    
    setActiveDragId(ticketId);
    
    // Find the ticket being dragged
    const source = findColumnOfTicket(ticketId);
    if (source) {
      const { columnId, ticketIndex } = source;
      setActiveTicket(columns[columnId].tickets[ticketIndex]);
    }
  };

  // Update ticket status
  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      console.log("Updating ticket status:", { ticketId, newStatus, userId });
      
      const response = await updateTicket({
        action: 'update',
        data: {
          _id: ticketId,
          status: newStatus,
          updatedBy: userId
        }
      }).unwrap();
      
      console.log("Update ticket response:", response);
      
      // Check for both SUCCESS and Success (case insensitive)
      if (response && (response.status === 'SUCCESS' || response.status === 'Success')) {
        toast.success(`Ticket status updated to ${newStatus}`);
        return true;
      } else {
        toast.error(`Failed to update status: ${response?.message || 'Unknown error'}`);
        return false;
      }
    } catch (error) {
      console.error("Status update error:", error);
      toast.error('Failed to update ticket status');
      return false;
    }
  };

  // Handle ticket assignment
  const handleAssignTicket = async () => {
    if (!selectedAssignee || !ticketToAssign) return;
    
    try {
      await assignTicket({
        ticketId: ticketToAssign._id,
        assigneeId: selectedAssignee,
        updatedBy: userId
      }).unwrap();
      
      // Close the dialog
      setIsAssignDialogOpen(false);
      
      // If we have a pending status change, continue with it
      if (pendingStatusChange) {
        await updateTicketStatus(ticketToAssign._id, pendingStatusChange);
      }
      
      toast.success('Ticket assigned successfully');
      
      // Reset state
      setTicketToAssign(null);
      setSelectedAssignee('');
      setPendingStatusChange(null);
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error('Failed to assign ticket');
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Reset active drag ticket
    setActiveDragId(null);
    setActiveTicket(null);
    
    if (!active || !over) {
      console.log("Missing active or over in drag event");
      return;
    }
    
    // Extract IDs
    const ticketId = active.id as string;
    const overId = over.id as string;
    
    console.log("Drag ended:", { ticketId, overId });
    
    // Make sure we only process drops on columns, not on other tickets
    if (!columns[overId]) {
      console.log("Not a valid column ID:", overId);
      return;
    }
    
    const destinationColumnId = overId;
    
    // Find source column and ticket
    const source = findColumnOfTicket(ticketId);
    if (!source) {
      console.error("Could not find source ticket:", ticketId);
      return;
    }
    
    const { columnId: sourceColumnId, ticketIndex } = source;
    
    // If dropped in the same column, do nothing
    if (sourceColumnId === destinationColumnId) {
      console.log("Dropped in same column, no action needed");
      return;
    }
    
    // Get the ticket being moved
    const ticket = columns[sourceColumnId].tickets[ticketIndex];
    const newStatus = columns[destinationColumnId].status;
    
    console.log("Moving ticket:", { ticket, fromStatus: ticket.status, toStatus: newStatus });
    
    // Special case for assigning a ticket
    if (destinationColumnId === 'assigned' && (!ticket.assignee || sourceColumnId === 'new')) {
      console.log("Opening assignment dialog for ticket:", ticket.title);
      setTicketToAssign(ticket);
      setPendingStatusChange(newStatus);
      setIsAssignDialogOpen(true);
      return;
    }
    
    // Validate move - prevent moving unassigned tickets to progress or resolved
    if (!ticket.assignee && (destinationColumnId === 'inProgress' || destinationColumnId === 'resolved')) {
      toast.error('Cannot move ticket to this status without an assignee');
      return;
    }
    
    // Create a deep copy of columns for state updates to avoid reference issues
    const originalColumns = JSON.parse(JSON.stringify(columns));
    const newColumns = JSON.parse(JSON.stringify(columns));
    
    // Remove from source column
    newColumns[sourceColumnId].tickets = newColumns[sourceColumnId].tickets.filter(t => t._id !== ticketId);
    
    // Update ticket status
    const updatedTicket = { ...ticket, status: newStatus };
    
    // Add to destination column
    newColumns[destinationColumnId].tickets.push(updatedTicket);
    
    // Update state optimistically
    setColumns(newColumns);
    
    // Update in backend
    try {
      const success = await updateTicketStatus(ticket._id, newStatus);
      
      if (!success) {
        console.log("Status update failed, reverting state");
        // Revert state on error with a deep copy to ensure re-render
        setColumns(originalColumns);
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
      toast.error("Failed to update ticket status");
      // Revert state on error
      setColumns(originalColumns);
    }
  };

  // Handle navigating to ticket details
  const handleTicketClick = (ticketId: string) => {
    if (activeDragId) return; // Don't navigate during drag operations
    router.push(`/dashboard/ticket/${ticketId}`);
  };

  return (
    <>
      <div className="flex overflow-x-auto gap-4 pb-4">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="min-w-[300px]">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between">
                    <span>{column.title}</span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {column.tickets.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* The droppable column container - critical for drag and drop */}
                  <DroppableColumn id={columnId}>
                    <SortableContext 
                      items={column.tickets.map(t => t._id)} 
                      strategy={verticalListSortingStrategy}
                    >
                      {column.tickets.map(ticket => (
                        <SortableTicketItem 
                          key={ticket._id}
                          id={ticket._id}
                          ticket={ticket}
                          onTicketClick={handleTicketClick}
                        />
                      ))}
                    </SortableContext>
                  </DroppableColumn>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {/* Drag overlay to show what's being dragged */}
          <DragOverlay>
            {activeTicket ? (
              <div className="w-[300px] opacity-80">
                <TicketComponent ticket={activeTicket} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      
      {/* Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription>
              Select a user to assign this ticket to
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {ticketToAssign && (
              <div className="mb-4">
                <p className="font-medium">{ticketToAssign.title}</p>
                <p className="text-sm text-gray-500 mt-1">{ticketToAssign.department?.name}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select onValueChange={setSelectedAssignee} value={selectedAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {usersData?.data?.map((user: any) => (
                    <SelectItem key={user._id} value={user._id}>
                      {`${user.firstName} ${user.lastName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAssignDialogOpen(false);
                setTicketToAssign(null);
                setPendingStatusChange(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignTicket}
              disabled={!selectedAssignee}
            >
              Assign Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TicketBoardComponent;