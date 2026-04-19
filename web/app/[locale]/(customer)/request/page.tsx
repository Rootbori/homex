import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CreateRequestForm } from "@/components/user/create-request-form";
import { isLocale } from "@/lib/i18n/config";
import { getPublicTechnicianDetail } from "@/lib/server-data";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LocalizedRequestPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ technician?: string; name?: string }>;
}>) {
  const [{ locale }, { technician: technicianSlug, name = "" }] = await Promise.all([params, searchParams]);

  if (!isLocale(locale)) {
    notFound();
  }

  const selectedTechnician = technicianSlug ? await getPublicTechnicianDetail(technicianSlug) : null;
  const backHref = selectedTechnician ? `/${locale}/technicians/${selectedTechnician.slug}` : `/${locale}/search`;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="sticky top-0 z-50 border-b border-black/[0.04] bg-white/85 px-4 pb-3 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3">
          <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" />
            กลับ
          </Link>
        </div>
      </header>

      <main className="px-4 py-6">
        <CreateRequestForm
          defaultName={name}
          selectedTechnician={
            selectedTechnician
              ? {
                  slug: selectedTechnician.slug,
                  name: selectedTechnician.name,
                  shopName: selectedTechnician.shopName,
                }
              : null
          }
        />
      </main>
    </div>
  );
}
