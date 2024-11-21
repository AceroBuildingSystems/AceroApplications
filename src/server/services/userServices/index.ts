import { User } from "@/models"
import { catchAsync } from "@/server/shared/catchAsync"

export const getUsers = catchAsync(async () => {    
  const users = await User.find()
  return { status: "success", data: users };
});
