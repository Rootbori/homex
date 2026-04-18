import { NextRequest, NextResponse } from "next/server";
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
    return NextResponse.json(
      {
        error: "unable to load setup profile",
        message: error instanceof Error ? error.message : "unable to reach api",
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
    return NextResponse.json(
      {
        error: "unable to update setup profile",
        message: error instanceof Error ? error.message : "unable to reach api",
      },
      { status: 502 },
    );
  }
}
