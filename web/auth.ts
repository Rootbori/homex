import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Line from "next-auth/providers/line";
import { NextResponse } from "next/server";
import {
  type AuthAccountType,
  isAuthAccountType,
  isProviderConfigured,
  normalizeRedirectPath,
  redirectForAccountType,
  roleForAccountType,
} from "@/lib/auth-flow";

const userOnlyPaths = new Set(["/my-requests", "/profile"]);
const developmentAuthSecret = "homex-dev-auth-secret";

export const { handlers, auth, signIn, signOut } = NextAuth((request) => {
  const requestedAccountType = request?.cookies.get("homex_account_type")?.value;
  const requestedRedirectTo = request?.cookies.get("homex_redirect_to")?.value;
  const secret =
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : developmentAuthSecret);

  const providers = [];
  if (isProviderConfigured("line")) {
    providers.push(Line);
  }
  if (isProviderConfigured("google")) {
    providers.push(Google);
  }

  return {
    trustHost: process.env.AUTH_TRUST_HOST === "true" || process.env.NODE_ENV !== "production",
    secret,
    pages: {
      signIn: "/login",
    },
    session: {
      strategy: "jwt" as const,
    },
    providers,
    callbacks: {
      authorized({ auth, request }) {
        const pathname = request.nextUrl.pathname;
        const accountType = auth?.accountType ?? auth?.user?.accountType;

        if (pathname === "/login" && auth) {
          const destination =
            auth.redirectTo ??
            (accountType === "staff" ? "/portal/dashboard" : "/search");
          return NextResponse.redirect(new URL(destination, request.nextUrl));
        }

        if (pathname.startsWith("/portal")) {
          if (!auth) {
            return NextResponse.redirect(new URL("/login", request.nextUrl));
          }

          if (accountType !== "staff") {
            return NextResponse.redirect(new URL("/search", request.nextUrl));
          }
        }

        if (userOnlyPaths.has(pathname)) {
          if (!auth) {
            return NextResponse.redirect(new URL("/login", request.nextUrl));
          }

          if (accountType !== "user") {
            return NextResponse.redirect(new URL("/portal/dashboard", request.nextUrl));
          }
        }

        return true;
      },
      async jwt({ token, account, user }) {
        if (account) {
          const accountType = resolveAccountType(requestedAccountType, token.accountType);

          token.accountType = accountType;
          token.appRole = roleForAccountType(accountType);
          token.provider = account.provider;
          token.providerAccountId = account.providerAccountId;
          token.redirectTo =
            normalizeRedirectPath(requestedRedirectTo) ?? redirectForAccountType(accountType);
        }

        if (user?.email) {
          token.email = user.email;
        }

        if (user?.name) {
          token.name = user.name;
        }

        if (user?.image) {
          token.picture = user.image;
        }

        return token;
      },
      async session({ session, token }) {
        const accountType = resolveAccountType(token.accountType);
        const redirectTo =
          normalizeRedirectPath(typeof token.redirectTo === "string" ? token.redirectTo : null) ??
          redirectForAccountType(accountType);

        session.accountType = accountType;
        session.appRole = token.appRole === "staff" ? "staff" : "user";
        session.provider = typeof token.provider === "string" ? token.provider : undefined;
        session.redirectTo = redirectTo;

        if (session.user) {
          session.user.id = token.sub ?? "";
          session.user.accountType = accountType;
          session.user.appRole = session.appRole;
          session.user.provider = session.provider;
          session.user.providerAccountId =
            typeof token.providerAccountId === "string" ? token.providerAccountId : undefined;
        }

        return session;
      },
    },
  };
});

function resolveAccountType(...candidates: unknown[]): AuthAccountType {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && isAuthAccountType(candidate)) {
      return candidate;
    }
  }

  return "user";
}
