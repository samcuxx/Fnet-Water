import type { Metadata } from "next";
import type { ReactNode } from "react";

import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatusBadge,
} from "@/components/ui";
import { requireDriver } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatDateTime, formatNumber, humanizeEnum } from "@/lib/utils";
import { DeliveryStatus } from "@/lib/generated/prisma/enums";
import { getDriverDelivery } from "@/services/driver";

import { DriverDeliveryForms } from "../complete-form";

export const metadata: Metadata = {
  title: "Delivery",
  description: "Complete or fail this assigned delivery.",
};

export default async function DriverDeliveryDetailPage(
  props: PageProps<"/driver/assigned/[id]">,
) {
  const actor = await requireDriver();
  const { id } = await props.params;
  const delivery = await getDriverDelivery(actor.driverId, id);

  if (!delivery) notFound();

  const open =
    delivery.status === DeliveryStatus.ASSIGNED ||
    delivery.status === DeliveryStatus.OUT_FOR_DELIVERY;

  return (
    <>
      <PageHeader
        title={delivery.deliveryNumber}
        description={`${delivery.order.customer.user.fullName} · ${delivery.order.orderNumber}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Stop</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Status">
              <StatusBadge status={delivery.status} />
            </Row>
            <Row label="Phone">{delivery.order.customer.user.phone}</Row>
            <Row label="Scheduled">{formatDateTime(delivery.scheduledFor)}</Row>
            <Row label="Empties expected">
              {formatNumber(delivery.emptyBottlesExpected)}
            </Row>
            <Row label="Failure">
              {delivery.failureReason
                ? humanizeEnum(delivery.failureReason)
                : "—"}
            </Row>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Exchange so far</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <Row label="Dispatched">
              {formatNumber(delivery.bottlesDispatched)}
            </Row>
            <Row label="Delivered">
              {formatNumber(delivery.bottlesDelivered)}
            </Row>
            <Row label="Collected">
              {formatNumber(delivery.emptyBottlesCollected)}
            </Row>
            <Row label="Shortage">
              {formatNumber(delivery.shortageQuantity)}
            </Row>
            <Row label="Cash">
              {delivery.cashCollected != null
                ? formatMoney(delivery.cashCollected)
                : "—"}
            </Row>
          </CardContent>
        </Card>
      </div>

      {open && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Record the stop</CardTitle>
            <CardDescription>
              Completing writes the bottle exchange, shortage and any COD in one
              transaction.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DriverDeliveryForms
              deliveryId={delivery.id}
              expectedEmpties={delivery.emptyBottlesExpected}
              bottlesDispatched={delivery.bottlesDispatched}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-900">{children}</dd>
    </div>
  );
}
