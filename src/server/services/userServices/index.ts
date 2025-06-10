import { crudManager } from "@/server/managers/crudManager";
import { catchAsync } from "@/server/shared/catchAsync";
import { INSUFFIENT_DATA, MONGO_MODELS } from "@/shared/constants";
import mongoose from 'mongoose'; // Added for UserForFlow type
import { UserDocument } from '@/types/master/user.types'; // Assuming this is the correct path for UserDocument type
import { QueryResult } from '@/server/Engines/DbEngine/types'; // For typing the result of crudManager

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
    const result = await crudManager.mongooose.updateInArray(
      MONGO_MODELS.USER_MASTER,
      options.data
    );
    return result;
  }
);

// Define a type for the user information needed for the flow
export interface UserForFlow {
  _id: mongoose.Types.ObjectId | string;
  firstName: string;
  lastName: string;
  email: string;
  fullName?: string;
}

/**
 * Fetches all active users with minimal details required for approval flow selection.
 * Uses crudManager and catchAsync pattern.
 */
export const getAllUsersForFlow = catchAsync(async (): Promise<QueryResult> => {
  const result: QueryResult = await crudManager.mongooose.find(
    MONGO_MODELS.USER_MASTER,
    {
      filter: { isActive: true }, // Filter: only active users
      select: ['_id', 'firstName', 'lastName', 'email'] // Options: select specific fields
    }
  );

  if (result.status === 'error' || !result.data) {
    // catchAsync should handle throwing an error, but good to be explicit if needed
    // For now, we assume crudManager.mongooose.find returns a structure that catchAsync can interpret
    // or that it throws on error, which catchAsync handles.
    // If crudManager returns a QueryResult with status 'error', we might need to throw here.
    // For consistency with existing functions, we return the result object.
    // However, for this specific use case, transforming data or throwing might be better.
    // Let's proceed by transforming if successful, and let catchAsync handle if crudManager throws.
    // If crudManager.find itself returns a QueryResult error, this needs careful handling.

    // Assuming crudManager.find throws on actual DB error or returns QueryResult with error status for logical errors.
    // If it's a QueryResult error status, we should probably throw an error here to be caught by catchAsync.
    if (result.status === 'error') {
        throw new Error(result.message || 'Failed to fetch users from database via crudManager.');
    }
    // If data is null/undefined but status is success (unlikely for find), also an issue.
    if (!result.data) {
        throw new Error('No data returned when fetching users, though no explicit error reported.');
    }
  }

  // Transform UserDocument[] to UserForFlow[]
  const usersForFlow: UserForFlow[] = (result.data as UserDocument[]).map((user: UserDocument) => ({
    _id: user._id!,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    fullName: `${user.firstName} ${user.lastName}`
  }));

  // The catchAsync wrapper expects the successful data to be returned directly.
  // If crudManager.mongooose.find returns a QueryResult, and we want to return UserForFlow[],
  // we should return usersForFlow directly here. catchAsync handles wrapping it into a success response for the API.
  // However, existing functions return 'result'. For consistency, let's see if we can adapt.
  // The existing functions (getUsers, createUser, etc.) return the direct 'result' from crudManager.
  // This implies the API routes using these services expect a QueryResult.
  // So, we should wrap our transformed data back into a QueryResult-like structure if we want to maintain that pattern
  // OR change how API routes handle responses from services wrapped by catchAsync.

  // For now, let's return the transformed data directly, assuming catchAsync handles the response structure.
  // If API routes expect QueryResult, this will need adjustment in the API route or here.
  // Given the other functions return 'result', it's safer to mimic that structure for now.
  return {
    status: 'success',
    message: 'Successfully fetched users for flow.',
    data: usersForFlow as any, // QueryResult.data is 'any'
  };
});
