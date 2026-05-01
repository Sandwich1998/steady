import { redirect } from "next/navigation";

import { MobileShell } from "@/components/dashboard/mobile-shell";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const data = await getDashboardData(user.id);

  return (
    <MobileShell
      data={{
        ...data,
        user: {
          username: user.username,
          email: user.email,
          imageUrl: user.imageUrl,
        },
      }}
    />
  );
}
