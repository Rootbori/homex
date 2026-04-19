import { NextRequest, NextResponse } from "next/server";
import { routeMessage } from "@/lib/i18n/server-errors";
import { actorHeadersFromCookies } from "@/lib/route-actor";
import { proxyToApi, readProxyPayload } from "@/lib/server-api";

export async function GET() {
  try {
    const response = await proxyToApi("/v1/app/setup-profile", {
      method: "GET",
      headers: {
        ...(await actorHeadersFromCookies()),
      },
    });
    const payload = await readProxyPayload(response);

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    const fallbackError = await routeMessage("unable_load_setup_profile");
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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.text();
    const response = await proxyToApi("/v1/app/setup-profile", {
      method: "PUT",
      body,
      headers: {
        ...(await actorHeadersFromCookies()),
      },
    });
    const payload = await readProxyPayload(response);

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    const fallbackError = await routeMessage("unable_update_setup_profile");
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
