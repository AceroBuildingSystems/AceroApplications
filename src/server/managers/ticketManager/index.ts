// src/server/managers/ticketManager/index.ts
import { 
    getTickets, 
    getTicketById, 
    createTicket, 
    updateTicket,
    assignTicket,
    changeTicketStatus,
    calculateTicketProgress,
    autoAssignTicket
  } from '@/server/services/ticketServices';
  
  export const ticketManager = {
    getTickets,
    getTicketById,
    createTicket,
    updateTicket,
    assignTicket,
    changeTicketStatus,
    calculateTicketProgress,
    autoAssignTicket
  };