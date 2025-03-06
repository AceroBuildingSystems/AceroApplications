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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  
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

    updateColumnsState(initialColumns);
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
    
    if (!active || !over) {
      setActiveDragId(null);
      setActiveTicket(null);
      return;
    }
    
    // Extract IDs
    const ticketId = active.id as string;
    const overId = over.id as string;
    
    // Make sure we only process drops on columns
    if (!columns[overId]) {
      setActiveDragId(null);
      setActiveTicket(null);
      return;
    }
    
    const destinationColumnId = overId;
    
    // Find source column and ticket
    const source = findColumnOfTicket(ticketId);
    if (!source) {
      setActiveDragId(null);
      setActiveTicket(null);
      return;
    }
    
    const { columnId: sourceColumnId, ticketIndex } = source;
    
    // If dropped in the same column, just clean up
    if (sourceColumnId === destinationColumnId) {
      setActiveDragId(null);
      setActiveTicket(null);
      return;
    }
    
    // Get the ticket being moved
    const ticket = columns[sourceColumnId].tickets[ticketIndex];
    const newStatus = columns[destinationColumnId].status;
    
    // Special case for assigning a ticket
    if (destinationColumnId === 'assigned' && (!ticket.assignee || sourceColumnId === 'new')) {
      // Don't reset drag states yet - keep the visual appearance stable
      setTicketToAssign(ticket);
      setPendingStatusChange(newStatus);
      setIsAssignDialogOpen(true);
      // Now we can reset
      setActiveDragId(null);
      setActiveTicket(null);
      return;
    }
    
    // Validate move - prevent moving unassigned tickets to progress or resolved
    if (!ticket.assignee && (destinationColumnId === 'inProgress' || destinationColumnId === 'resolved')) {
      toast.error('Cannot move ticket to this status without an assignee');
      setActiveDragId(null);
      setActiveTicket(null);
      return;
    }
    
    // Enter transition state - keep the drag overlay visible
    setIsTransitioning(true);
    
    // Create deep copies of the state
    const originalColumns = JSON.parse(JSON.stringify(columns));
    const newColumns = JSON.parse(JSON.stringify(columns));
    
    // Remove from source column
    newColumns[sourceColumnId].tickets = newColumns[sourceColumnId].tickets.filter(t => t._id !== ticketId);
    
    // Update ticket status
    const updatedTicket = { ...ticket, status: newStatus };
    
    // Add to destination column
    newColumns[destinationColumnId].tickets.push(updatedTicket);
    
    // Update backend first, keeping visual state stable
    try {
      const success = await updateTicketStatus(ticket._id, newStatus);
      
      if (success) {
        // After backend update succeeds, update the state with a slight delay
        setTimeout(() => {
          updateColumnsState(newColumns);
          // Finally reset the drag state
          setActiveDragId(null);
          setActiveTicket(null);
          setIsTransitioning(false);
        }, 50); // Small delay for smoother transition
      } else {
        // If update fails, clean up without changing state
        setActiveDragId(null);
        setActiveTicket(null);
        setIsTransitioning(false);
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
      toast.error("Failed to update ticket status");
      // Clean up without changing state
      setActiveDragId(null);
      setActiveTicket(null);
      setIsTransitioning(false);
    }
  };

  // Handle navigating to ticket details
  const handleTicketClick = (ticketId: string) => {
    if (activeDragId) return; // Don't navigate during drag operations
    router.push(`/dashboard/ticket/${ticketId}`);
  };

  const updateColumnsState = (newColumns) => {
    // Schedule state update for next frame to avoid flicker
    requestAnimationFrame(() => {
      setColumns(newColumns);
    });
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
          <DragOverlay className="dnd-overlay" dropAnimation={{
            duration: 300,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}>
            {(activeTicket && (activeDragId || isTransitioning)) ? (
              <div className="w-[300px] shadow-lg">
                <Card className="w-full border-2 border-blue-400">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-blue-600">{activeTicket.ticketId || `TKT-${activeTicket._id.substr(-8)}`}</CardTitle>
                        <CardDescription className="text-base font-medium">{activeTicket.title}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{activeTicket.description}</p>
                  </CardContent>
                </Card>
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