import { baseApi } from '../api';

interface InventoryApiResponse {
    status: string;
    message?: string;
    data?: any;
    error?: any;
}

interface QueryParams {
    filter?: object;
    sort?: object;
    populate?: string[];
}

export const inventoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Product Category Endpoints
        getProductCategories: builder.query<any[], QueryParams>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                searchParams.append('model', 'category');
                if (params?.filter) searchParams.append('filter', JSON.stringify(params.filter));
                if (params?.sort) searchParams.append('sort', JSON.stringify(params.sort));
                if (params?.populate) searchParams.append('populate', JSON.stringify(params.populate));
                return `inventory?${searchParams.toString()}`;
            },
            transformResponse: (response: InventoryApiResponse) => response.data,
            providesTags: ['Assets']
        }),

        createProductCategory: builder.mutation<InventoryApiResponse, any>({
            query: (data) => ({
                url: 'inventory',
                method: 'POST',
                body: {
                    model: 'category',
                    action: 'create',
                    data
                }
            }),
            invalidatesTags: ['Assets']
        }),

        updateProductCategory: builder.mutation<InventoryApiResponse, any>({
            query: (data) => ({
                url: 'inventory',
                method: 'POST',
                body: {
                    model: 'category',
                    action: 'update',
                    data
                }
            }),
            invalidatesTags: ['Assets']
        }),

        deleteProductCategory: builder.mutation<InventoryApiResponse, string>({
            query: (id) => ({
                url: 'inventory',
                method: 'POST',
                body: {
                    model: 'category',
                    action: 'delete',
                    data: { _id: id }
                }
            }),
            invalidatesTags: ['Assets']
        }),

        // Product Endpoints
        getProducts: builder.query<any[], QueryParams>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                searchParams.append('model', 'product');
                if (params?.filter) searchParams.append('filter', JSON.stringify(params.filter));
                if (params?.sort) searchParams.append('sort', JSON.stringify(params.sort));
                if (params?.populate) searchParams.append('populate', JSON.stringify(params.populate));
                return `inventory?${searchParams.toString()}`;
            },
            transformResponse: (response: InventoryApiResponse) => response.data,
            providesTags: ['Assets']
        }),

        createProduct: builder.mutation<InventoryApiResponse, any>({
            query: (data) => ({
                url: 'inventory',
                method: 'POST',
                body: {
                    model: 'product',
                    action: 'create',
                    data
                }
            }),
            invalidatesTags: ['Assets']
        }),

        updateProduct: builder.mutation<InventoryApiResponse, any>({
            query: (data) => ({
                url: 'inventory',
                method: 'POST',
                body: {
                    model: 'product',
                    action: 'update',
                    data
                }
            }),
            invalidatesTags: ['Assets']
        }),

        deleteProduct: builder.mutation<InventoryApiResponse, string>({
            query: (id) => ({
                url: 'inventory',
                method: 'POST',
                body: {
                    model: 'product',
                    action: 'delete',
                    data: { _id: id }
                }
            }),
            invalidatesTags: ['Assets']
        }),

        // Warehouse Endpoints
        getWarehouses: builder.query<any[], QueryParams>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                searchParams.append('model', 'warehouse');
                if (params?.filter) searchParams.append('filter', JSON.stringify(params.filter));
                if (params?.sort) searchParams.append('sort', JSON.stringify(params.sort));
                if (params?.populate) searchParams.append('populate', JSON.stringify(params.populate));
                return `inventory?${searchParams.toString()}`;
            },
            transformResponse: (response: InventoryApiResponse) => response.data,
            providesTags: ['Assets']
        }),

        createWarehouse: builder.mutation<InventoryApiResponse, any>({
            query: (data) => ({
                url: 'inventory',
                method: 'POST',
                body: {
                    model: 'warehouse',
                    action: 'create',
                    data
                }
            }),
            invalidatesTags: ['Assets']
        }),

        updateWarehouse: builder.mutation<InventoryApiResponse, any>({
            query: (data) => ({
                url: 'inventory',
                method: 'POST',
                body: {
                    model: 'warehouse',
                    action: 'update',
                    data
                }
            }),
            invalidatesTags: ['Assets']
        }),

        deleteWarehouse: builder.mutation<InventoryApiResponse, string>({
            query: (id) => ({
                url: 'inventory',
                method: 'POST',
                body: {
                    model: 'warehouse',
                    action: 'delete',
                    data: { _id: id }
                }
            }),
            invalidatesTags: ['Assets']
        }),
    }),
    overrideExisting: false
});

export const {
    // Product Category hooks
    useGetProductCategoriesQuery,
    useCreateProductCategoryMutation,
    useUpdateProductCategoryMutation,
    useDeleteProductCategoryMutation,
    // Product hooks
    useGetProductsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    // Warehouse hooks
    useGetWarehousesQuery,
    useCreateWarehouseMutation,
    useUpdateWarehouseMutation,
    useDeleteWarehouseMutation,
} = inventoryApi;