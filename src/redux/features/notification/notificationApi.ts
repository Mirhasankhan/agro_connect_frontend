import { baseApi } from "../../api/baseApi";
import {
  TApiResponse,
  TNotification,
  TNotificationType,
  TPaginationMeta,
} from "@/types";

export interface NotificationQueryParams {
  notificationType?: TNotificationType;
  page?: number | string;
  limit?: number | string;
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserNotifications: builder.query<
      TApiResponse<{ notifications: TNotification[]; meta: TPaginationMeta }>,
      NotificationQueryParams | void
    >({
      query: (params) => ({
        url: "/notification/user-wise",
        method: "GET",
        params: params || {},
      }),
      providesTags: ["Notification"],
    }),

    getUnreadNotificationCount: builder.query<
      TApiResponse<{ unreadCount: number }>,
      void
    >({
      query: () => ({
        url: "/notification/unread-count",
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetUserNotificationsQuery,
  useLazyGetUserNotificationsQuery,
  useGetUnreadNotificationCountQuery,
} = notificationApi;

