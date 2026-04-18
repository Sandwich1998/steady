import { MobileShell } from "@/components/dashboard/mobile-shell";
import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getDashboardData();

  return <MobileShell data={data} />;
}
