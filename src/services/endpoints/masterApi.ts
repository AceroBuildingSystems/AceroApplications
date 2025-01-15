import { baseApi } from '../api';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMaster: builder.query<any[], { db: string; filter?: object; sort?: object; page?: number; limit?: number }>({
      query: ({ db, filter, sort, page, limit }) => {
        // Construct query parameters dynamically
        const params = new URLSearchParams();
        params.append('db', db);

        filter && params.append('filter', JSON.stringify(filter));
        sort &&  params.append('sort', JSON.stringify(sort));
        page && params.append('page', page.toString());
        limit && params.append('limit', limit.toString());
    
        return `master?${params.toString()}`;
      },
      // Transform response if needed
      transformResponse: (response: any[]) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMasterQuery, // Query hook for fetching master data
} = usersApi;
