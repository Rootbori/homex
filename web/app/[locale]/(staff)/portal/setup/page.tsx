import { redirect } from "next/navigation";
import { SetupProfileForm } from "@/components/shop/setup-profile-form";
import { localizeAppPath } from "@/lib/auth-flow";
import { getSetupProfile } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export default async function SetupPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const [{ locale }, profile] = await Promise.all([params, getSetupProfile()]);

  if (!profile.store) {
    redirect(localizeAppPath("/onboarding/staff", locale));
  }

  return <SetupProfileForm initialData={profile} locale={locale} />;
}
