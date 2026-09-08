"use client";

import { useActionState } from "react";

import { Button, Field, Textarea } from "@/components/ui";

import { reconcileDeliveryAction, type DeliveryActionState } from "./actions";

export function ReconcileForm({ deliveryId }: { deliveryId: string }) {
  const [state, formAction, pending] = useActionState<
    DeliveryActionState,
    FormData
  >(reconcileDeliveryAction, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="deliveryId" value={deliveryId} />
      <Field
        id="reason"
        label="Reconciliation note"
        hint="Returning filled bottles from the driver to the warehouse."
        required
      >
        <Textarea
          id="reason"
          name="reason"
          required
          minLength={5}
          placeholder="Stock counted back into filled warehouse."
        />
      </Field>
      <Button type="submit" isLoading={pending} loadingText="Reconciling…">
        Return stock to warehouse
      </Button>
      {state?.message && (
        <p
          className={state.ok ? "text-sm text-success-600" : "text-sm text-danger-600"}
          role={state.ok ? "status" : "alert"}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
