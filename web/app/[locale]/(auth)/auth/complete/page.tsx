import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthCompleteView } from "@/components/auth/auth-complete";
import { localizeAppPath, redirectForAccountType } from "@/lib/auth-flow";

export const metadata: Metadata = {
  title: "กำลังเชื่อมบัญชี",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuthCompletePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const [{ locale }, session] = await Promise.all([params, auth()]);
  if (!session?.accountType) {
    redirect(localizeAppPath("/login", locale));
  }

  return <AuthCompleteView fallbackPath={redirectForAccountType(session.accountType, locale)} />;
}
