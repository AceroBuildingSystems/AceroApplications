import { baseApi } from '../api'
import { UserDocument } from '@/types'

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UserDocument[], void>({
      query: () => 'users',
      // Transform response if needed
      transformResponse: (response: UserDocument[]) => 
        response.map(user => ({
          ...user,
          fullName: `${user.firstName} ${user.lastName}`,
        })),
      providesTags: ['User'],
    }),

    getUserById: builder.query<UserDocument, string>({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    createUser: builder.mutation<UserDocument, UserDocument>({
      query: (userData) => ({
        url: 'users',
        method: 'POST',
        body: userData,
      }),
      // Invalidate relevant cache tags after mutation
      invalidatesTags: ['User'],
    }),

    updateUser: builder.mutation<UserDocument, UserDocument>({
      query: (userData) => ({
        url: `users/${userData._id}`,
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
} = usersApi 