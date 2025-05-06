import { baseApi } from '../api';

// Define types for requisition data
export interface RequisitionData {
  _id?: string;
  title: string;
  description: string;
  department: string;
  position: string;
  count: number;
  skills: string[];
  experience: string;
  requestedBy: string;
  status: string;
  priority: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  addedBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Define response and request parameter types
export interface RequisitionApiResponse {
  data: RequisitionData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface RequisitionParams {
  status?: string;
  department?: string;
  requestedBy?: string;
  page?: number;
  limit?: number;
  filter?: object;
  sort?: object;
}

export const requisitionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRequisitions: builder.query<RequisitionApiResponse, RequisitionParams>({
      query: ({ status, department, requestedBy, page = 1, limit = 10, filter, sort }) => {
        const params = new URLSearchParams();
        status && params.append('status', status);
        department && params.append('department', department);
        requestedBy && params.append('requestedBy', requestedBy);
        page && params.append('page', page.toString());
        limit && params.append('limit', limit.toString());
        filter && params.append('filter', JSON.stringify(filter));
        sort && params.append('sort', JSON.stringify(sort));
        
        return `hiring/requisitions?${params.toString()}`;
      },
      transformResponse: (response: RequisitionApiResponse) => response,
      providesTags: ['Requisition'],
    }),

    getRequisitionById: builder.query<RequisitionData, string>({
      query: (id) => `hiring/requisitions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Requisition', id }],
    }),

    createRequisition: builder.mutation<{ message: string; data: RequisitionData }, Partial<RequisitionData>>({
      query: (requisitionData) => ({
        url: 'hiring/requisitions',
        method: 'POST',
        body: requisitionData,
      }),
      invalidatesTags: ['Requisition'],
    }),

    updateRequisition: builder.mutation<{ message: string; data: RequisitionData }, { id: string; data: Partial<RequisitionData> }>({
      query: ({ id, data }) => ({
        url: `hiring/requisitions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Requisition', id },
        'Requisition'
      ],
    }),

    changeRequisitionStatus: builder.mutation<{ message: string; data: RequisitionData }, { id: string; status: string; comments?: string }>({
      query: ({ id, status, comments }) => ({
        url: `hiring/requisitions/${id}/status`,
        method: 'PATCH',
        body: { status, comments },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Requisition', id },
        'Requisition'
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRequisitionsQuery,
  useGetRequisitionByIdQuery,
  useCreateRequisitionMutation,
  useUpdateRequisitionMutation,
  useChangeRequisitionStatusMutation,
  useLazyGetRequisitionsQuery,
} = requisitionApi; 