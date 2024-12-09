import { crudManager } from '@/server/managers/crudManager';
import { catchAsync } from '@/server/shared/catchAsync';
import { ERROR } from '@/shared/constants';

export const getUsers = catchAsync(async () => {
  const result = await crudManager.mongooose.find('User', {
    filter: {},
    sort: { createdAt: 'desc' }
  });

  return result;
});
