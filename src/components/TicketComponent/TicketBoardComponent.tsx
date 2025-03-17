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
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

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
  color: string;
}

interface TicketBoardComponentProps {
  tickets: Ticket[];
  onTicketClick: (ticketId: string) => void;
  userId: string;
}

// Column header emojis/icons to make it more visual
const columnIcons = {
  new: '🆕',
  assigned: '👤',
  inProgress: '⚙️',
  resolved: '✅',
  closed: '🔒'
};

// Droppable container component
const DroppableColumn = ({ id, children, color }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id
  });

  return (
    <div 
      ref={setNodeRef}
      className={`space-y-3 min-h-[500px] p-2 rounded-md transition-all duration-200
                  ${isOver ? `bg-${color}-50 ring-2 ring-${color}-300` : ''}`}
      style={{
        background: isOver ? `var(--${color}-50)` : 'transparent',
        boxShadow: isOver ? `0 0 0 2px var(--${color}-200)` : 'none'
      }}
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
  const [animatingTicketId, setAnimatingTicketId] = useState<string | null>(null);
  const [animationComplete, setAnimationComplete] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dropPositionRef = useRef({ x: 0, y: 0 });
  
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
        tickets: [],
        color: 'indigo'
      },
      assigned: {
        id: 'assigned',
        title: 'Assigned',
        status: 'ASSIGNED',
        tickets: [],
        color: 'violet'
      },
      inProgress: {
        id: 'inProgress',
        title: 'In Progress',
        status: 'IN_PROGRESS',
        tickets: [],
        color: 'amber'
      },
      resolved: {
        id: 'resolved',
        title: 'Resolved',
        status: 'RESOLVED',
        tickets: [],
        color: 'emerald'
      },
      closed: {
        id: 'closed',
        title: 'Closed',
        status: 'CLOSED',
        tickets: [],
        color: 'gray'
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
      setErrorMessage(null);
      
      const response = await updateTicket({
        action: 'update',
        data: {
          _id: ticketId,
          status: newStatus,
          updatedBy: userId
        }
      }).unwrap();
      
      if (response && (response.status === 'SUCCESS' || response.status === 'Success')) {
        const statusMessage = getStatusChangeMessage(newStatus);
        toast.success(statusMessage);
        return true;
      } else {
        toast.error(`Failed to update status: ${response?.message || 'Unknown error'}`);
        return false;
      }
    } catch (error) {
      console.error("Status update error:", error);
      setErrorMessage("Failed to update ticket status. Please try again.");
      toast.error('Failed to update ticket status');
      return false;
    }
  };

  // Get a user-friendly message based on the new status
  const getStatusChangeMessage = (status: string) => {
    switch(status) {
      case 'NEW': return 'Ticket reverted to New status';
      case 'ASSIGNED': return 'Ticket has been assigned';
      case 'IN_PROGRESS': return 'Ticket is now in progress';
      case 'RESOLVED': return 'Ticket has been resolved';
      case 'CLOSED': return 'Ticket has been closed';
      default: return `Ticket status updated to ${status}`;
    }
  };

  // Handle ticket assignment
  const handleAssignTicket = async () => {
    if (!selectedAssignee || !ticketToAssign) return;
    
    try {
      setErrorMessage(null);
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
      setErrorMessage("Failed to assign ticket. Please try again.");
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
  
  return (
    <>
      <div className="flex overflow-x-auto gap-4 pb-6 pt-2 pr-2">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="min-w-[300px] flex-shrink-0">
              <Card className="h-full border border-gray-200 shadow-sm hover:shadow transition-shadow">
                <CardHeader className={`pb-2 border-b border-${column.color}-100`}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <span className="mr-2">{columnIcons[columnId]}</span>
                      <span>{column.title}</span>
                    </CardTitle>
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium bg-${column.color}-100 text-${column.color}-800 ml-2`}>
                      {column.tickets.length}
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {getColumnDescription(columnId)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0 h-[calc(100%-70px)]">
                  {/* The droppable column container */}
                  <DroppableColumn id={columnId} color={column.color}>
                    <SortableContext 
                      items={column.tickets.map(t => t._id)} 
                      strategy={verticalListSortingStrategy}
                    >
                      <AnimatePresence>
                        {column.tickets.map(ticket => (
                          <motion.div
                            key={ticket._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <SortableTicketItem 
                              id={ticket._id}
                              ticket={ticket}
                              onTicketClick={handleTicketClick}
                              columnColor={column.color}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {column.tickets.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-32 mt-6 text-gray-400 text-center px-4">
                          <p className="text-sm mb-2">No tickets in this column</p>
                          <p className="text-xs">Drag tickets here to change their status</p>
                        </div>
                      )}
                    </SortableContext>
                  </DroppableColumn>
                </CardContent>
              </Card>
            </div>
          ))}
          
          {/* Drag overlay to show what's being dragged */}
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
              <div className="w-[300px] shadow-lg animated-ticket">
                <Card className="w-full border-2 border-indigo-400">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-indigo-600">{activeTicket.ticketId || `TKT-${activeTicket._id.substr(-8)}`}</CardTitle>
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription>
              Select a user to assign this ticket to
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {errorMessage && (
              <Alert variant="destructive" className="text-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            {ticketToAssign && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium text-sm">{ticketToAssign.title}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{ticketToAssign.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {ticketToAssign.department?.name}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {ticketToAssign.category?.name}
                  </Badge>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select onValueChange={setSelectedAssignee} value={selectedAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {usersLoading ? (
                    <div className="flex justify-center items-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Loading users...</span>
                    </div>
                  ) : (
                    usersData?.data?.map((user: any) => (
                      <SelectItem key={user._id} value={user._id}>
                        {`${user.firstName} ${user.lastName}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAssignDialogOpen(false);
                setTicketToAssign(null);
                setPendingStatusChange(null);
                setErrorMessage(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignTicket}
              disabled={!selectedAssignee}
              className="relative"
            >
              {usersLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Assign Ticket'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper function to get column descriptions
function getColumnDescription(columnId: string): string {
  switch(columnId) {
    case 'new': return 'Newly created, unassigned tickets';
    case 'assigned': return 'Tickets assigned but not started';
    case 'inProgress': return 'Tickets currently being worked on';
    case 'resolved': return 'Completed tickets awaiting closure';
    case 'closed': return 'Finalized tickets (read-only)';
    default: return '';
  }
}

export default TicketBoardComponent;