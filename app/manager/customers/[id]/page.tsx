import type { Metadata } from "next";
import type { ReactNode } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { MapPin, Package } from "lucide-react";

import { PageHeader } from "@/components/dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  StatusBadge,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui";
import { requireManager } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatDate, formatDateTime, formatNumber } from "@/lib/utils";
import { getCustomer } from "@/services/admin/customers";

export const metadata: Metadata = {
  title: "Customer",
  description: "Customer account, addresses, orders and bottle balance.",
};

export default async function ManagerCustomerDetailPage(
  props: PageProps<"/manager/customers/[id]">,
) {
  await requireManager();
  const { id } = await props.params;
  const customer = await getCustomer(id);

  if (!customer) notFound();

  return (
    <>
      <PageHeader
        title={customer.user.fullName}
        description={`${customer.customerCode} · ${customer.user.email}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Registration and contact details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Status">
              <StatusBadge status={customer.user.status} />
            </Row>
            <Row label="Phone">{customer.user.phone}</Row>
            <Row label="Digital address">
              {customer.ghanaDigitalAddress ?? "—"}
            </Row>
            <Row label="Referral code">
              <span className="font-mono">{customer.referralCode}</span>
            </Row>
            <Row label="Registered by">
              {customer.registeredByAgent
                ? `${customer.registeredByAgent.user.fullName} (${customer.registeredByAgent.agentCode})`
                : "Self-service"}
            </Row>
            <Row label="Last login">
              {formatDateTime(customer.user.lastLoginAt)}
            </Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bottle balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Bottles held">
              {formatNumber(customer.bottleBalance?.bottlesHeld ?? 0)}
            </Row>
            <Row label="Outstanding shortage">
              {formatNumber(customer.bottleBalance?.outstandingShortage ?? 0)}
            </Row>
            <Row label="Lifetime returned">
              {formatNumber(customer.bottleBalance?.lifetimeReturned ?? 0)}
            </Row>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rewards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Available">
              {formatNumber(customer.rewardBalance?.available ?? 0)}
            </Row>
            <Row label="Earned">
              {formatNumber(customer.rewardBalance?.earned ?? 0)}
            </Row>
            <Row label="Redeemed">
              {formatNumber(customer.rewardBalance?.redeemed ?? 0)}
            </Row>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.addresses.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title="No addresses"
                description="Delivery addresses added by the customer will appear here."
              />
            ) : (
              <ul className="space-y-3">
                {customer.addresses.map((address) => (
                  <li
                    key={address.id}
                    className="rounded-lg border border-slate-200 px-4 py-3 text-sm"
                  >
                    <p className="font-medium text-slate-900">
                      {address.label}
                      {address.isDefault ? " · Default" : ""}
                    </p>
                    <p className="mt-1 text-slate-600">{address.addressLine}</p>
                    <p className="text-xs text-slate-400">
                      {address.city}
                      {address.ghanaDigitalAddress
                        ? ` · ${address.ghanaDigitalAddress}`
                        : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {customer.orders.length === 0 ? (
              <EmptyState
                icon={Package}
                title="No orders"
                description="Orders placed for this customer will appear here."
              />
            ) : (
              <Table>
                <THead>
                  <TR>
                    <TH>Order</TH>
                    <TH numeric>Total</TH>
                    <TH>Status</TH>
                    <TH>Placed</TH>
                  </TR>
                </THead>
                <TBody>
                  {customer.orders.map((order) => (
                    <TR key={order.id}>
                      <TD>
                        <Link
                          href={`/manager/orders/${order.id}`}
                          className="font-medium text-brand-600 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </TD>
                      <TD numeric>{formatMoney(order.total)}</TD>
                      <TD>
                        <StatusBadge status={order.status} />
                      </TD>
                      <TD className="whitespace-nowrap text-slate-500">
                        {formatDate(order.createdAt)}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right text-slate-900">{children}</dd>
    </div>
  );
}
