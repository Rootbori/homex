import { NextRequest, NextResponse } from "next/server";
import { localeCookieName, normalizeLocale, withLocalePath } from "@/lib/i18n/config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const locale = normalizeLocale(request.cookies.get(localeCookieName)?.value);

  const response = NextResponse.redirect(new URL(withLocalePath(locale, "/login/staff"), request.url));

  response.cookies.set("homex_invite_store_id", id, {
    path: "/",
    maxAge: 60 * 60 * 24,
    httpOnly: true,
    sameSite: "lax",
  });

  response.cookies.set("homex_account_type", "staff", {
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}
