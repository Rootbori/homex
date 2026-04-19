import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StaffOnboarding } from "@/components/auth/staff-onboarding";
import { localizeAppPath } from "@/lib/auth-flow";

export const metadata: Metadata = {
  title: "เริ่มต้นใช้งานฝั่งร้าน",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StaffOnboardingPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const [{ locale }, session] = await Promise.all([params, auth()]);

  if (!session?.accountType) {
    redirect(localizeAppPath("/login/staff", locale));
  }

  if (session.accountType !== "staff") {
    redirect(localizeAppPath("/search", locale));
  }

  return <StaffOnboarding displayName={session.user?.name ?? "ทีมช่าง Homex"} />;
}
