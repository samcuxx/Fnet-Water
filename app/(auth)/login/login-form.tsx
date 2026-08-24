"use client";

import { useActionState } from "react";

import Link from "next/link";

import { Alert, Button, Field, Input } from "@/components/ui";

import { login, type AuthFormState } from "../actions";

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
    <form action={formAction} className="space-y-5" noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      {state?.message && (
        <Alert tone="danger" title="Sign in failed">
          {state.message}
        </Alert>
      )}

      <Field
        id="identifier"
        label="Email or phone number"
        errors={state?.fieldErrors?.identifier}
        required
      >
        <Input
          id="identifier"
          name="identifier"
          type="text"
          autoComplete="username"
          placeholder="you@example.com or 0244123456"
          hasError={Boolean(state?.fieldErrors?.identifier)}
          required
        />
      </Field>

      <Field
        id="password"
        label="Password"
        errors={state?.fieldErrors?.password}
        required
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
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
      >
        Sign in
      </Button>

      <p className="text-center text-sm text-slate-600">
        New customer?{" "}
        <Link
          href="/register"
          className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
