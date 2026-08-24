import { PortalShell } from "@/components/navigation/portal-shell";
import { requireDriver } from "@/lib/auth/dal";

export default async function DriverLayout({ children }: LayoutProps<"/driver">) {
  const actor = await requireDriver();

  return <PortalShell actor={actor}>{children}</PortalShell>;
}
