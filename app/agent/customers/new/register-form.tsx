"use client";

import { useActionState } from "react";

import { Button, Field, Input } from "@/components/ui";

import {
  registerAgentCustomer,
  type AgentRegisterState,
} from "../actions";

export function AgentRegisterForm() {
  const [state, formAction, pending] = useActionState<
    AgentRegisterState,
    FormData
  >(registerAgentCustomer, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Field
        id="fullName"
        label="Full name"
        required
        errors={state?.fieldErrors?.fullName}
      >
        <Input id="fullName" name="fullName" required />
      </Field>
      <Field id="phone" label="Phone" required errors={state?.fieldErrors?.phone}>
        <Input id="phone" name="phone" required />
      </Field>
      <Field id="email" label="Email" required errors={state?.fieldErrors?.email}>
        <Input id="email" name="email" type="email" required />
      </Field>
      <Field
        id="ghanaDigitalAddress"
        label="Ghana digital address"
        errors={state?.fieldErrors?.ghanaDigitalAddress}
      >
        <Input id="ghanaDigitalAddress" name="ghanaDigitalAddress" />
      </Field>
      <Field
        id="password"
        label="Temporary password"
        required
        hint="They can change this after first sign-in."
        errors={state?.fieldErrors?.password}
      >
        <Input id="password" name="password" type="password" required />
      </Field>
      <Field
        id="confirmPassword"
        label="Confirm password"
        required
        errors={state?.fieldErrors?.confirmPassword}
      >
        <Input id="confirmPassword" name="confirmPassword" type="password" required />
      </Field>
      <Field id="referralCode" label="Referral code" className="sm:col-span-2">
        <Input id="referralCode" name="referralCode" />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" isLoading={pending} loadingText="Registering…">
          Create customer
        </Button>
        {state?.message && (
          <p className="mt-2 text-sm text-danger-600" role="alert">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
