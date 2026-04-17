import { DiscoveryView } from "@/components/user/discovery-view";
import { getPublicTechnicians } from "@/lib/server-data";

export default async function HomePage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ q?: string }>;
}>) {
  const { q = "" } = await searchParams;
  const technicians = await getPublicTechnicians({ q });

  return <DiscoveryView technicians={technicians} query={q} />;
}
