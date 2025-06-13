// src/services/endpoints/ticketApi.ts
import { baseApi } from '../api';

export interface TicketApiResponse {
  status: string;
  message?: string;
  data?: any;
  pagination?: any;
  error?: any;
}

export interface TicketParams {
  filter?: object;
  sort?: object;
  page?: number;
  limit?: number;
  id?: string;
}

export const ticketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<TicketApiResponse, TicketParams>({
      query: ({ filter, sort, page, limit, id }) => {
        const params = new URLSearchParams();
        filter && params.append('filter', JSON.stringify(filter));
        sort && params.append('sort', JSON.stringify(sort));
        page && params.append('page', page.toString());
        limit && params.append('limit', limit.toString());
        id && params.append('id', id);
        return `ticket?${params.toString()}`;
      },
      transformResponse: (response: TicketApiResponse) => {
        console.log("Ticket API response:", response);
        return response;
      },
      providesTags: (result) => {
        // Improve tag caching with more specific tags
        const tags = [{ type: 'Ticket' as const, id: 'LIST' }];
        if (result?.data) {
          // Add individual ticket tags for more precise invalidation
          const tickets = Array.isArray(result.data) ? result.data : [result.data];
          return [
            ...tags,
            ...tickets.map(ticket => ({ type: 'Ticket' as const, id: ticket._id }))
          ];
        }
        return tags;
      }
    }),

    createTicket: builder.mutation<TicketApiResponse, any>({
      query: (ticketData) => ({
        url: 'ticket',
        method: 'POST',
        body: ticketData,
      }),
      // Add onQueryStarted to improve logging and debugging
      async onQueryStarted(ticketData, { dispatch, queryFulfilled }) {
        try {
          console.log("Starting ticket creation with data:", ticketData);
          const { data: response } = await queryFulfilled;
          console.log("Ticket creation successful:", response);
        } catch (error) {
          console.error("Ticket creation failed:", error);
        }
      },
      // Invalidate all ticket-related queries to ensure fresh data
      invalidatesTags: [{ type: 'Ticket', id: 'LIST' }],
    }),

    updateTicket: builder.mutation<TicketApiResponse, any>({
      query: (ticketData) => ({
        url: 'ticket',
        method: 'POST',
        body: { ...ticketData, action: 'update' },
      }),
      invalidatesTags: ['Ticket'],
    }),

    assignTicket: builder.mutation<TicketApiResponse, any>({
      query: (assignData) => ({
        url: 'ticket',
        method: 'POST',
        body: { action: 'assign', data: assignData },
      }),
      invalidatesTags: ['Ticket'],
    }),

    changeTicketStatus: builder.mutation<TicketApiResponse, any>({
      query: (statusData) => ({
        url: 'ticket',
        method: 'POST',
        body: { action: 'changeStatus', data: statusData },
      }),
      invalidatesTags: ['Ticket'],
    }),

    autoAssignTicket: builder.mutation<TicketApiResponse, any>({
      query: (assignData) => ({
        url: 'ticket',
        method: 'POST',
        body: { action: 'autoAssign', data: assignData },
      }),
      invalidatesTags: ['Ticket'],
    }),
    
    updateTicketAssignees: builder.mutation<TicketApiResponse, any>({
      query: (assigneesData) => ({
        url: 'ticket',
        method: 'POST',
        body: { action: 'updateAssignees', data: assigneesData },
      }),
      invalidatesTags: ['Ticket'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useAssignTicketMutation,
  useChangeTicketStatusMutation,
  useAutoAssignTicketMutation,
  useUpdateTicketAssigneesMutation,
} = ticketApi;