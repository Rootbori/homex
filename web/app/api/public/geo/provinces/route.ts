import { NextResponse } from "next/server";
import { proxyToApi, readProxyPayload } from "@/lib/server-api";

export async function GET() {
  try {
    const response = await proxyToApi("/v1/public/geo/provinces", {
      method: "GET",
    });
    const payload = await readProxyPayload(response);

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        error: "unable to load provinces",
        message: error instanceof Error ? error.message : "unable to reach api",
      },
      { status: 502 },
    );
  }
}
