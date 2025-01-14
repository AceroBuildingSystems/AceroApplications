import { baseApi } from '../api'

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMaster: builder.query<any[], void>({
      query: (db:any) => `master?db=${db}`,
      // Transform response if needed
      transformResponse: (response: any[]) => response,
    }),
    
  }),
  overrideExisting: false,
})

export const {
  useGetMasterQuery
} = usersApi 
