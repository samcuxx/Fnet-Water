import { PortalShell } from "@/components/navigation/portal-shell";
import { requireManager } from "@/lib/auth/dal";

export default async function ManagerLayout({
  children,
}: LayoutProps<"/manager">) {
  const actor = await requireManager();

  return <PortalShell actor={actor}>{children}</PortalShell>;
}
