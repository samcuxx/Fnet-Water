import type { Metadata } from "next";

import Link from "next/link";

import { Banknote } from "lucide-react";

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
import { requireAdministrator } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatDateTime, formatNumber, humanizeEnum } from "@/lib/utils";
import { listPayments } from "@/services/admin/payments";

export const metadata: Metadata = {
  title: "Payments",
  description: "Payment intents across orders, deliveries and installments.",
};

export default async function AdminPaymentsPage() {
  await requireAdministrator();
  const payments = await listPayments();

  return (
    <>
      <PageHeader
        title="Payments"
        description={`${formatNumber(payments.length)} most recent payment records.`}
      />

      <Card>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <EmptyState
              icon={Banknote}
              title="No payments yet"
              description="Customer and cash-on-delivery payments will appear here."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Reference</TH>
                  <TH>Customer</TH>
                  <TH>Purpose</TH>
                  <TH>Method</TH>
                  <TH numeric>Amount</TH>
                  <TH>Status</TH>
                  <TH>When</TH>
                </TR>
              </THead>
              <TBody>
                {payments.map((payment) => (
                  <TR key={payment.id}>
                    <TD className="font-mono text-xs">{payment.reference}</TD>
                    <TD>
                      <Link
                        href={`/admin/customers/${payment.customer.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {payment.customer.user.fullName}
                      </Link>
                      {payment.order && (
                        <Link
                          href={`/admin/orders/${payment.order.id}`}
                          className="mt-0.5 block text-xs text-slate-400 hover:underline"
                        >
                          {payment.order.orderNumber}
                        </Link>
                      )}
                    </TD>
                    <TD>{humanizeEnum(payment.purpose)}</TD>
                    <TD>{humanizeEnum(payment.method)}</TD>
                    <TD numeric>{formatMoney(payment.amount)}</TD>
                    <TD>
                      <StatusBadge status={payment.status} />
                    </TD>
                    <TD className="whitespace-nowrap text-slate-500">
                      {formatDateTime(payment.createdAt)}
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
