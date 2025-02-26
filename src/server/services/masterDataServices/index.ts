import { crudManager } from '@/server/managers/crudManager';
import { catchAsync } from '@/server/shared/catchAsync';
import { activityLogManager } from '@/server/managers/activityLogManager';
import { ERROR, SUCCESS } from '@/shared/constants';

export const getMasterData = catchAsync(async (options) => {
  const {db,operations} = options
  const result = await crudManager.mongooose.find(options.db, operations);
  return result;
});

export const updateMasterData = catchAsync(async (options:any) => {
  const { db, data, filter, recordActivity = false } = options;
  const result = await crudManager.mongooose.update(db, { ...options, returnOriginal: recordActivity });
  if (result.status === 'SUCCESS' && recordActivity && result.oldData) {
    await activityLogManager.createActivityLog({
      userId:options?.data?.updatedBy,
      action: 'update',
      module: db,
      recordId: filter._id,
      outcome: SUCCESS,
      details: {
        newData: data,
        oldData: result.oldData,
      },
    });
  }else{
    await activityLogManager.createActivityLog({
      userId:options?.data?.updatedBy,
      action: 'update',
      module: db,
      recordId: filter._id,
      outcome: ERROR,
      details: {},
    });
  }
  return result;
});

export const createMasterData = catchAsync(async (options:any) => {
  const { db, data } = options;
  const result = await crudManager.mongooose.create(db, options);
  if (result.status === 'SUCCESS') {
    await activityLogManager.createActivityLog({
      userId:options?.data?.updatedBy,
      action: 'create',
      module: db,
      recordId: result.data._id,
      outcome: SUCCESS,
      details: data,
    });
  }else{
    await activityLogManager.createActivityLog({
      userId:options?.data?.updatedBy,
      action: 'create',
      module: db,
      outcome: ERROR,
      details: {},
    });
  }
  return result;
});
