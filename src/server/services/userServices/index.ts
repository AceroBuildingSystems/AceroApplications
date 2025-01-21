import { crudManager } from "@/server/managers/crudManager";
import { catchAsync } from "@/server/shared/catchAsync";
import { INSUFFIENT_DATA, MONGO_MODELS } from "@/shared/constants";

export const getUsers = catchAsync(async ({ filter }: { filter: any }) => {
  const result = await crudManager.mongooose.find(MONGO_MODELS.USER_MASTER, {
    filter,
    sort: { empId: "desc" },
  });

  return result;
});

export const createUser = catchAsync(async (options: any) => {
  const result = await crudManager.mongooose.create(
    MONGO_MODELS.USER_MASTER,
    options
  );
  return result;
});



export const updateUser = catchAsync(async (options: any) => {
  const result = await crudManager.mongooose.update(
    MONGO_MODELS.USER_MASTER,
    options
  );
  return result;
});


//ADD and Update Access are the same function
export const updateAccess = catchAsync(
  async (options: {
    data: {
      id: string;
      arrayProperty: string;
      arrayFilter: object;
      data: object;
      addIfNotFound?: boolean;
    };
  }) => {
    if (
      !options.data.id 
    ) {
      return { status:500, message:INSUFFIENT_DATA };
    }
    const result = await crudManager.mongooose.updateInArray(
      MONGO_MODELS.USER_MASTER,
      options.data
    );
    return result;
  }
);
