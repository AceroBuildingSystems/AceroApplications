import { crudManager } from '@/server/managers/crudManager';
import { catchAsync } from '@/server/shared/catchAsync';

export const getMasterData = catchAsync(async (options) => {
  const result = await crudManager.mongooose.find(options.db, {});
  return result;
});

export const updateMasterData = catchAsync(async (options:any) => {
  const result = await crudManager.mongooose.update(options.db, options);
  return result;
});

export const createMasterData = catchAsync(async (options:any) => {
  const result = await crudManager.mongooose.create(options.db, options);
  return result;
});
