import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const transformData = (data, fieldsToAdd) => {
  const transformedData = data?.map((item) => {
    let transformedItem = { ...item };

    // Iterate over the fieldsToAdd object to add new fields to each item
    fieldsToAdd.forEach((field) => {
      const { fieldName, path } = field;

      // Get the value from the path and add it to the item with the fieldName
      const value = path.reduce((acc, part) => acc?.[part], item);
      transformedItem[fieldName] = value || '';  // Default to empty string if value doesn't exist
    });

    return transformedItem;
  });

  return transformedData;
};


export const organisationTransformData = (data) => {

 
  const transformedData = data?.map((organisation)=>{
    return {
      _id: organisation._id,
      name: organisation.address?.location || '', 
    };
  })
  
  return transformedData
};
