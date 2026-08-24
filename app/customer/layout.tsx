import { PortalShell } from "@/components/navigation/portal-shell";
import { requireCustomer } from "@/lib/auth/dal";

export default async function CustomerLayout({
  children,
}: LayoutProps<"/customer">) {
  const actor = await requireCustomer();

  return <PortalShell actor={actor}>{children}</PortalShell>;
}
