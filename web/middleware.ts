export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/",
    "/login/:path*",
    "/search",
    "/search/:path*",
    "/request",
    "/technicians/:path*",
    "/portal/:path*",
    "/my-requests",
    "/profile",
    "/onboarding/staff",
    "/auth/complete",
    "/:locale",
    "/:locale/login/:path*",
    "/:locale/search",
    "/:locale/search/:path*",
    "/:locale/request",
    "/:locale/technicians/:path*",
    "/:locale/portal/:path*",
    "/:locale/my-requests",
    "/:locale/profile",
    "/:locale/onboarding/staff",
    "/:locale/auth/complete",
  ],
};
