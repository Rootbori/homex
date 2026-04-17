import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { StaffOnboarding } from "@/components/auth/staff-onboarding";

export default async function StaffOnboardingPage() {
  const session = await auth();

  if (!session?.accountType) {
    redirect("/login/staff");
  }

  if (session.accountType !== "staff") {
    redirect("/search");
  }

  return <StaffOnboarding displayName={session.user?.name ?? "ทีมช่าง Homex"} />;
}
