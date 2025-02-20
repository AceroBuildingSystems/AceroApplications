export type department = {
    _id:string,
    name:string,
    description:string
}

export type location = {
    _id:string,
    name:string,
    countryId:string,
    stateId:string,
    regionId:string,
    continentId:string
}

export type AssetCategory = {
    _id: string;
    name: string;
    description: string;
    variationSchema: any;
}

export type Asset = {
    assetModelId: string;
    assetVariationData: any;
    serialNumber: string;
    departmentId: string;
    employeeId: string;
    status: string;
    locationId: string;
    vendorId: string;
    purchaseDate: Date;
}

export type AssetVariation = {
    modelId: string;
    specification: object;
}