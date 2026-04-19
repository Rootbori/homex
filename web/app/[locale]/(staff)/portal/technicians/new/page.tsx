import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { TechnicianNewForm } from "@/components/shop/technician-new-form";
import { localizeAppPath } from "@/lib/auth-flow";

export default async function NewTechnicianPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const cookieStore = await cookies();
  const headerList = await headers();
  const { locale } = await params;

  const storeId = cookieStore.get("homex_store_id")?.value ?? "";
  if (!storeId) {
    redirect(localizeAppPath("/onboarding/staff", locale));
  }

  const host = headerList.get("host") ?? "homex.app";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const baseUrl = `${proto}://${host}`;

  return <TechnicianNewForm storeId={storeId} baseUrl={baseUrl} />;
}
