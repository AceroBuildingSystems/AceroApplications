// src/services/endpoints/ticketCommentApi.ts
import { baseApi } from '../api';

export interface TicketCommentApiResponse {
  status: string;
  message?: string;
  data?: any;
  error?: any;
}

export interface TicketCommentParams {
  ticketId: string;
}

export const ticketCommentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTicketComments: builder.query<TicketCommentApiResponse, TicketCommentParams>({
      query: ({ ticketId }) => `ticket-comment?ticketId=${ticketId}`,
      transformResponse: (response: TicketCommentApiResponse) => response,
      providesTags: ['TicketComment'],
    }),

    createTicketComment: builder.mutation<TicketCommentApiResponse, any>({
      query: (commentData) => ({
        url: 'ticket-comment',
        method: 'POST',
        body: { action: 'create', data: commentData },
      }),
      invalidatesTags: ['TicketComment'],
    }),

    updateTicketComment: builder.mutation<TicketCommentApiResponse, any>({
      query: (commentData) => ({
        url: 'ticket-comment',
        method: 'POST',
        body: { action: 'update', data: commentData },
      }),
      invalidatesTags: ['TicketComment'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTicketCommentsQuery,
  useCreateTicketCommentMutation,
  useUpdateTicketCommentMutation,
} = ticketCommentApi;