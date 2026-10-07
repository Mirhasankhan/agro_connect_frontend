import { baseApi } from "../../api/baseApi";
import {
  TApiResponse,
  TOrder,
  TOrderItem,
  TPaginationMeta,
  OrderStatus,
  PaymentStatus,
} from "@/types";

export interface OrderQueryParams {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  page?: number | string;
  limit?: number | string;
}

const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<
      TApiResponse<{ orderId: string; checkOutUrl: string }>,
      { shippingAddressId: string; cartIds: string[] }
    >({
      query: (data) => ({
        url: "/order/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order", "Cart"],
    }),

    getUserOrders: builder.query<
      TApiResponse<{ orders: TOrder[]; meta: TPaginationMeta }>,
      OrderQueryParams | void
    >({
      query: (params) => ({
        url: "/order/user-wise",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Order"],
    }),

    getOrderDetails: builder.query<TApiResponse<TOrder>, string>({
      query: (id) => ({
        url: `/order/details/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    getProducerWiseOrders: builder.query<
      TApiResponse<{ orderItems: TOrderItem[]; meta: TPaginationMeta }>,
      OrderQueryParams | void
    >({
      query: (params) => ({
        url: "/order/producer-wise",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Order"],
    }),

    markOrderItemSentToHub: builder.mutation<TApiResponse<null>, string>({
      query: (id) => ({
        url: `/order/mark-sent-to-hub/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Order"],
    }),

    markDeliveryStatus: builder.mutation<
      TApiResponse<null>,
      { deliveryId: string; status: "PickedUp" | "Cancelled" }
    >({
      query: (data) => ({
        url: "/order/delivery/update-status",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Order"],
    }),

    sendDeliveryCompletionOtp: builder.mutation<TApiResponse<null>, string>({
      query: (deliveryId) => ({
        url: `/order/send-completion-otp/${deliveryId}`,
        method: "PATCH",
      }),
    }),

    verifyDeliveryCompletionOtp: builder.mutation<
      TApiResponse<null>,
      { deliveryId: string; otp: string }
    >({
      query: (data) => ({
        url: "/order/verify-completion-otp",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order", "Payment"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetUserOrdersQuery,
  useGetOrderDetailsQuery,
  useGetProducerWiseOrdersQuery,
  useMarkOrderItemSentToHubMutation,
  useMarkDeliveryStatusMutation,
  useSendDeliveryCompletionOtpMutation,
  useVerifyDeliveryCompletionOtpMutation,
} = orderApi;
