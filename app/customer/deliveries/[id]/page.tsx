import type { Metadata } from "next";
import type { ReactNode } from "react";

import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard";
import { Card, CardContent, CardHeader, CardTitle, StatusBadge } from "@/components/ui";
import { requireCustomer } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatDateTime, formatNumber, humanizeEnum } from "@/lib/utils";
import { getCustomerDelivery } from "@/services/customer/account";

export const metadata: Metadata = {
  title: "Delivery",
  description: "Your delivery attempt and bottle exchange.",
};

export default async function CustomerDeliveryDetailPage(
  props: PageProps<"/customer/deliveries/[id]">,
) {
  const actor = await requireCustomer();
  const { id } = await props.params;
  const delivery = await getCustomerDelivery(actor.customerId, id);

  if (!delivery) notFound();

  return (
    <>
      <PageHeader
        title={delivery.deliveryNumber}
        description={`Order ${delivery.order.orderNumber}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Status">
              <StatusBadge status={delivery.status} />
            </Row>
            <Row label="Driver">
              {delivery.driver ? delivery.driver.user.fullName : "Unassigned"}
            </Row>
            <Row label="Scheduled">{formatDateTime(delivery.scheduledFor)}</Row>
            <Row label="Completed">{formatDateTime(delivery.completedAt)}</Row>
            <Row label="Failure">
              {delivery.failureReason ? humanizeEnum(delivery.failureReason) : "—"}
            </Row>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Bottles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Delivered">{formatNumber(delivery.bottlesDelivered)}</Row>
            <Row label="Empties collected">
              {formatNumber(delivery.emptyBottlesCollected)}
            </Row>
            <Row label="Shortage">{formatNumber(delivery.shortageQuantity)}</Row>
            <Row label="Cash collected">
              {delivery.cashCollected != null
                ? formatMoney(delivery.cashCollected)
                : "—"}
            </Row>
          </CardContent>
        </Card>
      </div>
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
