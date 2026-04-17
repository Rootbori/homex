import { QuotationBuilder } from "@/components/shop/quotation-builder";
import { getPortalStore, getUsers } from "@/lib/server-data";

export default async function QuotationPage() {
  const [store, users] = await Promise.all([getPortalStore(), getUsers()]);

  return <QuotationBuilder customers={users} storeName={store?.name ?? "ร้านปัจจุบัน"} />;
}
