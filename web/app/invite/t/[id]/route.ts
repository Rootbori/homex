import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Redirect target
  const response = NextResponse.redirect(new URL("/login/staff", request.url));

  // Store the invite shop ID in a cookie
  response.cookies.set("homex_invite_store_id", id, {
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
    httpOnly: true,
    sameSite: "lax",
  });

  // Also set account type to staff by default for this flow
  response.cookies.set("homex_account_type", "staff", {
     path: "/",
     maxAge: 60 * 60,
  });

  return response;
}
