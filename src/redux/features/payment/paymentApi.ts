import { baseApi } from "../../api/baseApi";
import {
  TApiResponse,
  TProducerEarning,
  TDriverEarning,
  TPaginationMeta,
  TEarningChartPoint,
  TEarningChartType,
} from "@/types";

export interface PaymentQueryParams {
  search?: string;
  isTransferred?: boolean;
  page?: number | string;
  limit?: number | string;
}

const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducerWisePayments: builder.query<
      TApiResponse<{
        payments: TProducerEarning[];
        pagination: TPaginationMeta;
        earningSummary?: { amount?: number };
      }>,
      PaymentQueryParams | void
    >({
      query: (params) => ({
        url: "/payment/producer-wise",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Payment"],
    }),

    getDriverWisePayments: builder.query<
      TApiResponse<{
        payments: TDriverEarning[];
        pagination: TPaginationMeta;
        earningSummary?: { amount?: number };
      }>,
      PaymentQueryParams | void
    >({
      query: (params) => ({
        url: "/payment/driver-wise",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Payment"],
    }),

    getProducerEarningChart: builder.query<
      TApiResponse<TEarningChartPoint[]>,
      { type: TEarningChartType }
    >({
      query: ({ type }) => ({
        url: "/payment/producer-earning-chart",
        method: "GET",
        params: { type },
      }),
      providesTags: ["Payment"],
    }),

    getDriverEarningChart: builder.query<
      TApiResponse<TEarningChartPoint[]>,
      { type: TEarningChartType }
    >({
      query: ({ type }) => ({
        url: "/payment/driver-earning-chart",
        method: "GET",
        params: { type },
      }),
      providesTags: ["Payment"],
    }),
  }),
});

export const {
  useGetProducerWisePaymentsQuery,
  useGetDriverWisePaymentsQuery,
  useGetProducerEarningChartQuery,
  useGetDriverEarningChartQuery,
} = paymentApi;

