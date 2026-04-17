import "server-only";

import { cookies } from "next/headers";

export async function actorHeadersFromCookies() {
  const cookieStore = await cookies();
  const headers: Record<string, string> = {};

  const role = cookieStore.get("homex_role")?.value;
  const userId = cookieStore.get("homex_user_id")?.value;
  const storeId = cookieStore.get("homex_store_id")?.value;
  const profileId = cookieStore.get("homex_profile_id")?.value;
  const technicianId = cookieStore.get("homex_technician_id")?.value;

  if (role) headers["X-Actor-Role"] = role;
  if (userId) headers["X-Actor-User-ID"] = userId;
  if (storeId) headers["X-Store-ID"] = storeId;
  if (profileId) headers["X-User-ID"] = profileId;
  if (technicianId) headers["X-Technician-ID"] = technicianId;

  return headers;
}
