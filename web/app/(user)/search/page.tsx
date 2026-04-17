import { DiscoveryView } from "@/components/user/discovery-view";
import { getPublicTechnicians } from "@/lib/server-data";

export default async function SearchPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ q?: string }>;
}>) {
  const { q = "" } = await searchParams;
  const technicians = await getPublicTechnicians({ q });

  return <DiscoveryView compact technicians={technicians} query={q} />;
}
