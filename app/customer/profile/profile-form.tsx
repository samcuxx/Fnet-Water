"use client";

import { useActionState } from "react";

import { Button, Field, Input } from "@/components/ui";

import { saveProfile, type ProfileFormState } from "./actions";

export function ProfileForm({
  fullName,
  phone,
  ghanaDigitalAddress,
}: {
  fullName: string;
  phone: string;
  ghanaDigitalAddress: string | null;
}) {
  const [state, formAction, pending] = useActionState<
    ProfileFormState,
    FormData
  >(saveProfile, undefined);

  return (
    <form action={formAction} className="grid max-w-xl gap-4">
      <Field id="fullName" label="Full name" required>
        <Input id="fullName" name="fullName" required defaultValue={fullName} />
      </Field>
      <Field id="phone" label="Phone" required>
        <Input id="phone" name="phone" required defaultValue={phone} />
      </Field>
      <Field id="ghanaDigitalAddress" label="Ghana digital address">
        <Input
          id="ghanaDigitalAddress"
          name="ghanaDigitalAddress"
          defaultValue={ghanaDigitalAddress ?? ""}
        />
      </Field>
      <div>
        <Button type="submit" isLoading={pending} loadingText="Saving…">
          Save profile
        </Button>
        {state?.message && (
          <p
            className={
              state.ok
                ? "mt-2 text-sm text-success-600"
                : "mt-2 text-sm text-danger-600"
            }
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
