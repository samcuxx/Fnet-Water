import { PortalShell } from "@/components/navigation/portal-shell";
import { requireActor } from "@/lib/auth/dal";

/**
 * Notifications are shared by every role, so this segment sits outside the
 * role portals and renders the shell for whichever role is signed in.
 */
export default async function NotificationsLayout({
  children,
}: LayoutProps<"/notifications">) {
  const actor = await requireActor();

  return <PortalShell actor={actor}>{children}</PortalShell>;
}
