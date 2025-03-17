// src/components/TicketComponent/TicketBoardComponent.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
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
const DroppableColumn = ({ id, children, title, count }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id
  });

  return (
    <div className="min-w-[320px] flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 px-2">
        <h3 className="font-semibold text-gray-700 flex items-center">
          {title}
          <span className="ml-2 text-xs font-medium bg-gray-100 text-gray-600 rounded-full px-2 py-0.5">
            {count}
          </span>
        </h3>
      </div>
      <div 
        ref={setNodeRef}
        className={`space-y-3 min-h-[500px] p-3 rounded-lg transition-all duration-200 
                    flex-1 overflow-auto 
                    ${isOver ? 'bg-blue-50/60 ring-2 ring-blue-200' : 'bg-gray-50/60 ring-1 ring-gray-100'}`}
      >
        {children}
      </div>
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
  const [animatingTicketId, setAnimatingTicketId] = useState<string | null>(null);
  const [animationComplete, setAnimationComplete] = useState(true);
  const dropPositionRef = useRef({ x: 0, y: 0 });
  const [isAssigning, setIsAssigning] = useState(false);
  
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
    setIsAssigning(true);
    
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
      setIsAssigning(false);
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
    if (destinationColumnId === 'assigned' && (!ticket?.assignee || sourceColumnId === 'new')) {
      setTicketToAssign(ticket);
      setPendingStatusChange(newStatus);
      setIsAssignDialogOpen(true);
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
    
    // Store current position of the dragged element
    dropPositionRef.current = {
      x: event.active.rect.current.translated?.left || 0,
      y: event.active.rect.current.translated?.top || 0
    };
    
    // Start animation and prevent immediate state updates
    setAnimatingTicketId(ticketId);
    setAnimationComplete(false);
    
    // Create deep copies of the state
    const originalColumns = JSON.parse(JSON.stringify(columns));
    const newColumns = JSON.parse(JSON.stringify(columns));
    
    // Remove from source column
    newColumns[sourceColumnId].tickets = newColumns[sourceColumnId].tickets.filter(t => t._id !== ticketId);
    
    // Update ticket status
    const updatedTicket = { ...ticket, status: newStatus };
    
    // Add to destination column
    newColumns[destinationColumnId].tickets.push(updatedTicket);
  
    // Update backend first, but keep visual consistency
    try {
      const success = await updateTicketStatus(ticket._id, newStatus);
      
      if (success) {
        // After backend update succeeds, update the state
        // But wait until animation is ready to complete
        setTimeout(() => {
          updateColumnsState(newColumns);
          
          // After state update, complete animation with a delay
          setTimeout(() => {
            setAnimationComplete(true);
            setActiveDragId(null);
            setActiveTicket(null);
            setAnimatingTicketId(null);
          }, 50);
        }, 300); // Longer delay for animation
      } else {
        // If update fails, clean up
        setAnimationComplete(true);
        setActiveDragId(null);
        setActiveTicket(null);
        setAnimatingTicketId(null);
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
      toast.error("Failed to update ticket status");
      // Clean up
      setAnimationComplete(true);
      setActiveDragId(null);
      setActiveTicket(null);
      setAnimatingTicketId(null);
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
  

// Main component with improved styling
return (
  <>
    <div className="flex overflow-x-auto gap-6 pb-6 pt-2">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {Object.entries(columns).map(([columnId, column]) => (
          <div key={columnId} className="min-w-[320px] h-full">
            <DroppableColumn id={columnId} title={column.title} count={column.tickets.length}>
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
              
              {/* Empty state for columns with no tickets */}
              {column.tickets.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 border border-dashed border-gray-200 rounded-lg bg-white">
                  <p className="text-sm text-gray-500">No tickets</p>
                  <p className="text-xs text-gray-400">Drag tickets here</p>
                </div>
              )}
            </DroppableColumn>
          </div>
        ))}
        
        {/* Drag overlay with enhanced styling */}
        <DragOverlay 
          className={`dnd-overlay ${!animationComplete ? 'fixed-position' : ''}`}
          dropAnimation={animationComplete ? {
            duration: 300,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          } : null}
          style={
            !animationComplete && animatingTicketId ? {
              position: 'fixed',
              left: `${dropPositionRef.current.x}px`,
              top: `${dropPositionRef.current.y}px`,
              margin: 0,
              transform: 'none',
              zIndex: 9999,
            } : undefined
          }
        >
          {(activeTicket && ((activeDragId && !animationComplete) || (!animationComplete && animatingTicketId))) ? (
            <div className="w-[300px] shadow-lg animated-ticket scale-105">
              <Card className="w-full border-2 border-primary bg-white">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-primary">{activeTicket.ticketId || `TKT-${activeTicket._id.substr(-8)}`}</CardTitle>
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
    
    {/* Styled Assign Ticket Dialog */}
    <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{ticketToAssign?.assignee ? 'Reassign Ticket' : 'Assign Ticket'}</DialogTitle>
          <DialogDescription>
            Select a team member to assign this ticket to
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select onValueChange={setSelectedAssignee} value={selectedAssignee}>
              <SelectTrigger className="w-full border-gray-200 rounded-lg">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {usersData?.data?.map(user => (
                  <SelectItem key={user._id} value={user._id}>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <span>{`${user.firstName} ${user.lastName}`}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)} className="rounded-lg">
            Cancel
          </Button>
          <Button 
            onClick={handleAssignTicket}
            disabled={!selectedAssignee || isAssigning}
            className="rounded-lg bg-primary hover:bg-primary/90"
          >
            {isAssigning ? 'Assigning...' : 'Assign Ticket'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
);
};

export default TicketBoardComponent;