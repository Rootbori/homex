import { QuotationBuilder } from "@/components/shop/quotation-builder";
import { getUsers } from "@/lib/server-data";

export default async function QuotationPage() {
  const users = await getUsers();

  return <QuotationBuilder customers={users} />;
}
