import { PortalShell } from "@/components/navigation/portal-shell";
import { requireAdministrator } from "@/lib/auth/dal";

/**
 * Authorization happens here, in a layout, *and* again in each page's data
 * access. Layouts do not re-render on every navigation within the segment, so
 * a layout check alone is not a sufficient boundary.
 */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const actor = await requireAdministrator();

  return <PortalShell actor={actor}>{children}</PortalShell>;
}
