import { baseApi } from "../../api/baseApi";
import { TConversationItem } from "@/types";

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query<TConversationItem[], void>({
      query: () => ({
        url: "/conversations",
        method: "GET",
      }),
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) {
          return response as TConversationItem[];
        }
        if (
          response &&
          typeof response === "object" &&
          "data" in response &&
          Array.isArray((response as { data: unknown }).data)
        ) {
          return (response as { data: TConversationItem[] }).data;
        }
        return [];
      },
      providesTags: ["Conversation"],
    }),
  }),
});

export const { useGetConversationsQuery } = chatApi;
