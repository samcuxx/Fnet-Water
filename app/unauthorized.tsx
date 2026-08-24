import Link from "next/link";

import { LockKeyhole } from "lucide-react";

import { buttonClasses } from "@/components/ui";

/**
 * Rendered when the Data Access Layer calls `unauthorized()` — no valid
 * session. Enabled by `experimental.authInterrupts` in next.config.ts.
 */
export default function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-50">
          <LockKeyhole className="size-7 text-brand-600" aria-hidden />
        </span>

        <h1 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
          Please sign in
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          You need to be signed in to view this page. Your session may have
          expired.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/login" className={buttonClasses()}>
            Sign in
          </Link>
          <Link href="/" className={buttonClasses({ variant: "outline" })}>
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
