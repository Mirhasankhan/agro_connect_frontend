"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import Cookies from "js-cookie";

export default function AuthRoleGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const token =
      Cookies.get("token") ||
      Cookies.get("accessToken") ||
      (typeof document !== "undefined" && document.cookie.includes("token"));

    // 1. If not authenticated, or no user, or no token (e.g. after logout)
    if (!isAuthenticated || !user || !token) {
      // Guest checks
      const isProducerRoute =
        pathname.startsWith("/producer") || pathname.startsWith("/onboarding/producer");
      const isDriverRoute =
        pathname.startsWith("/driver") || pathname.startsWith("/onboarding/driver");
      const isBuyerProtectedRoute = [
        "/checkout",
        "/orders",
        "/messages",
        "/payment",
      ].some((route) => pathname === route || pathname.startsWith(`${route}/`));

      if (isProducerRoute || isDriverRoute || isBuyerProtectedRoute) {
        router.replace("/");
      }
      return;
    }

    const role = user.role;

    // Strict PRODUCER isolation: Only /producer/* and /onboarding/producer allowed
    if (role === "PRODUCER") {
      const isAllowed =
        pathname.startsWith("/producer") || pathname.startsWith("/onboarding/producer");
      if (!isAllowed) {
        if (!token) {
          router.replace("/");
          return;
        }
        router.replace("/producer/dashboard");
      }
      return;
    }

    // Strict DRIVER isolation: Only /driver/* and /onboarding/driver allowed
    if (role === "DRIVER") {
      const isAllowed =
        pathname.startsWith("/driver") || pathname.startsWith("/onboarding/driver");
      if (!isAllowed) {
        if (!token) {
          router.replace("/");
          return;
        }
        router.replace("/driver/dashboard");
      }
      return;
    }

    // Strict BUYER isolation: Cannot access /producer/*, /driver/*, or /login, /register, etc.
    if (role === "BUYER") {
      const isForbidden =
        pathname.startsWith("/producer") ||
        pathname.startsWith("/driver") ||
        pathname.startsWith("/login") ||
        pathname.startsWith("/register");
      if (isForbidden) {
        router.replace("/");
      }
      return;
    }
  }, [pathname, user, isAuthenticated, router]);

  return <>{children}</>;
}
