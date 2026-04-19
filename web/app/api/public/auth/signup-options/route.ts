import { NextResponse } from "next/server";
import { routeMessage } from "@/lib/i18n/server-errors";
import { proxyToApi, readProxyPayload } from "@/lib/server-api";

export async function GET() {
  try {
    const response = await proxyToApi("/v1/public/auth/signup-options");
    const payload = await readProxyPayload(response);

    return NextResponse.json(payload, { status: response.status });
  } catch {
    const fallbackError = await routeMessage("unable_signup_options");
    return NextResponse.json(
      { error: fallbackError },
      { status: 502 },
    );
  }
}
