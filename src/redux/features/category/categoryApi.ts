import { baseApi } from "../../api/baseApi";
import { TApiResponse, TCategory } from "@/types";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCategories: builder.query<
      TApiResponse<{ categories: TCategory[] }>,
      void
    >({
      query: () => ({
        url: "/admin/all-categories",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),
  }),
});

export const { useGetAllCategoriesQuery } = categoryApi;
