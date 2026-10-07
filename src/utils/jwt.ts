import { jwtDecode, JwtPayload } from "jwt-decode";
import Cookies from "js-cookie";
import { UserRole } from "@/types";

export interface ExtendedJwtPayload extends JwtPayload {
  id?: string;
  role?: UserRole;
  email?: string;
  fullName?: string;
}

export const JWTDecode = () => {
  if (typeof window !== "undefined") {
    const token = Cookies.get("token") || Cookies.get("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode<ExtendedJwtPayload>(token);
        return { token, decoded };
      } catch {
        return { token: null, decoded: null };
      }
    }
  }
  return { token: null, decoded: null };
};