import { crudManager } from '@/server/managers/crudManager';
import { IActivityLog } from '@/models/ActivityLog.model';
import { MONGO_MODELS, SUCCESS, ERROR } from '@/shared/constants';

interface GetActivityLogsOptions {
  filter?: object;
}

interface CreateActivityLogOptions {
  data: Partial<IActivityLog>;
}

export const getActivityLogs = async (options: GetActivityLogsOptions): Promise<{ status: string; message?: string; data?: IActivityLog[] }> => {
  try {
    const result = await crudManager.mongooose.find(MONGO_MODELS.ACTIVITY_LOG_MASTER, options);
    return result;
  } catch (error: any) {
    console.error(error);
    return { status: ERROR, message: error.message };
  }
};

export const createActivityLog = async (options: CreateActivityLogOptions): Promise<{ status: string; message?: string; data?: IActivityLog }> => {
  try {
    const result = await crudManager.mongooose.create(MONGO_MODELS.ACTIVITY_LOG_MASTER, options);
    return result;
  } catch (error: any) {
    console.error(error);
    return { status: ERROR, message: error.message };
  }
};