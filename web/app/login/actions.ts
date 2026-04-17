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
  const provider = String(formData.get("provider") ?? "");
  const accountType = String(formData.get("account_type") ?? "");

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
  const requestedRedirect = normalizeRedirectPath(String(formData.get("redirectTo") ?? ""));
  const cookieStore = await cookies();
  cookieStore.delete("homex_account_type");
  cookieStore.delete("homex_redirect_to");
  cookieStore.delete("homex_signup_token");
  cookieStore.delete("homex_user_id");
  cookieStore.delete("homex_store_id");
  cookieStore.delete("homex_role");
  cookieStore.delete("homex_user_id");
  cookieStore.delete("homex_technician_id");

  await signOut({ redirectTo: requestedRedirect ?? "/login" });
}
