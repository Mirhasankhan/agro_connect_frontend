import { baseApi } from "../../api/baseApi";
import { TApiResponse, TUser, UserRole } from "@/types";

interface LoginResponse {
  accessToken: string;
  role: UserRole;
  isSetuCompleted: boolean;
}

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<
      TApiResponse<null>,
      { fullName: string; email: string; password: string; role: UserRole }
    >({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),

    verifyRegistration: builder.mutation<
      TApiResponse<{ id: string; role: UserRole; accessToken: string } | null>,
      { email: string; otp: string; fcmToken?: string }
    >({
      query: (data) => ({
        url: "/auth/verify-registration",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    login: builder.mutation<
      TApiResponse<LoginResponse>,
      { email: string; password: string; fcmToken?: string }
    >({
      query: (userInfo) => ({
        url: "/auth/login",
        method: "POST",
        body: userInfo,
      }),
      invalidatesTags: ["User"],
    }),

    getProfile: builder.query<TApiResponse<TUser>, void>({
      query: () => ({
        url: "/auth/profile",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    updateProfile: builder.mutation<TApiResponse<null>, FormData>({
      query: (formData) => ({
        url: "/auth/update-profile",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),

    createProducerProfile: builder.mutation<TApiResponse<null>, FormData>({
      query: (formData) => ({
        url: "/auth/create-producer-profile",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),

    createDriverProfile: builder.mutation<TApiResponse<null>, FormData>({
      query: (formData) => ({
        url: "/auth/create-driver-profile",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),

    sendForgotPasswordOtp: builder.mutation<
      TApiResponse<null>,
      { email: string }
    >({
      query: (data) => ({
        url: "/auth/send-otp/password-reset",
        method: "POST",
        body: data,
      }),
    }),

    verifyForgotPasswordOtp: builder.mutation<
      TApiResponse<null>,
      { email: string; otp: string }
    >({
      query: (data) => ({
        url: "/auth/verify-otp/password-reset",
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation<
      TApiResponse<null>,
      { password: string; token?: string }
    >({
      query: ({ password, token }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: { password },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }),
    }),

    changePassword: builder.mutation<
      TApiResponse<null>,
      { oldPassword: string; newPassword: string }
    >({
      query: (data) => ({
        url: "/auth/change-password",
        method: "POST",
        body: data,
      }),
    }),

    toggleOnlineStatus: builder.mutation<
      TApiResponse<{ isAvailable: boolean } | null>,
      void
    >({
      query: () => ({
        url: "/auth/availability",
        method: "PATCH",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyRegistrationMutation,
  useLoginMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useCreateProducerProfileMutation,
  useCreateDriverProfileMutation,
  useSendForgotPasswordOtpMutation,
  useVerifyForgotPasswordOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useToggleOnlineStatusMutation,
} = authApi;

export const useProfileQuery = useGetProfileQuery;
export const useForgotPasswordMutation = useSendForgotPasswordOtpMutation;
export const useToggleDriverAvailabilityMutation = useToggleOnlineStatusMutation;
