import { PortalShell } from "@/components/navigation/portal-shell";
import { requireAgent } from "@/lib/auth/dal";

export default async function AgentLayout({ children }: LayoutProps<"/agent">) {
  const actor = await requireAgent();

  return <PortalShell actor={actor}>{children}</PortalShell>;
}
