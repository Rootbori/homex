import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { TechnicianNewForm } from "@/components/shop/technician-new-form";

export default async function NewTechnicianPage() {
  const cookieStore = await cookies();
  const headerList = await headers();

  const storeId = cookieStore.get("homex_store_id")?.value ?? "";
  if (!storeId) {
    redirect("/onboarding/staff");
  }

  const host = headerList.get("host") ?? "homex.app";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;

  return <TechnicianNewForm storeId={storeId} baseUrl={baseUrl} />;
}
