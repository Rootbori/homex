import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAuthAccountType } from "@/lib/auth-flow";
import { routeMessage } from "@/lib/i18n/server-errors";
import { actorHeadersFromCookies } from "@/lib/route-actor";
import { proxyToApi, readProxyPayload } from "@/lib/server-api";

const actorCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const actorContext = await resolveActorContext();
    if ("errorResponse" in actorContext) {
      return actorContext.errorResponse;
    }

    const response = await proxyToApi("/v1/app/staff/onboarding", {
      method: "POST",
      body,
      headers: {
        ...actorContext.headers,
      },
    });
    const payload = await readProxyPayload(response);
    const nextResponse = NextResponse.json(payload, { status: response.status });

    setActorCookiesFromPayload(nextResponse, actorContext.syncPayload);

    if (response.ok) {
      setActorCookiesFromPayload(nextResponse, payload);

      if (typeof payload?.next?.next_path === "string") {
        nextResponse.cookies.set("homex_redirect_to", payload.next.next_path, actorCookieOptions);
      }
    }

    return nextResponse;
  } catch (error) {
    const fallbackError = await routeMessage("unable_complete_staff_onboarding");
    const fallbackMessage = await routeMessage("unable_reach_api");
    return NextResponse.json(
      {
        error: fallbackError,
        message: error instanceof Error ? error.message : fallbackMessage,
      },
      { status: 502 },
    );
  }
}

async function resolveActorContext(): Promise<
  | {
      headers: Record<string, string>;
      syncPayload?: any;
    }
  | { errorResponse: NextResponse }
> {
  const cookieHeaders = await actorHeadersFromCookies();
  if (cookieHeaders["X-Actor-User-ID"]) {
    return { headers: cookieHeaders };
  }

  const session = await auth();
  if (!session?.user?.providerAccountId || !session.provider) {
    const fallbackMessage = await routeMessage("login_required_before_onboarding");
    return {
      errorResponse: NextResponse.json(
        {
          error: "login required",
          message: fallbackMessage,
        },
        { status: 401 },
      ),
    };
  }

  const cookieStore = await cookies();
  const cookieAccountType = cookieStore.get("homex_account_type")?.value;
  const inviteStoreId = cookieStore.get("homex_invite_store_id")?.value ?? "";
  const accountType =
    cookieAccountType && isAuthAccountType(cookieAccountType)
      ? cookieAccountType
      : session.accountType ?? "staff";

  const syncResponse = await proxyToApi("/v1/public/auth/oauth-sync", {
    method: "POST",
    body: JSON.stringify({
      account_type: accountType,
      provider: session.provider,
      provider_user_id: session.user.providerAccountId,
      email: session.user.email ?? "",
      full_name: session.user.name ?? "",
      avatar_url: session.user.image ?? "",
      invite_store_id: inviteStoreId,
    }),
  });
  const syncPayload = await readProxyPayload(syncResponse);
  if (!syncResponse.ok) {
    return {
      errorResponse: NextResponse.json(syncPayload, { status: syncResponse.status }),
    };
  }

  const actor = syncPayload?.actor ?? {};
  return {
    headers: {
      ...(typeof actor?.role === "string" && actor.role ? { "X-Actor-Role": actor.role } : {}),
      ...(actor?.user_id ? { "X-Actor-User-ID": String(actor.user_id) } : {}),
      ...(actor?.store_id ? { "X-Store-ID": String(actor.store_id) } : {}),
      ...(actor?.profile_id ? { "X-User-ID": String(actor.profile_id) } : {}),
      ...(actor?.technician_id ? { "X-Technician-ID": String(actor.technician_id) } : {}),
    },
    syncPayload,
  };
}

function setActorCookiesFromPayload(response: NextResponse, payload: any) {
  const actor = payload?.actor ?? {};
  setActorCookie(response, "homex_user_id", actor?.user_id);
  setActorCookie(response, "homex_store_id", actor?.store_id);
  setActorCookie(response, "homex_role", actor?.role);
  setActorCookie(response, "homex_profile_id", actor?.profile_id);
  setActorCookie(response, "homex_technician_id", actor?.technician_id);
}

function setActorCookie(response: NextResponse, name: string, value: unknown) {
  if (value === undefined || value === null || value === "") {
    response.cookies.delete(name);
    return;
  }

  let stringValue: string;
  if (typeof value === "string") {
    stringValue = value;
  } else if (typeof value === "number" || typeof value === "boolean") {
    stringValue = value.toString();
  } else {
    stringValue = JSON.stringify(value);
  }

  response.cookies.set(name, stringValue, actorCookieOptions);
}
