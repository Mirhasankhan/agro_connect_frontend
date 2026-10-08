import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { TUser, UserRole } from "@/types";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { ExtendedJwtPayload } from "@/utils/jwt";
import { disconnectSocket } from "@/lib/socket";

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

      let resolvedUser = user;
      if (!resolvedUser && token) {
        try {
          const decoded = jwtDecode<ExtendedJwtPayload>(token);
          if (decoded) {
            resolvedUser = {
              id: decoded.id || "",
              fullName: decoded.fullName || "",
              email: decoded.email || "",
              role: (decoded.role as UserRole) || role,
              isSetupCompleted: state.isSetupCompleted,
            };
          }
        } catch {
          // ignore
        }
      }

      state.user = resolvedUser ?? {
        id: "",
        fullName: "",
        email: "",
        role,
        isSetupCompleted: state.isSetupCompleted,
      };

      if (token) {
        Cookies.set("token", token, { expires: 7, path: "/" });
        Cookies.set("accessToken", token, { expires: 7, path: "/" });
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

      Cookies.remove("token", { path: "/" });
      Cookies.remove("accessToken", { path: "/" });
      disconnectSocket();
    },
  },
});

export const { setUser, updateProfileData, logOut } = authSlice.actions;
export const logout = logOut;
export default authSlice.reducer;

export const useCurrentUser = (state: RootState) => state.auth.user;
export const useCurrentToken = (state: RootState) => state.auth.token;
export const useCurrentRole = (state: RootState) => state.auth.role;
