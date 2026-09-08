"use client";

import { useActionState } from "react";

import { Button, Field, Textarea } from "@/components/ui";

import { cancelCustomerOrder, type CancelOrderState } from "./actions";

export function CancelOrderForm({ orderId }: { orderId: string }) {
  const [state, formAction, pending] = useActionState<
    CancelOrderState,
    FormData
  >(cancelCustomerOrder, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <Field id="reason" label="Reason" required>
        <Textarea id="reason" name="reason" required minLength={5} />
      </Field>
      <Button
        type="submit"
        variant="danger"
        isLoading={pending}
        loadingText="Cancelling…"
      >
        Cancel order
      </Button>
      {state?.message && (
        <p
          className={state.ok ? "text-sm text-success-600" : "text-sm text-danger-600"}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
