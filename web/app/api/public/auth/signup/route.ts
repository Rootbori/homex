import { NextRequest, NextResponse } from "next/server";
import { proxyToApi } from "@/lib/server-api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await proxyToApi("/v1/public/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const payload = await response.json();

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "unable to reach api signup endpoint" },
      { status: 502 },
    );
  }
}
