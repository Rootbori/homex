import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";
import { isProviderConfigured, redirectForAccountType } from "@/lib/auth-flow";

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.accountType) {
    redirect(session.redirectTo ?? redirectForAccountType(session.accountType));
  }

  const params = await searchParams;

  return (
    <LoginForm
      backHref="/login"
      error={params?.error ?? null}
      fixedAccountType="staff"
      heading="ร้าน / ช่างเข้าสู่ระบบ"
      initialAccountType="staff"
      providerAvailability={{
        google: isProviderConfigured("google"),
        line: isProviderConfigured("line"),
      }}
      subtitle="สำหรับผู้ใช้ประเภท staff ที่จะเข้าไปจัดการ store memberships, lead, jobs, quotation และ schedule โดยระบบจะสร้างบัญชีร้านให้อัตโนมัติในครั้งแรก"
    />
  );
}
