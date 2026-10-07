import { baseApi } from "../../api/baseApi";
import {
  TApiResponse,
  TProducerEarning,
  TDriverEarning,
  TPaginationMeta,
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
  }),
});

export const {
  useGetProducerWisePaymentsQuery,
  useGetDriverWisePaymentsQuery,
} = paymentApi;
