"use client";

import { useActionState } from "react";

import Link from "next/link";

import { Alert, Button, Checkbox, Field, Input } from "@/components/ui";

import { register, type AuthFormState } from "../actions";

export function RegisterForm({ referralCode }: { referralCode?: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    register,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state?.message && (
        <Alert tone="danger" title="We could not create your account">
          {state.message}
        </Alert>
      )}

      <Field
        id="fullName"
        label="Full name"
        errors={state?.fieldErrors?.fullName}
        required
      >
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          placeholder="Akosua Addo"
          hasError={Boolean(state?.fieldErrors?.fullName)}
          required
        />
      </Field>

      <Field
        id="email"
        label="Email address"
        errors={state?.fieldErrors?.email}
        required
      >
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          hasError={Boolean(state?.fieldErrors?.email)}
          required
        />
      </Field>

      <Field
        id="phone"
        label="Phone number"
        hint="Used for delivery contact and payment confirmations."
        errors={state?.fieldErrors?.phone}
        required
      >
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="0244123456"
          hasError={Boolean(state?.fieldErrors?.phone)}
          required
        />
      </Field>

      <Field
        id="ghanaDigitalAddress"
        label="Ghana Digital Address"
        hint="Optional, e.g. GA-123-4567. You can add full addresses later."
        errors={state?.fieldErrors?.ghanaDigitalAddress}
      >
        <Input
          id="ghanaDigitalAddress"
          name="ghanaDigitalAddress"
          placeholder="GA-123-4567"
          hasError={Boolean(state?.fieldErrors?.ghanaDigitalAddress)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="password"
          label="Password"
          hint="At least 10 characters, with letters and numbers."
          errors={state?.fieldErrors?.password}
          required
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            hasError={Boolean(state?.fieldErrors?.password)}
            required
          />
        </Field>

        <Field
          id="confirmPassword"
          label="Confirm password"
          errors={state?.fieldErrors?.confirmPassword}
          required
        >
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            hasError={Boolean(state?.fieldErrors?.confirmPassword)}
            required
          />
        </Field>
      </div>

      <Field
        id="referralCode"
        label="Referral code"
        hint="Optional. Enter the code a friend shared with you."
        errors={state?.fieldErrors?.referralCode}
      >
        <Input
          id="referralCode"
          name="referralCode"
          defaultValue={referralCode}
          placeholder="FNW-ABC123"
          className="uppercase"
          hasError={Boolean(state?.fieldErrors?.referralCode)}
        />
      </Field>

      <div className="space-y-1.5">
        <div className="flex items-start gap-2.5">
          <Checkbox
            id="acceptTerms"
            name="acceptTerms"
            className="mt-0.5"
            required
          />
          <label htmlFor="acceptTerms" className="text-sm text-slate-600">
            I agree to the F Net Water Hub terms of service, including
            responsibility for refillable bottles held in my care.
          </label>
        </div>
        {state?.fieldErrors?.acceptTerms && (
          <p className="text-xs font-medium text-danger-600" role="alert">
            {state.fieldErrors.acceptTerms[0]}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        fullWidth
        isLoading={pending}
        loadingText="Creating your account…"
      >
        Create account
      </Button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
