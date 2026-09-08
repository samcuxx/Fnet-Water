import type { Metadata } from "next";

import Link from "next/link";

import { Truck } from "lucide-react";

import { PageHeader } from "@/components/dashboard";
import {
  Card,
  CardContent,
  EmptyState,
  StatusBadge,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { requireCustomer } from "@/lib/auth/dal";
import { formatDate, formatNumber } from "@/lib/utils";
import { listCustomerDeliveries } from "@/services/customer/account";

export const metadata: Metadata = {
  title: "Deliveries",
  description: "Delivery attempts against your orders.",
};

export default async function CustomerDeliveriesPage() {
  const actor = await requireCustomer();
  const deliveries = await listCustomerDeliveries(actor.customerId);

  return (
    <>
      <PageHeader
        title="Deliveries"
        description={`${formatNumber(deliveries.length)} attempts on your account.`}
      />

      <Card>
        <CardContent className="p-0">
          {deliveries.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No deliveries yet"
              description="Once an order is assigned a driver, the attempt will appear here."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Delivery</TH>
                  <TH>Order</TH>
                  <TH>Driver</TH>
                  <TH>Status</TH>
                  <TH>Scheduled</TH>
                </TR>
              </THead>
              <TBody>
                {deliveries.map((delivery) => (
                  <TR key={delivery.id}>
                    <TD>
                      <Link
                        href={`/customer/deliveries/${delivery.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {delivery.deliveryNumber}
                      </Link>
                    </TD>
                    <TD>
                      <Link
                        href={`/customer/orders/${delivery.order.id}`}
                        className="text-slate-600 hover:underline"
                      >
                        {delivery.order.orderNumber}
                      </Link>
                    </TD>
                    <TD>
                      {delivery.driver ? delivery.driver.user.fullName : "Unassigned"}
                    </TD>
                    <TD>
                      <StatusBadge status={delivery.status} />
                    </TD>
                    <TD className="whitespace-nowrap text-slate-500">
                      {formatDate(delivery.scheduledFor)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
