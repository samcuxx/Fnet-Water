import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";
import { getActor } from "@/lib/auth/dal";
import { ROLE_HOME } from "@/lib/permissions";

/** Public marketing shell matching the approved landing mockup. */
export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const actor = await getActor();

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white">
      <LandingNav
        signedIn={Boolean(actor)}
        dashboardHref={actor ? ROLE_HOME[actor.role] : undefined}
      />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}
