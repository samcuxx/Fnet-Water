"use client";

import { useActionState } from "react";

import { Button, Checkbox, Field, Input, Select } from "@/components/ui";
import { AddressType, DeliveryInstruction } from "@/lib/generated/prisma/enums";
import { humanizeEnum } from "@/lib/utils";

import { saveAddress, type AddressFormState } from "./actions";

export function AddressForm({
  address,
}: {
  address?: {
    id: string;
    label: string;
    type: AddressType;
    contactName: string | null;
    contactPhone: string | null;
    ghanaDigitalAddress: string | null;
    addressLine: string;
    city: string;
    region: string | null;
    landmark: string | null;
    instruction: DeliveryInstruction;
    isDefault: boolean;
  };
}) {
  const [state, formAction, pending] = useActionState<
    AddressFormState,
    FormData
  >(saveAddress, undefined);
  const prefix = address?.id ?? "new";

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      {address && <input type="hidden" name="id" value={address.id} />}
      <Field id={`${prefix}-label`} label="Label" required>
        <Input
          id={`${prefix}-label`}
          name="label"
          required
          defaultValue={address?.label ?? "Home"}
        />
      </Field>
      <Field id={`${prefix}-type`} label="Type">
        <Select
          id={`${prefix}-type`}
          name="type"
          defaultValue={address?.type ?? "HOME"}
        >
          {Object.values(AddressType).map((type) => (
            <option key={type} value={type}>
              {humanizeEnum(type)}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        id={`${prefix}-addressLine`}
        label="Address"
        required
        className="sm:col-span-2"
      >
        <Input
          id={`${prefix}-addressLine`}
          name="addressLine"
          required
          defaultValue={address?.addressLine}
        />
      </Field>
      <Field id={`${prefix}-city`} label="City" required>
        <Input
          id={`${prefix}-city`}
          name="city"
          required
          defaultValue={address?.city}
        />
      </Field>
      <Field id={`${prefix}-region`} label="Region">
        <Input
          id={`${prefix}-region`}
          name="region"
          defaultValue={address?.region ?? ""}
        />
      </Field>
      <Field id={`${prefix}-ghanaDigitalAddress`} label="Ghana digital address">
        <Input
          id={`${prefix}-ghanaDigitalAddress`}
          name="ghanaDigitalAddress"
          defaultValue={address?.ghanaDigitalAddress ?? ""}
        />
      </Field>
      <Field id={`${prefix}-landmark`} label="Landmark">
        <Input
          id={`${prefix}-landmark`}
          name="landmark"
          defaultValue={address?.landmark ?? ""}
        />
      </Field>
      <Field id={`${prefix}-contactName`} label="Contact name">
        <Input
          id={`${prefix}-contactName`}
          name="contactName"
          defaultValue={address?.contactName ?? ""}
        />
      </Field>
      <Field id={`${prefix}-contactPhone`} label="Contact phone">
        <Input
          id={`${prefix}-contactPhone`}
          name="contactPhone"
          defaultValue={address?.contactPhone ?? ""}
        />
      </Field>
      <Field id={`${prefix}-instruction`} label="Delivery instruction">
        <Select
          id={`${prefix}-instruction`}
          name="instruction"
          defaultValue={address?.instruction ?? "NONE"}
        >
          {Object.values(DeliveryInstruction).map((value) => (
            <option key={value} value={value}>
              {humanizeEnum(value)}
            </option>
          ))}
        </Select>
      </Field>
      <label className="flex items-center gap-2 self-end text-sm text-slate-700">
        <Checkbox name="isDefault" defaultChecked={address?.isDefault} />
        Default address
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" isLoading={pending} loadingText="Saving…">
          Save address
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
