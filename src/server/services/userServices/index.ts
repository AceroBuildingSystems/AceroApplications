import { crudManager } from '@/server/managers/crudManager';
import { catchAsync } from '@/server/shared/catchAsync';
import { MONGO_MODELS } from '@/shared/constants';


export const getUsers = catchAsync(async () => {
  const result = await crudManager.mongooose.find(MONGO_MODELS.USER_MASTER, {
    filter: {},
    sort: { empId: 'desc' },
    distinct: 'role1'
  });

  return result;
});
