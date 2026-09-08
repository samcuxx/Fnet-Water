"use client";

import { useActionState } from "react";

import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { DeliveryFailureReason } from "@/lib/generated/prisma/enums";
import { humanizeEnum } from "@/lib/utils";

import {
  completeDeliveryAction,
  failDeliveryAction,
  type DriverActionState,
} from "../actions";

export function DriverDeliveryForms({
  deliveryId,
  expectedEmpties,
  bottlesDispatched,
}: {
  deliveryId: string;
  expectedEmpties: number;
  bottlesDispatched: number;
}) {
  const [completeState, completeAction, completing] = useActionState<
    DriverActionState,
    FormData
  >(completeDeliveryAction, undefined);
  const [failState, failAction, failing] = useActionState<
    DriverActionState,
    FormData
  >(failDeliveryAction, undefined);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={completeAction} className="space-y-3">
        <input type="hidden" name="deliveryId" value={deliveryId} />
        <Field id="bottlesDelivered" label="Bottles delivered" required>
          <Input
            id="bottlesDelivered"
            name="bottlesDelivered"
            type="number"
            min={0}
            defaultValue={bottlesDispatched}
            required
          />
        </Field>
        <Field id="emptyBottlesCollected" label="Empties collected" required>
          <Input
            id="emptyBottlesCollected"
            name="emptyBottlesCollected"
            type="number"
            min={0}
            defaultValue={expectedEmpties}
            required
          />
        </Field>
        <Field id="damagedBottlesReturned" label="Damaged returned">
          <Input
            id="damagedBottlesReturned"
            name="damagedBottlesReturned"
            type="number"
            min={0}
            defaultValue={0}
          />
        </Field>
        <Field id="cashCollected" label="Cash collected (GHS)">
          <Input
            id="cashCollected"
            name="cashCollected"
            inputMode="decimal"
            placeholder="0.00"
          />
        </Field>
        <Field id="remarks" label="Remarks">
          <Textarea id="remarks" name="remarks" />
        </Field>
        <Button type="submit" isLoading={completing} loadingText="Saving…">
          Complete delivery
        </Button>
        {completeState?.message && (
          <p
            className={
              completeState.ok ? "text-sm text-success-600" : "text-sm text-danger-600"
            }
          >
            {completeState.message}
          </p>
        )}
      </form>

      <form action={failAction} className="space-y-3">
        <input type="hidden" name="deliveryId" value={deliveryId} />
        <Field id="failureReason" label="Failure reason" required>
          <Select id="failureReason" name="failureReason" required defaultValue="">
            <option value="" disabled>
              Choose a reason
            </option>
            {Object.values(DeliveryFailureReason).map((reason) => (
              <option key={reason} value={reason}>
                {humanizeEnum(reason)}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          id="failureNotes"
          label="Notes"
          hint="Required when the reason is Other."
        >
          <Textarea id="failureNotes" name="failureNotes" />
        </Field>
        <Button
          type="submit"
          variant="danger"
          isLoading={failing}
          loadingText="Saving…"
        >
          Mark failed
        </Button>
        {failState?.message && (
          <p
            className={
              failState.ok ? "text-sm text-success-600" : "text-sm text-danger-600"
            }
          >
            {failState.message}
          </p>
        )}
      </form>
    </div>
  );
}
