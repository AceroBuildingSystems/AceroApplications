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
        body: commentData,
      }),
      // Add logging to help debug
      onQueryStarted: async (commentData, { dispatch, queryFulfilled }) => {
        console.log('Creating comment with data:', JSON.stringify(commentData, null, 2));
        try {
          const { data } = await queryFulfilled;
          console.log('Comment creation response:', data);
        } catch (error) {
          console.error('Comment creation failed:', error);
        }
      },
      invalidatesTags: ['TicketComment'],
    }),

    updateTicketComment: builder.mutation<TicketCommentApiResponse, any>({
      query: (commentData) => ({
        url: 'ticket-comment',
        method: 'POST',
        body: commentData,
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