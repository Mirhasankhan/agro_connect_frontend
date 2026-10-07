import { baseApi } from "../../api/baseApi";
import { TApiResponse, TShippingAddress } from "@/types";

const shippingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShippingAddresses: builder.query<TApiResponse<TShippingAddress[]>, void>({
      query: () => ({
        url: "/shipping-address",
        method: "GET",
      }),
      providesTags: ["ShippingAddress"],
    }),

    createShippingAddress: builder.mutation<
      TApiResponse<null>,
      {
        addressLine: string;
        city: string;
        instruction: string;
        postCode: string;
      }
    >({
      query: (data) => ({
        url: "/shipping-address/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["ShippingAddress"],
    }),
  }),
});

export const {
  useGetShippingAddressesQuery,
  useCreateShippingAddressMutation,
} = shippingApi;
