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
  color?: string;
}

interface TicketBoardComponentProps {
  tickets: Ticket[];
  onTicketClick: (ticketId: string) => void;
  userId: string;
}

// Droppable container component
const DroppableColumn = ({ id, children, title, count, color = 'gray' }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id
  });

  // Map color names to tailwind classes (more subtle)
  const colorMap = {
    gray: { light: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' },
    blue: { light: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700' },
    green: { light: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
    amber: { light: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700' },
    purple: { light: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-700' },
  };

  const colors = colorMap[color] || colorMap.gray;

  return (
    <div className="flex flex-col h-full w-[280px] transition-all duration-200">
      <div className={`flex items-center justify-between mb-2 p-2 ${colors.light} rounded-t-md border-t border-l border-r ${colors.border}`}>
        <h3 className={`font-semibold ${colors.text} text-sm`}>
          {title}
          <span className={`ml-2 text-xs font-medium bg-white ${colors.text} rounded-full px-2 py-0.5 shadow-sm`}>
            {count}
          </span>
        </h3>
      </div>
      <div 
        ref={setNodeRef}
        className={`space-y-2 min-h-[500px] p-2 rounded-b-md transition-all duration-200
                    flex-1 overflow-auto border-b border-l border-r
                    ${isOver ? `bg-white ${colors.border} shadow-sm` : `bg-white ${colors.border}`}`}
        style={{ 
          transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
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
  const [isAssigning, setIsAssigning] = useState(false);
  
  // Set up sensors for drag and drop with activation constraints to help differentiate from clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Slightly reduced to make dragging more responsive
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

  // Initialize columns with tickets and added visual indicators
  useEffect(() => {
    const initialColumns: { [key: string]: Column } = {
      new: {
        id: 'new',
        title: 'New',
        status: 'NEW',
        tickets: [],
        color: 'blue'
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
        color: 'green'
      },
      closed: {
        id: 'closed',
        title: 'Closed',
        status: 'CLOSED',
        tickets: [],
        color: 'purple'
      }
    };

    // Distribute tickets to columns based on status
    tickets.forEach(ticket => {
      switch (ticket.status.toUpperCase()) {
        case 'NEW':
          initialColumns.new.tickets.push(ticket);
          break;
        case 'ASSIGNED':
          initialColumns.assigned?.tickets.push(ticket);
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

  // Handle drag end with improved animation
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
      // Update visual state immediately for responsiveness
      updateColumnsState(newColumns);
      
      // Then update backend
      const success = await updateTicketStatus(ticket._id, newStatus);
      
      if (!success) {
        // If update fails, revert to the original state
        console.log("Reverting due to failed backend update");
        // Re-fetch the tickets would be better here
      }
      
      // Clean up
      setActiveDragId(null);
      setActiveTicket(null);
      
    } catch (error) {
      console.error("Error updating ticket status:", error);
      toast.error("Failed to update ticket status");
      // Clean up
      setActiveDragId(null);
      setActiveTicket(null);
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
  
  // Empty state component for cleaner code
  const EmptyColumnState = ({ columnColor = 'gray' }) => {
    const colorMap = {
      gray: { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-100' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-400', border: 'border-blue-100' },
      green: { bg: 'bg-emerald-50', text: 'text-emerald-400', border: 'border-emerald-100' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-400', border: 'border-amber-100' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-400', border: 'border-purple-100' },
    };
    
    const colors = colorMap[columnColor] || colorMap.gray;
    
    return (
      <div className={`flex flex-col items-center justify-center h-32 border border-dashed ${colors.border} rounded-md ${colors.bg} transition-all duration-200`}>
        <p className={`text-sm ${colors.text}`}>No tickets</p>
        <p className={`text-xs ${colors.text} mt-1`}>Drag tickets here</p>
      </div>
    );
  };

  // Main component with redesigned styling
  return (
    <>
      <div className="w-full overflow-hidden">
        <div className="w-full overflow-x-auto pb-6 pt-2 snap-x">
          <div className="flex gap-5 px-1 min-w-max">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              {Object.entries(columns).map(([columnId, column]) => (
                <div key={columnId} className="snap-start">
                  <DroppableColumn 
                    id={columnId} 
                    title={column.title} 
                    count={column.tickets.length}
                    color={column.color}
                  >
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
                      <EmptyColumnState columnColor={column.color} />
                    )}
                  </DroppableColumn>
                </div>
              ))}
              
              {/* Drag overlay with enhanced styling */}
              <DragOverlay 
                className="dnd-overlay"
                dropAnimation={{
                  duration: 200,
                  easing: 'cubic-bezier(0.2, 0, 0.2, 1)',
                }}
              >
                {activeTicket ? (
                  <div className="w-[270px] shadow-md animated-ticket">
                    <Card className="w-full border-0 bg-white rounded-md overflow-hidden">
                      <CardHeader className="py-3 px-4 bg-primary/5 border-b">
                        <div>
                          <CardTitle className="text-xs font-medium text-primary/80">{activeTicket.ticketId || `TKT-${activeTicket._id.substr(-8)}`}</CardTitle>
                          <CardDescription className="text-sm font-medium text-gray-800 mt-1">{activeTicket.title}</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="py-3 px-4">
                        <p className="text-xs text-gray-600 line-clamp-2">{activeTicket.description}</p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                                          ${activeTicket.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 
                                            activeTicket.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 
                                            'bg-green-100 text-green-700'}`}>
                              {activeTicket.priority}
                            </span>
                          </div>
                          
                          {activeTicket.assignee && (
                            <div className="flex items-center">
                              <div className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                                {activeTicket.assignee.firstName[0]}{activeTicket.assignee.lastName[0]}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>
      
      {/* Redesigned Assign Ticket Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-md border shadow-md">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-semibold text-primary/90">
              {ticketToAssign?.assignee ? 'Reassign Ticket' : 'Assign Ticket'}
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm">
              Select a team member to assign this ticket to
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Assignee</Label>
              <Select onValueChange={setSelectedAssignee} value={selectedAssignee}>
                <SelectTrigger className="w-full border-gray-200 rounded-md h-10">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent className="rounded-md border-gray-200">
                  {usersData?.data?.map(user => (
                    <SelectItem key={user._id} value={user._id} className="cursor-pointer py-1">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">
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
          
          <DialogFooter className="border-t pt-3">
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)} className="rounded-md border-gray-200 h-9">
              Cancel
            </Button>
            <Button 
              onClick={handleAssignTicket}
              disabled={!selectedAssignee || isAssigning}
              className="rounded-md bg-primary hover:bg-primary/90 h-9"
            >
              {isAssigning ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* CSS for animations */}
      <style jsx global>{`
        .animated-ticket {
          transform: scale(1);
          transition: all 0.2s ease-out;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .dnd-overlay .animated-ticket {
          transform: scale(1.03);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
        }
        
        .snap-x {
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        
        .snap-start {
          scroll-snap-align: start;
        }
        
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </>
  );
};

export default TicketBoardComponent;