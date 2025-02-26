import { crudManager } from '@/server/managers/crudManager';
import { catchAsync } from '@/server/shared/catchAsync';
import { activityLogManager } from '@/server/managers/activityLogManager';

export const getMasterData = catchAsync(async (options) => {
  const {db,operations} = options
  const result = await crudManager.mongooose.find(options.db, operations);
  return result;
});

export const updateMasterData = catchAsync(async (options:any) => {
  const { db, data, filter, userId, recordActivity = false } = options;
  const result = await crudManager.mongooose.update(db, { ...options, returnOriginal: false, recordActivity });
  if (result.status === 'SUCCESS' && recordActivity && result.oldData) {
    await activityLogManager.createActivityLog({
      userId,
      action: 'update',
      module: db,
      recordId: filter._id,
      outcome: 'success',
      details: {
        newData: data,
        oldData: result.oldData,
      },
    });
  }
  return result;
});

export const createMasterData = catchAsync(async (options:any) => {
  const { db, data, userId } = options;
  const result = await crudManager.mongooose.create(db, options);
  if (result.status === 'SUCCESS') {
    await activityLogManager.createActivityLog({
      userId,
      action: 'create',
      module: db,
      recordId: result.data._id,
      outcome: 'success',
      details: data,
    });
  }
  return result;
});
