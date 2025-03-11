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
  userId?: string;
  unreadCount?: boolean;
  search?: string;
}

export const ticketCommentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTicketComments: builder.query<TicketCommentApiResponse, TicketCommentParams>({
      query: ({ ticketId }) => `ticket-comment?ticketId=${ticketId}`,
      transformResponse: (response: TicketCommentApiResponse) => response,
      providesTags: ['TicketComment'],
    }),

    getUnreadCount: builder.query<TicketCommentApiResponse, { ticketId: string; userId: string }>({
      query: ({ ticketId, userId }) => 
        `ticket-comment?ticketId=${ticketId}&userId=${userId}&unreadCount=true`,
      transformResponse: (response: TicketCommentApiResponse) => response,
      providesTags: ['TicketComment'],
    }),

    searchMessages: builder.query<TicketCommentApiResponse, { ticketId: string; searchTerm: string }>({
      query: ({ ticketId, searchTerm }) => 
        `ticket-comment?ticketId=${ticketId}&search=${encodeURIComponent(searchTerm)}`,
      transformResponse: (response: TicketCommentApiResponse) => response,
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

    markAsRead: builder.mutation<TicketCommentApiResponse, { commentIds: string[]; userId: string }>({
      query: (data) => ({
        url: 'ticket-comment',
        method: 'POST',
        body: {
          action: 'markAsRead',
          data
        },
      }),
      invalidatesTags: ['TicketComment'],
    }),

    uploadFile: builder.mutation<any, FormData>({
      query: (formData) => {
        // Extract ticketId and userId from formData
        const ticketId = formData.get('ticketId');
        const userId = formData.get('userId');
        const file = formData.get('file');
        
        // Use our new upload endpoint with URL parameters
        return {
          url: `upload?ticketId=${ticketId}&userId=${userId}`,
          method: 'POST',
          body: file,
          // Set the correct headers for the file
          prepareHeaders: (headers: Headers) => {
            headers.set('Content-Type', (file as File).type || 'application/octet-stream');
            headers.set('Content-Disposition', `attachment; filename="${(file as File).name}"`);
            return headers;
          }
        };
      }
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTicketCommentsQuery,
  useGetUnreadCountQuery,
  useSearchMessagesQuery,
  useCreateTicketCommentMutation,
  useUpdateTicketCommentMutation,
  useMarkAsReadMutation,
  useUploadFileMutation,
} = ticketCommentApi;