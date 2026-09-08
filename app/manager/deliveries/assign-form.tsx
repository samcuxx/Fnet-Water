"use client";

import { useActionState } from "react";

import { Button, Field, Input, Select } from "@/components/ui";

import { assignDriverAction, type DeliveryActionState } from "./actions";

export function AssignDriverForm({
  orderId,
  drivers,
  defaultScheduled,
}: {
  orderId: string;
  drivers: {
    id: string;
    driverCode: string;
    isAvailable: boolean;
    user: { fullName: string };
  }[];
  defaultScheduled?: string;
}) {
  const [state, formAction, pending] = useActionState<
    DeliveryActionState,
    FormData
  >(assignDriverAction, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-3">
      <input type="hidden" name="orderId" value={orderId} />
      <Field id="driverId" label="Driver" required>
        <Select id="driverId" name="driverId" required defaultValue="">
          <option value="" disabled>
            Choose a driver
          </option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.user.fullName} · {driver.driverCode}
              {driver.isAvailable ? "" : " (off duty)"}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="scheduledFor" label="Scheduled for" required>
        <Input
          id="scheduledFor"
          name="scheduledFor"
          type="datetime-local"
          required
          defaultValue={defaultScheduled}
        />
      </Field>
      <div className="flex items-end">
        <Button type="submit" isLoading={pending} loadingText="Assigning…">
          Assign driver
        </Button>
      </div>
      {state?.message && (
        <p
          className={
            state.ok
              ? "sm:col-span-3 text-sm text-success-600"
              : "sm:col-span-3 text-sm text-danger-600"
          }
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
