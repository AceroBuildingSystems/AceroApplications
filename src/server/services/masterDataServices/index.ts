import { crudManager } from '@/server/managers/crudManager';
import { catchAsync } from '@/server/shared/catchAsync';
import { MONGO_MODELS } from '@/shared/constants';


export const getMasterData = catchAsync(async (options) => {
  const result = await crudManager.mongooose.find(options.db, {});
  return result;
});

export const createMasterData = catchAsync(async (options:any) => {
  console.log("options", options)
  const result = await crudManager.mongooose.create(options.db, options);
  return result;
});
