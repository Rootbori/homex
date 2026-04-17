export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/login", "/portal/:path*", "/my-requests", "/profile"],
};
