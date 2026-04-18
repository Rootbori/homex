import { NextRequest, NextResponse } from "next/server";
import { proxyToApi, readProxyPayload } from "@/lib/server-api";

export async function GET(request: NextRequest) {
  const provinceId = request.nextUrl.searchParams.get("province_id")?.trim() ?? "";

  try {
    const response = await proxyToApi(`/v1/public/geo/districts?province_id=${encodeURIComponent(provinceId)}`, {
      method: "GET",
    });
    const payload = await readProxyPayload(response);

    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        error: "unable to load districts",
        message: error instanceof Error ? error.message : "unable to reach api",
      },
      { status: 502 },
    );
  }
}
