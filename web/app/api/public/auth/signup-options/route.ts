import { NextResponse } from "next/server";
import { proxyToApi } from "@/lib/server-api";

export async function GET() {
  try {
    const response = await proxyToApi("/v1/public/auth/signup-options");
    const payload = await response.json();

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: "unable to reach api signup options" },
      { status: 502 },
    );
  }
}
