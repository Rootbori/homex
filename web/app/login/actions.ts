"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import {
  isAuthAccountType,
  isAuthProviderId,
  isProviderConfigured,
  normalizeRedirectPath,
  redirectForAccountType,
} from "@/lib/auth-flow";

const temporaryCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 10,
};

export async function beginOAuthLogin(formData: FormData) {
  const providerRaw = formData.get("provider");
  const accountTypeRaw = formData.get("account_type");
  const provider = typeof providerRaw === "string" ? providerRaw : "";
  const accountType = typeof accountTypeRaw === "string" ? accountTypeRaw : "";

  if (!isAuthProviderId(provider)) {
    redirect("/login?error=unsupported-provider");
  }

  if (!isAuthAccountType(accountType)) {
    redirect("/login?error=unsupported-account-type");
  }

  if (!isProviderConfigured(provider)) {
    redirect("/login?error=provider-not-configured");
  }

  const redirectTo = redirectForAccountType(accountType);
  const cookieStore = await cookies();
  cookieStore.set("homex_account_type", accountType, temporaryCookieOptions);
  cookieStore.set("homex_redirect_to", redirectTo, temporaryCookieOptions);

  await signIn(provider, { redirectTo: "/auth/complete" });
}

export async function signOutAction(formData: FormData) {
  const redirectToRaw = formData.get("redirectTo");
  const requestedRedirect = normalizeRedirectPath(typeof redirectToRaw === "string" ? redirectToRaw : "");
  const cookieStore = await cookies();
  clearCookieJar(cookieStore);

  await signOut({ redirectTo: requestedRedirect ?? "/login" });
}

function clearCookieJar(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  const names = [
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

  for (const name of names) {
    cookieStore.set(name, "", {
      ...temporaryCookieOptions,
      maxAge: 0,
      expires: new Date(0),
    });
  }
}
