import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAuthAccountType, redirectForAccountType } from "@/lib/auth-flow";
import { proxyToApi, readProxyPayload } from "@/lib/server-api";

const actorCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function POST() {
  const session = await auth();
  if (!session?.user?.providerAccountId || !session.provider) {
    return NextResponse.json(
      { error: "missing session provider context" },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();
  const cookieAccountType = cookieStore.get("homex_account_type")?.value;
  const signupToken = cookieStore.get("homex_signup_token")?.value ?? "";
  const inviteStoreId = cookieStore.get("homex_invite_store_id")?.value ?? "";
  const accountType =
    (cookieAccountType && isAuthAccountType(cookieAccountType) ? cookieAccountType : session.accountType) ??
    "user";

  try {
    const response = await proxyToApi("/v1/public/auth/oauth-sync", {
      method: "POST",
      body: JSON.stringify({
        account_type: accountType,
        provider: session.provider,
        provider_user_id: session.user.providerAccountId,
        email: session.user.email ?? "",
        full_name: session.user.name ?? "",
        avatar_url: session.user.image ?? "",
        signup_token: signupToken,
        invite_store_id: inviteStoreId,
      }),
    });
    const payload = await readProxyPayload(response);
    const nextResponse = NextResponse.json(payload, { status: response.status });

    if (response.ok) {
      const actor = payload?.actor ?? {};
      const nextPath =
        typeof payload?.next?.next_path === "string"
          ? payload.next.next_path
          : redirectForAccountType(accountType);

      nextResponse.cookies.set("homex_account_type", accountType, actorCookieOptions);
      nextResponse.cookies.set("homex_redirect_to", nextPath, actorCookieOptions);
      nextResponse.cookies.delete("homex_signup_token");
      nextResponse.cookies.delete("homex_invite_store_id");

      setActorCookie(nextResponse, "homex_user_id", actor?.user_id);
      setActorCookie(nextResponse, "homex_store_id", actor?.store_id);
      setActorCookie(nextResponse, "homex_role", actor?.role);
      setActorCookie(nextResponse, "homex_profile_id", actor?.profile_id);
      setActorCookie(nextResponse, "homex_technician_id", actor?.technician_id);
    } else if (response.status >= 400 && response.status < 500) {
      nextResponse.cookies.delete("homex_signup_token");
    }

    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      {
        error: "unable to complete oauth sync",
        message: error instanceof Error ? error.message : "unable to reach api oauth sync endpoint",
      },
      { status: 502 },
    );
  }
}

function setActorCookie(response: NextResponse, name: string, value: unknown) {
  if (value === undefined || value === null || value === "") {
    response.cookies.delete(name);
    return;
  }

  const stringValue =
    typeof value === "string" || typeof value === "number" || typeof value === "boolean"
      ? String(value)
      : "";

  if (!stringValue) {
    response.cookies.delete(name);
    return;
  }

  response.cookies.set(name, stringValue, actorCookieOptions);
}
