import { DiscoveryView } from "@/components/customer/discovery-view";
import { getPublicTechnicians } from "@/lib/server-data";

export default async function HomePage() {
  const technicians = await getPublicTechnicians();

  return <DiscoveryView technicians={technicians} />;
}
