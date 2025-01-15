import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const userTransformData = (data) => {

 
  const transformedData = data?.map((user)=>{
    return {
      ...user,
      roleName: user.role?.name || '',  // Add roleName field with the name from the role object
    };
  })
  
  return transformedData
};

export const organisationTransformData = (data) => {

 
  const transformedData = data?.map((organisation)=>{
    return {
      _id: organisation._id,
      name: organisation.address?.location || '',  // Add roleName field with the name from the role object
    };
  })
  
  return transformedData
};
