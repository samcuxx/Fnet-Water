"use client";

import { useActionState } from "react";

import Link from "next/link";

import { Alert, Button, Field, Input } from "@/components/ui";

import { login, type AuthFormState } from "../actions";

const FIELD_LABEL =
  "[&_label]:text-xs [&_label]:font-semibold [&_label]:uppercase [&_label]:tracking-[0.12em] [&_label]:text-[#0A1931]";

const CLASSIC_INPUT =
  "rounded-sm border-slate-300 shadow-none focus:border-[#0056D2] focus:ring-[#0056D2]/15";

/**
 * `useActionState` gives the pending flag and the action's return value, so
 * server-side validation errors render without any client-side duplication of
 * the rules.
 */
export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    login,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-6" noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      {state?.message && (
        <Alert tone="danger" title="Sign in failed">
          {state.message}
        </Alert>
      )}

      <Field
        id="identifier"
        label="Email or phone number"
        className={FIELD_LABEL}
        errors={state?.fieldErrors?.identifier}
        required
      >
        <Input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          placeholder="you@example.com or 0244123456"
          className={CLASSIC_INPUT}
          hasError={Boolean(state?.fieldErrors?.identifier)}
          required
        />
      </Field>

      <Field
        id="password"
        label="Password"
        className={FIELD_LABEL}
        errors={state?.fieldErrors?.password}
        required
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          className={CLASSIC_INPUT}
          hasError={Boolean(state?.fieldErrors?.password)}
          required
        />
      </Field>

      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={pending}
        loadingText="Signing in…"
        className="rounded-sm bg-[#0056D2] text-sm font-semibold uppercase tracking-[0.08em] shadow-none hover:bg-[#0047b0] active:bg-[#003d99] disabled:bg-[#0056D2]/40"
      >
        Sign in
      </Button>

      <p className="border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
        New customer?{" "}
        <Link
          href="/register"
          className="font-semibold text-[#0056D2] underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
