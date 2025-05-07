import { baseApi } from '../api';

// Define types for approval flow data
export interface ApprovalFlowTemplateData {
  _id: string;
  name: string;
  description: string;
  entityType: string;
  isActive: boolean;
  nodes: {
    id: string;
    type: 'user' | 'role' | 'department';
    entityId: string;
    positionX: number;
    positionY: number;
    label: string;
  }[];
  connections: {
    sourceId: string;
    targetId: string;
    label: string;
    condition: string;
  }[];
  createdBy: string | { _id: string; fullName: string };
  updatedBy: string | { _id: string; fullName: string };
  createdAt: string;
  updatedAt: string;
}

// Define response types
export interface ApprovalFlowsResponse {
  flowTemplates: ApprovalFlowTemplateData[];
}

export interface ApprovalFlowResponse {
  flowTemplate: ApprovalFlowTemplateData;
}

export const approvalFlowsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApprovalFlows: builder.query<ApprovalFlowsResponse, void>({
      query: () => 'approvals/flows',
      providesTags: ['Approval'],
    }),

    getApprovalFlowById: builder.query<ApprovalFlowResponse, string>({
      query: (id) => `approvals/flows/${id}`,
      providesTags: (result, error, id) => [{ type: 'Approval', id }],
    }),

    createApprovalFlow: builder.mutation<{ message: string; flowTemplate: ApprovalFlowTemplateData }, Partial<ApprovalFlowTemplateData>>({
      query: (flowData) => ({
        url: 'approvals/flows',
        method: 'POST',
        body: flowData,
      }),
      invalidatesTags: ['Approval'],
    }),

    updateApprovalFlow: builder.mutation<{ message: string; flowTemplate: ApprovalFlowTemplateData }, { id: string; data: Partial<ApprovalFlowTemplateData> }>({
      query: ({ id, data }) => ({
        url: `approvals/flows/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Approval', id },
        'Approval'
      ],
    }),

    deleteApprovalFlow: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `approvals/flows/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Approval'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetApprovalFlowsQuery,
  useGetApprovalFlowByIdQuery,
  useCreateApprovalFlowMutation,
  useUpdateApprovalFlowMutation,
  useDeleteApprovalFlowMutation,
} = approvalFlowsApi; 