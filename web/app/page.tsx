import { redirect } from "next/navigation";
import { withPreferredLocale } from "@/lib/i18n/server";

export default async function RootPage() {
  redirect(await withPreferredLocale("/"));
}
