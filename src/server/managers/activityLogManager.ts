import * as activityLogServices from '@/server/services/activityLogServices';
import { IActivityLog } from '@/models/ActivityLog.model';
import { SUCCESS, ERROR } from '@/shared/constants';

interface GetActivityLogsOptions {
  filter?: object;
}

export const activityLogManager = {
  async getActivityLogs(options: GetActivityLogsOptions = {}): Promise<{ status: string; message?: string; data?: IActivityLog[] }> {
    try {
      const result = await activityLogServices.getActivityLogs(options);
      return result;
    } catch (error: any) {
      console.error(error);
      return { status: ERROR, message: error.message };
    }
  },

  async createActivityLog(activityLogData: Partial<IActivityLog>): Promise<{ status: string; message?: string; data?: IActivityLog }> {
    try {
      const result = await activityLogServices.createActivityLog({ data: activityLogData });
      return result;
    } catch (error: any) {
      console.error(error);
      return { status: ERROR, message: error.message };
    }
  },
};