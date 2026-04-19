import { QuotationBuilder } from "@/components/shop/quotation-builder";
import { getStaffDictionary } from "@/lib/i18n/staff";
import { getPortalStore, getUsers } from "@/lib/server-data";

export default async function QuotationPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const [store, users, t] = await Promise.all([getPortalStore(), getUsers(), Promise.resolve(getStaffDictionary(locale))]);

  return <QuotationBuilder customers={users} storeName={store?.name ?? t.common.currentStoreFallback} locale={locale} />;
}
