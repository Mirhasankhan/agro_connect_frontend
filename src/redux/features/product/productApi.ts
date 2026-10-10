import { baseApi } from "../../api/baseApi";
import {
  TApiResponse,
  TProduct,
  TPaginationMeta,
  SellingUnit,
  TProducerFarmInfo,
} from "@/types";

export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  sellingUnit?: SellingUnit;
  status?: "active" | "outOfStock";
  minPrice?: number | string;
  maxPrice?: number | string;
  sort?: "pricePerUnit" | "availableQuantity" | "avgRating" | "createdAt";
  order?: "asc" | "desc";
  page?: number | string;
  limit?: number | string;
}

const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllProducts: builder.query<
      TApiResponse<{ products: TProduct[]; meta: TPaginationMeta }>,
      ProductQueryParams | void
    >({
      query: (params) => ({
        url: "/product/all",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Product"],
    }),

    getProductDetails: builder.query<
      TApiResponse<{ product: TProduct; revenue: number }>,
      string
    >({
      query: (id) => ({
        url: `/product/details/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    getProducerProducts: builder.query<
      TApiResponse<{ products: TProduct[]; meta: TPaginationMeta }>,
      ProductQueryParams | void
    >({
      query: (params) => ({
        url: "/product/producer-wise",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation<TApiResponse<null>, FormData>({
      query: (formData) => ({
        url: "/product/create",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation<
      TApiResponse<null>,
      {
        productId: string;
        name?: string;
        description?: string;
        categoryId?: string;
        sellingUnit?: SellingUnit;
        pricePerUnit?: number;
        availableQuantity?: number;
        isActive?: boolean;
        isFeatured?: boolean;
      }
    >({
      query: (data) => ({
        url: "/product/update",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    updateProductImages: builder.mutation<TApiResponse<null>, FormData>({
      query: (formData) => ({
        url: "/product/update-images",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Product"],
    }),

    addPricingTier: builder.mutation<
      TApiResponse<null>,
      { productId: string; quantity: number; pricePerUnit: number }
    >({
      query: (data) => ({
        url: "/product/add-pricing-tier",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    getFarmInfo: builder.query<TApiResponse<TProducerFarmInfo>, string>({
      query: (id) => ({
        url: `/product/producer-info/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Product", id: `farm-${id}` }],
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useGetProductDetailsQuery,
  useGetProducerProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductImagesMutation,
  useAddPricingTierMutation,
  useGetFarmInfoQuery,
} = productApi;
