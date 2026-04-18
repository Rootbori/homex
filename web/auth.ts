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
  staffOnboardingPath,
} from "@/lib/auth-flow";

const userOnlyPaths = new Set(["/my-requests", "/profile"]);
const developmentAuthSecret = "homex-dev-auth-secret";
const sessionCookieNames = [
  "homex_account_type",
  "homex_redirect_to",
  "homex_signup_token",
  "homex_user_id",
  "homex_store_id",
  "homex_role",
  "homex_profile_id",
  "homex_technician_id",
  "homex_invite_store_id",
  "authjs.session-token",
  "authjs.callback-url",
  "authjs.csrf-token",
  "authjs.pkce.code_verifier",
  "authjs.state",
  "authjs.nonce",
  "__Secure-authjs.session-token",
  "__Secure-authjs.callback-url",
  "__Secure-authjs.csrf-token",
  "__Secure-authjs.pkce.code_verifier",
  "__Secure-authjs.state",
  "__Secure-authjs.nonce",
  "__Host-authjs.csrf-token",
] as const;

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
      async authorized({ auth, request }) {
        const pathname = request.nextUrl.pathname;
        const accountType = auth?.accountType ?? auth?.user?.accountType;
        const hasStoreContext = Boolean(request.cookies.get("homex_store_id")?.value);
        const hasActorUser = Boolean(request.cookies.get("homex_user_id")?.value);
        const hasActorRole = Boolean(request.cookies.get("homex_role")?.value);
        const hasInviteContext = Boolean(request.cookies.get("homex_invite_store_id")?.value);
        const onboardingPath = staffOnboardingPath();
        const requiresValidation =
          Boolean(auth) &&
          (pathname.startsWith("/portal") || userOnlyPaths.has(pathname));

        const validatedPayload =
          auth && requiresValidation ? await validateLiveSession(request, auth, accountType) : null;

        if (pathname === "/login" || pathname.startsWith("/login/")) {
          const response = NextResponse.next();
          clearSessionCookies(response);
          return response;
        }

        if (auth && requiresValidation && !validatedPayload) {
          return redirectToLogin(request);
        }

        if (pathname.startsWith(onboardingPath)) {
          if (!auth) {
            return NextResponse.redirect(new URL("/login/staff", request.nextUrl));
          }

          if (accountType !== "staff") {
            return NextResponse.redirect(new URL("/search", request.nextUrl));
          }

          return true;
        }

        if (pathname.startsWith("/portal")) {
          if (!auth) {
            return NextResponse.redirect(new URL("/login", request.nextUrl));
          }

          if (accountType !== "staff") {
            return NextResponse.redirect(new URL("/search", request.nextUrl));
          }

          if (validatedPayload?.onboarding_required) {
            const response = NextResponse.redirect(new URL(onboardingPath, request.nextUrl));
            applyHomexCookies(response, validatedPayload, "staff");
            return response;
          }

          if (validatedPayload?.actor?.store_id && validatedPayload?.actor?.role) {
            const response = NextResponse.next();
            applyHomexCookies(response, validatedPayload, "staff");
            return response;
          }

          if (!hasStoreContext && !validatedPayload?.actor?.store_id) {
            const destination = hasInviteContext ? "/auth/complete" : onboardingPath;
            return NextResponse.redirect(new URL(destination, request.nextUrl));
          }

          if (!hasActorUser || !hasActorRole) {
            return NextResponse.redirect(new URL("/auth/complete", request.nextUrl));
          }

        }

        if (userOnlyPaths.has(pathname)) {
          if (!auth) {
            return NextResponse.redirect(new URL("/login", request.nextUrl));
          }

          if (accountType !== "user") {
            return NextResponse.redirect(new URL("/portal/dashboard", request.nextUrl));
          }

          if (validatedPayload) {
            const response = NextResponse.next();
            applyHomexCookies(response, validatedPayload, "user");
            return response;
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

function candidateApiBaseUrls() {
  const primary = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:7772";
  const candidates = [primary];

  if (primary.includes("localhost")) {
    candidates.push(primary.replace("localhost", "127.0.0.1"));
  } else if (primary.includes("127.0.0.1")) {
    candidates.push(primary.replace("127.0.0.1", "localhost"));
  }

  return [...new Set(candidates)];
}

async function validateLiveSession(request: Request, auth: any, accountType: unknown) {
  const provider = auth?.provider ?? auth?.user?.provider;
  const providerAccountId = auth?.user?.providerAccountId;
  const normalizedAccountType = resolveAccountType(accountType);

  if (typeof provider !== "string" || typeof providerAccountId !== "string" || !provider || !providerAccountId) {
    return null;
  }

  const headers = new Headers({ "Content-Type": "application/json", Accept: "application/json" });
  const role = request.headers.get("cookie")?.match(/(?:^|;\s*)homex_role=([^;]+)/)?.[1];
  const userId = request.headers.get("cookie")?.match(/(?:^|;\s*)homex_user_id=([^;]+)/)?.[1];
  const storeId = request.headers.get("cookie")?.match(/(?:^|;\s*)homex_store_id=([^;]+)/)?.[1];
  const profileId = request.headers.get("cookie")?.match(/(?:^|;\s*)homex_profile_id=([^;]+)/)?.[1];
  const technicianId = request.headers.get("cookie")?.match(/(?:^|;\s*)homex_technician_id=([^;]+)/)?.[1];

  if (role) headers.set("X-Actor-Role", decodeURIComponent(role));
  if (userId) headers.set("X-Actor-User-ID", decodeURIComponent(userId));
  if (storeId) headers.set("X-Store-ID", decodeURIComponent(storeId));
  if (profileId) headers.set("X-User-ID", decodeURIComponent(profileId));
  if (technicianId) headers.set("X-Technician-ID", decodeURIComponent(technicianId));

  for (const baseUrl of candidateApiBaseUrls()) {
    try {
      const response = await fetch(`${baseUrl}/v1/public/auth/validate-session`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          account_type: normalizedAccountType,
          provider,
          provider_user_id: providerAccountId,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        return null;
      }

      return response.json();
    } catch {
      continue;
    }
  }

  return null;
}

function redirectToLogin(request: Request) {
  const url = new URL("/login?reset=1", request.url);
  const response = NextResponse.redirect(url);
  clearSessionCookies(response);
  return response;
}

function applyHomexCookies(response: NextResponse, payload: any, accountType: AuthAccountType) {
  const actor = payload?.actor ?? {};
  const nextPath =
    typeof payload?.next?.next_path === "string" ? payload.next.next_path : redirectForAccountType(accountType);

  response.cookies.set("homex_account_type", accountType, cookieOptions());
  response.cookies.set("homex_redirect_to", nextPath, cookieOptions());
  setCookieValue(response, "homex_user_id", actor?.user_id);
  setCookieValue(response, "homex_store_id", actor?.store_id);
  setCookieValue(response, "homex_role", actor?.role);
  setCookieValue(response, "homex_profile_id", actor?.profile_id);
  setCookieValue(response, "homex_technician_id", actor?.technician_id);
}

function setCookieValue(response: NextResponse, name: string, value: unknown) {
  if (value === undefined || value === null || value === "") {
    response.cookies.delete(name);
    return;
  }
  response.cookies.set(name, String(value), cookieOptions());
}

function clearSessionCookies(response: NextResponse) {
  for (const name of sessionCookieNames) {
    response.cookies.set(name, "", {
      ...cookieOptions(),
      maxAge: 0,
      expires: new Date(0),
    });
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}
