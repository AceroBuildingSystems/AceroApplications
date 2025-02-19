import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const inventoryApi = createApi({
  reducerPath: 'inventoryApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  tagTypes: ['Assets', 'Vendors', 'Inventories'],
  endpoints: (builder) => ({
    getAssets: builder.query({
      query: () => 'assets',
      providesTags: ['Assets'],
    }),
    addAsset: builder.mutation({
      query: (asset) => ({
        url: 'assets',
        method: 'POST',
        body: asset,
      }),
      invalidatesTags: ['Assets'],
    }),
    getVendors: builder.query({
      query: () => 'vendors',
      providesTags: ['Vendors'],
    }),
    addVendor: builder.mutation({
      query: (vendor) => ({
        url: 'vendors',
        method: 'POST',
        body: vendor,
      }),
      invalidatesTags: ['Vendors'],
    }),
    getInventories: builder.query({
      query: () => 'inventories',
      providesTags: ['Inventories'],
    }),
    addInventory: builder.mutation({
      query: (inventory) => ({
        url: 'inventories',
        method: 'POST',
        body: inventory,
      }),
      invalidatesTags: ['Inventories'],
    }),
  }),
});

export const {
  useGetAssetsQuery,
  useAddAssetMutation,
  useGetVendorsQuery,
  useAddVendorMutation,
  useGetInventoriesQuery,
  useAddInventoryMutation,
} = inventoryApi;
