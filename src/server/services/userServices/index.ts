import { User } from "@/models"
import { catchAsync } from "@/server/shared/catchAsync"

export const getUsers = catchAsync(async () => {    
  const users = await User.find();

  if(!users){
    return { status: "error", message: "No users found" };
  }
  return { status: "success", data: users };
});
