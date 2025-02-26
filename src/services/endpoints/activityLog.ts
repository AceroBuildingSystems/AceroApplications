import { baseApi } from '../api';
import { IActivityLog } from '@/models/ActivityLog.model';

interface GetActivityLogsParams {
  filter?: object;
}

const activityLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivityLogs: builder.query<IActivityLog[], GetActivityLogsParams | void>({
      query: (params) => {
        let url = '/activity-logs';
        const searchParams = new URLSearchParams();
        if (params?.filter) {
          Object.entries(params.filter).forEach(([key, value]) => {
            searchParams.append(key, value as string);
          });
          url += `?${searchParams.toString()}`;
        }
        return {
          url,
          method: 'GET',
        };
      },
      providesTags: ['ActivityLog'],
    }),
    createActivityLog: builder.mutation<IActivityLog, Partial<IActivityLog>>({
      query: (body) => ({
        url: '/activity-logs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ActivityLog'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetActivityLogsQuery, useCreateActivityLogMutation } = activityLogApi;