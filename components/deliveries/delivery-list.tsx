import Link from "next/link";

import { MapPin, Phone, Truck } from "lucide-react";

import {
  Badge,
  EmptyState,
  StatusBadge,
} from "@/components/ui";
import { formatMoney } from "@/lib/money";
import { formatFriendlyDateTime, formatNumber, humanizeEnum } from "@/lib/utils";

type DeliveryRow = {
  id: string;
  deliveryNumber: string;
  status: string;
  scheduledFor: Date | null;
  bottlesDispatched: number;
  emptyBottlesExpected: number;
  order: {
    orderNumber: string;
    total: { toString(): string };
    paymentStatus: string;
    instruction: string;
    customer: {
      user: { fullName: string; phone: string };
    };
    address: {
      addressLine: string;
      city: string;
      landmark: string | null;
      ghanaDigitalAddress: string | null;
    } | null;
  };
};

export function DeliveryCardList({
  deliveries,
  hrefFor,
  emptyTitle,
  emptyDescription,
}: {
  deliveries: DeliveryRow[];
  hrefFor: (id: string) => string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (deliveries.length === 0) {
    return (
      <EmptyState
        icon={Truck}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <ul className="space-y-3">
      {deliveries.map((delivery) => {
        const address = delivery.order.address;
        const customer = delivery.order.customer;

        return (
          <li key={delivery.id}>
            <Link
              href={hrefFor(delivery.id)}
              className="block rounded-xl border border-slate-200 p-4 hover:border-brand-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">
                    {customer.user.fullName}
                  </p>
                  <p className="font-mono text-xs text-slate-400">
                    {delivery.deliveryNumber} · {delivery.order.orderNumber}
                  </p>
                </div>
                <StatusBadge status={delivery.status} />
              </div>

              {address && (
                <p className="mt-3 flex gap-2 text-sm text-slate-600">
                  <MapPin
                    className="mt-0.5 size-4 shrink-0 text-slate-400"
                    aria-hidden
                  />
                  <span>
                    {address.addressLine}, {address.city}
                    {address.landmark && ` — near ${address.landmark}`}
                  </span>
                </p>
              )}

              <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <Phone className="size-4 shrink-0 text-slate-400" aria-hidden />
                {customer.user.phone}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <Badge tone="brand">
                  {formatNumber(delivery.bottlesDispatched)} filled out
                </Badge>
                <Badge tone="aqua">
                  {formatNumber(delivery.emptyBottlesExpected)} empties expected
                </Badge>
                <Badge
                  tone={
                    delivery.order.paymentStatus === "PAID" ? "success" : "warning"
                  }
                >
                  {formatMoney(delivery.order.total.toString())} ·{" "}
                  {humanizeEnum(delivery.order.paymentStatus)}
                </Badge>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                {delivery.scheduledFor
                  ? `Scheduled ${formatFriendlyDateTime(delivery.scheduledFor)}`
                  : "No scheduled time"}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
