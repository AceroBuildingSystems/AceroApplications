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
import { AlertCircle, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

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
  icon: React.ReactNode;
}

interface TicketBoardComponentProps {
  tickets: Ticket[];
  onTicketClick: (ticketId: string) => void;
  userId: string;
}

// Droppable container component
const DroppableColumn = ({ id, children, color, isOver }) => {
  return (
    <div 
      className={`space-y-3 min-h-[300px] p-3 rounded-xl transition-all duration-200`}
      style={{
        background: isOver ? `var(--${color}-50)` : 'transparent',
        boxShadow: isOver ? `0 0 0 2px var(--${color}-200)` : 'none',
        transition: 'all 0.2s ease-in-out'
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
  const [animatingTicketId, setAnimatingTicketId] = useState<string | null>(null);
  const [animationComplete, setAnimationComplete] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dropPositionRef = useRef({ x: 0, y: 0 });
  
  // Set up sensors for drag and drop with activation constraints to help differentiate from clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Drag starts after moving 8px (helps distinguish from clicks)
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
        color: 'blue',
        icon: <AlertCircle className="h-4 w-4 text-blue-600" />
      },
      // assigned: {
      //   id: 'assigned',
      //   title: 'Assigned',
      //   status: 'ASSIGNED',
      //   tickets: [],
      //   color: 'indigo',
      //   icon: <Info className="h-4 w-4 text-indigo-600" />
      // },
      inProgress: {
        id: 'inProgress',
        title: 'In Progress',
        status: 'IN_PROGRESS',
        tickets: [],
        color: 'amber',
        icon: <Info className="h-4 w-4 text-amber-600" />
      },
      resolved: {
        id: 'resolved',
        title: 'Resolved',
        status: 'RESOLVED',
        tickets: [],
        color: 'green',
        icon: <Info className="h-4 w-4 text-green-600" />
      },
      closed: {
        id: 'closed',
        title: 'Closed',
        status: 'CLOSED',
        tickets: [],
        color: 'gray',
        icon: <Info className="h-4 w-4 text-gray-600" />
      }
    };

    // Distribute tickets to columns based on status
    if (tickets && tickets.length > 0) {
      tickets.forEach(ticket => {
        switch (ticket.status.toUpperCase()) {
          case 'NEW':
            initialColumns.new.tickets.push(ticket);
            break;
          case 'ASSIGNED':
            initialColumns.inProgress.tickets.push(ticket);
            break;
          case 'IN_PROGRESS' :
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
    }

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

  // Wrapper for DroppableColumn to handle useDroppable context
  const DroppableColumnWrapper = ({ columnId, children, color }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: columnId
    });
  
    return (
      <div ref={setNodeRef}>
        <DroppableColumn id={columnId} color={color} isOver={isOver}>
          {children}
        </DroppableColumn>
      </div>
    );
  };

  // Update columns state
  const updateColumnsState = (newColumns) => {
    // Schedule state update for next frame to avoid flicker
    requestAnimationFrame(() => {
      setColumns(newColumns);
    });
  };
  
  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Main board container - fixed width with horizontal scroll */}
      <div className="relative">
        {/* The horizontal scrolling container */}
        <div className="flex overflow-x-auto pb-6 pt-2 gap-4 hide-scrollbar w-full">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Columns wrapper with proper spacing */}
            <div className="flex gap-4 px-1 min-w-min">
              {Object.entries(columns).map(([columnId, column]) => (
                <motion.div 
                  key={columnId} 
                  className="w-[280px] flex-shrink-0" 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: parseInt(columnId[0]) * 0.1 }}
                >
                  <Card className="h-full shadow-sm card-hover border-t-2" style={{ borderTopColor: `var(--${column.color}-500)` }}>
                    <CardHeader className="pb-2 pt-3 px-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <span className="mr-2">{column.icon}</span>
                          <span>{column.title}</span>
                        </CardTitle>
                        <Badge 
                          variant="secondary" 
                          className="badge-status text-xs px-2 py-0.5"
                          style={{
                            backgroundColor: `var(--${column.color}-50)`,
                            color: `var(--${column.color}-700)`,
                          }}
                        >
                          {column.tickets.length}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs mt-1">
                        {getColumnDescription(columnId)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-2 max-h-[70vh] overflow-y-auto">
                      {/* The droppable column container */}
                      <DroppableColumnWrapper columnId={columnId} color={column.color}>
                        <SortableContext 
                          items={column.tickets.map(t => t._id)} 
                          strategy={verticalListSortingStrategy}
                        >
                          <AnimatePresence>
                            {column.tickets.map(ticket => (
                              <SortableTicketItem 
                                key={ticket._id}
                                id={ticket._id}
                                ticket={ticket}
                                onTicketClick={onTicketClick}
                                columnColor={column.color}
                              />
                            ))}
                          </AnimatePresence>
                          
                          {column.tickets.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-32 mt-3 text-muted-foreground text-center px-3 border border-dashed rounded-lg">
                              <p className="text-sm mb-1">No tickets</p>
                              <p className="text-xs">Drag tickets here to change their status</p>
                            </div>
                          )}
                        </SortableContext>
                      </DroppableColumnWrapper>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
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
                <div className="w-[260px] shadow-lg animated-ticket">
                  <Card className="w-full border border-primary/30 bg-white">
                    <CardHeader className="pb-2 p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-primary text-sm">{activeTicket.ticketId || `TKT-${activeTicket._id.substr(-8)}`}</CardTitle>
                          <CardDescription className="text-sm font-medium">{activeTicket.title}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2 px-3">
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{activeTicket.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
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

// Add this to your global CSS
const globalCssAddition = `
/* Hide scrollbar for Chrome, Safari and Opera */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
`;

export default TicketBoardComponent;