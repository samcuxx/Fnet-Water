"use client";

import { useActionState } from "react";

import { Button, Checkbox, Field, Input, Select } from "@/components/ui";

export type PlaceOrderState =
  | { ok: true; message: string }
  | { ok: false; message: string }
  | undefined;

export function PlaceOrderForm({
  action,
  products,
  addresses,
  rewardsAvailable,
  customerId,
}: {
  action: (
    state: PlaceOrderState,
    formData: FormData,
  ) => Promise<PlaceOrderState>;
  products: {
    id: string;
    name: string;
    sku: string;
    unitPriceLabel: string;
    requiresBottleExchange: boolean;
  }[];
  addresses: {
    id: string;
    label: string;
    addressLine: string;
    city: string;
    isDefault: boolean;
  }[];
  rewardsAvailable: number;
  customerId: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="customerId" value={customerId} />

      <Field id="addressId" label="Delivery address" required>
        <Select
          id="addressId"
          name="addressId"
          required
          defaultValue={addresses.find((row) => row.isDefault)?.id ?? addresses[0]?.id}
        >
          {addresses.length === 0 ? (
            <option value="">Add an address first</option>
          ) : (
            addresses.map((address) => (
              <option key={address.id} value={address.id}>
                {address.label} · {address.addressLine}, {address.city}
              </option>
            ))
          )}
        </Select>
      </Field>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Products</p>
        <ul className="space-y-3">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-900">{product.name}</p>
                <p className="text-xs text-slate-400">
                  {product.sku}
                  {product.requiresBottleExchange ? " · empty return required" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm tabular-money text-slate-600">
                  {product.unitPriceLabel}
                </span>
                <Input
                  name={`qty_${product.id}`}
                  type="number"
                  min={0}
                  max={200}
                  defaultValue={0}
                  className="w-20"
                  aria-label={`Quantity of ${product.name}`}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Field id="scheduledFor" label="Preferred delivery time">
        <Input id="scheduledFor" name="scheduledFor" type="datetime-local" />
      </Field>

      {rewardsAvailable > 0 && (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <Checkbox name="redeemReward" />
          Redeem 1 reward bottle ({rewardsAvailable} available)
        </label>
      )}

      <Button
        type="submit"
        isLoading={pending}
        loadingText="Placing order…"
        disabled={addresses.length === 0}
      >
        Place order
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
