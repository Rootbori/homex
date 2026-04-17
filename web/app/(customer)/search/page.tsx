import { DiscoveryView } from "@/components/customer/discovery-view";
import { getPublicTechnicians } from "@/lib/server-data";

export default async function SearchPage() {
  const technicians = await getPublicTechnicians();

  return <DiscoveryView compact technicians={technicians} />;
}
