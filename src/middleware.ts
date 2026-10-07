import { NextResponse, type NextRequest } from "next/server";
import { UserRole } from "./types";

const roleHome: Record<UserRole, string> = {
  PRODUCER: "/producer/dashboard",
  DRIVER: "/driver/dashboard",
  BUYER: "/",
  ADMIN: "/producer/dashboard",
};

function readRole(token: string): UserRole | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(
      normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="),
    );
    const parsed = JSON.parse(decoded);
    return (parsed.role as UserRole) || null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("token")?.value || req.cookies.get("accessToken")?.value;
  const { pathname } = req.nextUrl;
  const role = token ? readRole(token) : null;

  const authRoutes = [
    "/login",
    "/register",
    "/verify-otp",
    "/forgot-password",
    "/reset-password",
  ];

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // If already authenticated and visits auth route, redirect to role home
  if (token && role && isAuthRoute) {
    const target = roleHome[role] || "/";
    return NextResponse.redirect(new URL(target, req.url));
  }

  // Producer routes protection
  if (pathname.startsWith("/producer")) {
    if (!token || !role) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "PRODUCER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL(roleHome[role] || "/", req.url));
    }
  }

  // Driver routes protection
  if (pathname.startsWith("/driver")) {
    if (!token || !role) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== "DRIVER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL(roleHome[role] || "/", req.url));
    }
  }

  // Buyer protected checkout & orders & profile
  const buyerProtectedRoutes = [
    "/checkout",
    "/orders",
    "/profile",
    "/wishlist",
    "/messages",
  ];
  const isBuyerProtected = buyerProtectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isBuyerProtected) {
    if (!token || !role) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
