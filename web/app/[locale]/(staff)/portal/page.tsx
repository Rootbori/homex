import { redirect } from "next/navigation";
import { localizeAppPath } from "@/lib/auth-flow";

export default async function PortalIndexPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  redirect(localizeAppPath("/portal/dashboard", locale));
}
