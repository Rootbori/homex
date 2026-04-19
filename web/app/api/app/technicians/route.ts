import { NextRequest, NextResponse } from "next/server";
import { routeMessage } from "@/lib/i18n/server-errors";
import { actorHeadersFromCookies } from "@/lib/route-actor";
import { proxyToApi, readProxyPayload } from "@/lib/server-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const response = await proxyToApi("/v1/app/technicians", {
      method: "POST",
      body,
      headers: {
        ...(await actorHeadersFromCookies()),
      },
    });
    const payload = await readProxyPayload(response);

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    const fallbackError = await routeMessage("unable_create_technician");
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
