import { NextResponse, type NextRequest } from "next/server";
import { UserRole } from "./types";

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

  // 1. Unauthenticated (Guest) User Handling
  if (!token || !role) {
    // If guest attempts to access Producer, Driver, or protected Buyer routes, redirect to login
    if (isProducerRoute || isDriverRoute || isBuyerProtectedRoute) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Guest can freely access public storefront (/, /products, /cart) and auth routes
    return NextResponse.next();
  }

  // 2. Authenticated PRODUCER: Strictly isolated to Producer Dashboard & Onboarding
  if (role === "PRODUCER" || role === "ADMIN") {
    if (!isProducerRoute) {
      return NextResponse.redirect(new URL("/producer/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // 3. Authenticated DRIVER: Strictly isolated to Driver Dashboard & Onboarding
  if (role === "DRIVER") {
    if (!isDriverRoute) {
      return NextResponse.redirect(new URL("/driver/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // 4. Authenticated BUYER: Storefront & Buyer features only; no Producer/Driver or Auth routes
  if (role === "BUYER") {
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (isProducerRoute || isDriverRoute) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
