import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { TUser, UserRole } from "@/types";
import Cookies from "js-cookie";

interface TAuthState {
  user: TUser | null;
  token: string | null;
  role: UserRole | null;
  isSetupCompleted: boolean;
  isAuthenticated: boolean;
}

const initialState: TAuthState = {
  user: null,
  token: null,
  role: null,
  isSetupCompleted: false,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        user?: TUser | null;
        token: string;
        role: UserRole;
        isSetupCompleted?: boolean;
      }>,
    ) => {
      const { user, token, role, isSetupCompleted } = action.payload;
      state.token = token;
      state.role = role;
      state.isAuthenticated = Boolean(token);
      state.isSetupCompleted = isSetupCompleted ?? user?.isSetupCompleted ?? false;
      state.user = user ?? {
        id: "",
        fullName: "",
        email: "",
        role,
        isSetupCompleted: state.isSetupCompleted,
      };

      if (token) {
        Cookies.set("token", token, { expires: 7 });
        Cookies.set("accessToken", token, { expires: 7 });
      }
    },
    updateProfileData: (state, action: PayloadAction<Partial<TUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
      if (action.payload.isSetupCompleted !== undefined) {
        state.isSetupCompleted = action.payload.isSetupCompleted;
      }
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isSetupCompleted = false;
      state.isAuthenticated = false;

      Cookies.remove("token");
      Cookies.remove("accessToken");
    },
  },
});

export const { setUser, updateProfileData, logOut } = authSlice.actions;
export const logout = logOut;
export default authSlice.reducer;

export const useCurrentUser = (state: RootState) => state.auth.user;
export const useCurrentToken = (state: RootState) => state.auth.token;
export const useCurrentRole = (state: RootState) => state.auth.role;
export const useIsSetupCompleted = (state: RootState) =>
  state.auth.isSetupCompleted;
