import { NextRequest, NextResponse } from "next/server";
import { routeMessage } from "@/lib/i18n/server-errors";
import { proxyToApi, readProxyPayload } from "@/lib/server-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await proxyToApi("/v1/public/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const payload = await readProxyPayload(response);
    const nextResponse = NextResponse.json(payload, { status: response.status });

    if (response.ok && typeof payload?.signup_token === "string" && payload.signup_token) {
      nextResponse.cookies.set("homex_signup_token", payload.signup_token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 30,
      });
    }

    return nextResponse;
  } catch {
    const fallbackError = await routeMessage("unable_signup");
    return NextResponse.json(
      { error: fallbackError },
      { status: 502 },
    );
  }
}
