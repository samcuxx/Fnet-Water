"use client";

import { useActionState, type ReactNode } from "react";

import Link from "next/link";

import { Alert, Button, Checkbox, Field, Input } from "@/components/ui";

import { register, type AuthFormState } from "../actions";

const FIELD_LABEL =
  "[&_label]:text-xs [&_label]:font-semibold [&_label]:uppercase [&_label]:tracking-[0.12em] [&_label]:text-[#0A1931]";

const CLASSIC_INPUT =
  "rounded-sm border-slate-300 shadow-none focus:border-[#0056D2] focus:ring-[#0056D2]/15";

function FormSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0056D2]">
        {title}
      </p>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

export function RegisterForm({ referralCode }: { referralCode?: string }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    register,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {state?.message && (
        <Alert tone="danger" title="We could not create your account">
          {state.message}
        </Alert>
      )}

      <FormSection title="Your details">
        <Field
          id="fullName"
          label="Full name"
          className={FIELD_LABEL}
          errors={state?.fieldErrors?.fullName}
          required
        >
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Akosua Addo"
            className={CLASSIC_INPUT}
            hasError={Boolean(state?.fieldErrors?.fullName)}
            required
          />
        </Field>

        <Field
          id="email"
          label="Email address"
          className={FIELD_LABEL}
          errors={state?.fieldErrors?.email}
          required
        >
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={CLASSIC_INPUT}
            hasError={Boolean(state?.fieldErrors?.email)}
            required
          />
        </Field>

        <Field
          id="phone"
          label="Phone number"
          className={FIELD_LABEL}
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
            className={CLASSIC_INPUT}
            hasError={Boolean(state?.fieldErrors?.phone)}
            required
          />
        </Field>

        <Field
          id="ghanaDigitalAddress"
          label="Ghana Digital Address"
          className={FIELD_LABEL}
          hint="Optional, e.g. GA-123-4567. You can add full addresses later."
          errors={state?.fieldErrors?.ghanaDigitalAddress}
        >
          <Input
            id="ghanaDigitalAddress"
            name="ghanaDigitalAddress"
            placeholder="GA-123-4567"
            className={CLASSIC_INPUT}
            hasError={Boolean(state?.fieldErrors?.ghanaDigitalAddress)}
          />
        </Field>
      </FormSection>

      <FormSection title="Security" className="border-t border-slate-200 pt-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="password"
            label="Password"
            className={FIELD_LABEL}
            hint="At least 10 characters, with letters and numbers."
            errors={state?.fieldErrors?.password}
            required
          >
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className={CLASSIC_INPUT}
              hasError={Boolean(state?.fieldErrors?.password)}
              required
            />
          </Field>

          <Field
            id="confirmPassword"
            label="Confirm password"
            className={FIELD_LABEL}
            errors={state?.fieldErrors?.confirmPassword}
            required
          >
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={CLASSIC_INPUT}
              hasError={Boolean(state?.fieldErrors?.confirmPassword)}
              required
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Referral" className="border-t border-slate-200 pt-8">
        <Field
          id="referralCode"
          label="Referral code"
          className={FIELD_LABEL}
          hint="Optional. Enter the code a friend shared with you."
          errors={state?.fieldErrors?.referralCode}
        >
          <Input
            id="referralCode"
            name="referralCode"
            defaultValue={referralCode}
            placeholder="FNW-ABC123"
            className={`${CLASSIC_INPUT} uppercase`}
            hasError={Boolean(state?.fieldErrors?.referralCode)}
          />
        </Field>
      </FormSection>

      <div className="space-y-6 border-t border-slate-200 pt-8">
        <div className="space-y-1.5">
          <div className="flex items-start gap-3">
            <Checkbox
              id="acceptTerms"
              name="acceptTerms"
              className="mt-0.5 rounded-sm border-slate-300 text-[#0056D2] focus:ring-[#0056D2]/20"
              required
            />
            <label htmlFor="acceptTerms" className="text-sm leading-relaxed text-slate-600">
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
          className="rounded-sm bg-[#0056D2] text-sm font-semibold uppercase tracking-[0.08em] shadow-none hover:bg-[#0047b0] active:bg-[#003d99] disabled:bg-[#0056D2]/40"
        >
          Create account
        </Button>

        <p className="border-t border-slate-200 pt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#0056D2] underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
