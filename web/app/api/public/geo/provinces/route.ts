import { NextResponse } from "next/server";
import { routeMessage } from "@/lib/i18n/server-errors";
import { proxyToApi, readProxyPayload } from "@/lib/server-api";

export async function GET() {
  try {
    const response = await proxyToApi("/v1/public/geo/provinces", {
      method: "GET",
    });
    const payload = await readProxyPayload(response);

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    const fallbackError = await routeMessage("unable_load_provinces");
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
