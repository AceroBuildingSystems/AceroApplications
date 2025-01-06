import { baseApi } from '../api'
import { UserDocument } from '@/types'

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UserDocument[], void>({
      query: () => 'user',
      // Transform response if needed
      transformResponse: (response: UserDocument[]) => response,
      providesTags: ['User'],
    }),

    getUserById: builder.query<UserDocument, string>({
      query: (id) => `user/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    createUser: builder.mutation<UserDocument, UserDocument>({
      query: (userData) => ({
        url: 'user',
        method: 'POST',
        body: userData,
      }),
      // Invalidate relevant cache tags after mutation
      invalidatesTags: ['User'],
    }),

    updateUser: builder.mutation<UserDocument, UserDocument>({
      query: (userData) => ({
        url: `user/${userData._id}`,
        method: 'PUT',
        body: userData,
      }),
      // Invalidate relevant cache tags after mutation
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation
} = usersApi 
