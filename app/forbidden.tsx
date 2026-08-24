import Link from "next/link";

import { ShieldX } from "lucide-react";

import { buttonClasses } from "@/components/ui";
import { getActor } from "@/lib/auth/dal";
import { ROLE_HOME } from "@/lib/permissions";

/**
 * Rendered when the Data Access Layer calls `forbidden()` — a valid session
 * without the required permission or record ownership.
 */
export default async function Forbidden() {
  const actor = await getActor();
  const home = actor ? ROLE_HOME[actor.role] : "/";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger-50">
          <ShieldX className="size-7 text-danger-600" aria-hidden />
        </span>

        <h1 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
          You do not have access
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Your account does not have permission to view this page. If you
          believe this is a mistake, contact an administrator.
        </p>

        <Link href={home} className={buttonClasses({ className: "mt-8" })}>
          Back to my dashboard
        </Link>
      </div>
    </div>
  );
}
