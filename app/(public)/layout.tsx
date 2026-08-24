import Link from "next/link";

import { buttonClasses, Logo } from "@/components/ui";
import { getActor } from "@/lib/auth/dal";
import { ROLE_HOME } from "@/lib/permissions";

/** Marketing shell: a light header and footer around the public pages. */
export default async function PublicLayout({ children }: LayoutProps<"/">) {
  // Public pages render for everyone; knowing the actor only changes whether
  // the header offers "Sign in" or "Go to dashboard".
  const actor = await getActor();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="F Net Water Hub home">
            <Logo />
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            {actor ? (
              <Link href={ROLE_HOME[actor.role]} className={buttonClasses({ size: "sm" })}>
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonClasses({ variant: "ghost", size: "sm" })}
                >
                  Sign in
                </Link>
                <Link href="/register" className={buttonClasses({ size: "sm" })}>
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} F Net Water Hub. All rights reserved.</p>
          <p>Clean water, delivered and fully accounted for.</p>
        </div>
      </footer>
    </div>
  );
}
