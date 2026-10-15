import { baseApi } from "../../api/baseApi";
import {
  TApiResponse,
  TOrder,
  TOrderItem,
  TPaginationMeta,
  OrderStatus,
  PaymentStatus,
  TDriverDeliverySummary,
  TDriverDeliveryDetails,
  TProducerOrderItemDetails,
  TReport,
  ReportStatus,
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
      providesTags: (result, error, id) => [{ type: "Order", id }, "Order"],
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

    getOrderItemDetailsForProducer: builder.query<
      TApiResponse<TProducerOrderItemDetails>,
      string
    >({
      query: (id) => ({
        url: `/order/item/details/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Order", id: `item-${id}` }, "Order"],
    }),

    getDriverWiseDeliveries: builder.query<
      TApiResponse<TDriverDeliverySummary[]>,
      void
    >({
      query: () => ({
        url: "/order/delivery-driver-wise",
        method: "GET",
      }),
      providesTags: ["Order"],
    }),

    getDriverDeliveryDetails: builder.query<
      TApiResponse<TDriverDeliveryDetails>,
      string
    >({
      query: (id) => ({
        url: `/order/delivery/details/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Order", id }],
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
      invalidatesTags: (result, error, id) => [
        "Order",
        { type: "Order", id },
      ],
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
      invalidatesTags: (result, error, arg) => [
        "Order",
        "Payment",
        { type: "Order", id: arg.deliveryId },
      ],
    }),

    getProducerReports: builder.query<
      TApiResponse<{ reports: TReport[]; meta: TPaginationMeta }>,
      { search?: string; status?: ReportStatus; page?: number | string; limit?: number | string } | void
    >({
      query: (params) => ({
        url: "/order/producer/reports",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Order"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetUserOrdersQuery,
  useGetOrderDetailsQuery,
  useGetProducerWiseOrdersQuery,
  useGetOrderItemDetailsForProducerQuery,
  useGetProducerReportsQuery,
  useGetDriverWiseDeliveriesQuery,
  useGetDriverDeliveryDetailsQuery,
  useMarkOrderItemSentToHubMutation,
  useMarkDeliveryStatusMutation,
  useSendDeliveryCompletionOtpMutation,
  useVerifyDeliveryCompletionOtpMutation,
} = orderApi;
