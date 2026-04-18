import { redirect } from "next/navigation";
import { SetupProfileForm } from "@/components/shop/setup-profile-form";
import { getSetupProfile } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const profile = await getSetupProfile();

  if (!profile.store) {
    redirect("/onboarding/staff");
  }

  return <SetupProfileForm initialData={profile} />;
}
