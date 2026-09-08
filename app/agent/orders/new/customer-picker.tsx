"use client";

import { useRouter } from "next/navigation";

export function CustomerPicker({
  customers,
  selectedId,
}: {
  customers: { id: string; customerCode: string; user: { fullName: string } }[];
  selectedId: string;
}) {
  const router = useRouter();

  return (
    <label className="block text-sm font-medium text-slate-700">
      Customer
      <select
        name="customerId"
        defaultValue={selectedId}
        className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-surface px-3 text-sm"
        onChange={(event) => {
          router.push(`/agent/orders/new?customerId=${event.target.value}`);
        }}
      >
        {customers.map((row) => (
          <option key={row.id} value={row.id}>
            {row.user.fullName} · {row.customerCode}
          </option>
        ))}
      </select>
    </label>
  );
}
