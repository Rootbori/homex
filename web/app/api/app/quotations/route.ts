import { NextRequest, NextResponse } from "next/server";
import { actorHeadersFromCookies } from "@/lib/route-actor";
import { proxyToApi, readProxyPayload } from "@/lib/server-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const response = await proxyToApi("/v1/app/quotations", {
      method: "POST",
      body,
      headers: {
        ...(await actorHeadersFromCookies()),
      },
    });
    const payload = await readProxyPayload(response);

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        error: "unable to create quotation",
        message: error instanceof Error ? error.message : "unable to reach api",
      },
      { status: 502 },
    );
  }
}
