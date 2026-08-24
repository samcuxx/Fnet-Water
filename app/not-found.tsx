import Link from "next/link";

import { Compass } from "lucide-react";

import { buttonClasses } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand-50">
          <Compass className="size-7 text-brand-600" aria-hidden />
        </span>

        <h1 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
          Page not found
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          The page you were looking for does not exist, or you no longer have
          access to it.
        </p>

        <Link href="/" className={buttonClasses({ className: "mt-8" })}>
          Go home
        </Link>
      </div>
    </div>
  );
}
