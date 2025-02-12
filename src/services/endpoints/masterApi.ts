import { baseApi } from '../api';

interface MasterApiResponse {
  status: string;
  message?: string;
  data?: any;
  error?: any;
}

export const masterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMaster: builder.query<any[], { db: string; filter?: object; sort?: object; page?: number; limit?: number }>({
      query: ({ db, filter, sort, page, limit }) => {
        const params = new URLSearchParams();
        params.append('db', db);
        filter && params.append('filter', JSON.stringify(filter));
        sort && params.append('sort', JSON.stringify(sort));
        page && params.append('page', page.toString());
        limit && params.append('limit', limit.toString());
        return `master?${params.toString()}`;
      },
      transformResponse: (response: any[]) => response,
      providesTags: ['Master'],
    }),

    createMaster: builder.mutation<MasterApiResponse, any>({ // Use the MasterApiResponse type
      query: (masterData) => ({
        url: 'master',
        method: 'POST',
        body: masterData,
      }),
      invalidatesTags: ['Master'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMasterQuery,
  useCreateMasterMutation,
} = masterApi;
