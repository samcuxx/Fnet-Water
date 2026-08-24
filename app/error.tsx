"use client";

import { useEffect } from "react";

import Link from "next/link";

import { RotateCcw, TriangleAlert } from "lucide-react";

import { Button, buttonClasses } from "@/components/ui";

/**
 * Root error boundary.
 *
 * The user sees a plain apology and a way forward; the underlying error is
 * logged instead of rendered, so no stack trace, query text or connection
 * string reaches the browser. `digest` is the server-side correlation id.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger-50">
          <TriangleAlert className="size-7 text-danger-600" aria-hidden />
        </span>

        <h1 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          We could not complete that request. Nothing was partially saved — you
          can try again safely.
        </p>

        {error.digest && (
          <p className="mt-4 font-mono text-xs text-slate-400">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={retry}>
            <RotateCcw className="size-4" aria-hidden />
            Try again
          </Button>
          <Link href="/" className={buttonClasses({ variant: "outline" })}>
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
