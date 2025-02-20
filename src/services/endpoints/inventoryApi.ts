import { baseApi } from '@/services/api';
import { IVendor } from '@/models/master/Vendor.model';
import { IAssetCategory } from '@/models/master/AssetCategory.model';

interface GetVendorsResponse {
  vendors: IVendor[];
}

interface GetAssetCategoriesResponse {
  assetCategories: IAssetCategory[];
}

const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVendors: builder.query<GetVendorsResponse, void>({
      query: () => '/api/inventory/vendors',
      providesTags: ['Assets'],
    }),
    createVendor: builder.mutation({
      query: (vendor) => ({
        url: '/api/inventory/vendors',
        method: 'POST',
        body: vendor,
      }),
      invalidatesTags: ['Assets'],
    }),
    getAssetCategories: builder.query<GetAssetCategoriesResponse, void>({
      query: () => '/api/inventory/asset-categories',
      providesTags: ['Assets'],
    }),
    createAssetCategory: builder.mutation({
      query: (assetCategory) => ({
        url: '/api/inventory/asset-categories',
        method: 'POST',
        body: assetCategory,
      }),
      invalidatesTags: ['Assets'],
    }),
    getAssets: builder.query({
      query: () => '/api/inventory/assets',
      providesTags: ['Assets'],
    }),
    createAsset: builder.mutation({
      query: (asset) => ({
        url: '/api/inventory/assets',
        method: 'POST',
        body: asset,
      }),
      invalidatesTags: ['Assets'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useGetAssetCategoriesQuery,
  useCreateAssetCategoryMutation,
  useGetAssetsQuery,
  useCreateAssetMutation,
} = inventoryApi;