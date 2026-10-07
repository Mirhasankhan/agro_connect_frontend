import { baseApi } from "../../api/baseApi";
import { TApiResponse, TCartItem, TWishlistItem } from "@/types";

const shoppingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<TApiResponse<TCartItem[]>, void>({
      query: () => ({
        url: "/shopping/cart",
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),

    addToCart: builder.mutation<
      TApiResponse<null>,
      { productId: string; quantity: number }
    >({
      query: (data) => ({
        url: "/shopping/add-cart",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cart"],
    }),

    updateCartQuantity: builder.mutation<
      TApiResponse<null>,
      { cartId: string; increment: boolean }
    >({
      query: (data) => ({
        url: "/shopping/update-cart",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Cart"],
    }),

    removeFromCart: builder.mutation<TApiResponse<null>, string>({
      query: (id) => ({
        url: `/shopping/remove-cart/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    getWishlist: builder.query<TApiResponse<TWishlistItem[]>, void>({
      query: () => ({
        url: "/shopping/wishlist",
        method: "GET",
      }),
      providesTags: ["Wishlist"],
    }),

    addToWishlist: builder.mutation<TApiResponse<null>, string>({
      query: (productId) => ({
        url: `/shopping/add-wishlist/${productId}`,
        method: "POST",
      }),
      invalidatesTags: ["Wishlist", "Product"],
    }),

    removeFromWishlist: builder.mutation<TApiResponse<null>, string>({
      query: (wishlistId) => ({
        url: `/shopping/remove-wishlist/${wishlistId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist", "Product"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartQuantityMutation,
  useRemoveFromCartMutation,
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = shoppingApi;
