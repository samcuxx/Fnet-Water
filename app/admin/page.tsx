import type { Metadata } from "next";

import { AdminOverview } from "@/components/dashboard/admin-overview";
import { requireAdministrator } from "@/lib/auth/dal";
import { getAdminSummary } from "@/services/dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Organisation-wide view of F Net Water Hub operations.",
};

export default async function AdminDashboardPage() {
  // Authorization is asserted again here, not inherited from the layout.
  await requireAdministrator();

  const summary = await getAdminSummary();

  return <AdminOverview summary={summary} />;
}
