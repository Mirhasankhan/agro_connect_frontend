import { JWTDecode } from "@/utils/jwt";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://agro.smtsigma.com/api/v1",
    prepareHeaders: (headers) => {
      const { token } = JWTDecode();

      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Product",
    "Category",
    "Cart",
    "Wishlist",
    "Order",
    "ShippingAddress",
    "Payment",
    "Feedback",
    "Conversation",
  ],
  endpoints: () => ({}),
});
