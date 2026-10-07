import { baseApi } from "../../api/baseApi";
import { TApiResponse } from "@/types";

const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitReview: builder.mutation<
      TApiResponse<null>,
      { orderItemId: string; rating: number; comment: string }
    >({
      query: (data) => ({
        url: "/feedback/submit-review",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order", "Product"],
    }),

    submitReport: builder.mutation<
      TApiResponse<null>,
      { orderItemId: string; reason: string }
    >({
      query: (data) => ({
        url: "/feedback/submit-report",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  useSubmitReviewMutation,
  useSubmitReportMutation,
} = feedbackApi;
