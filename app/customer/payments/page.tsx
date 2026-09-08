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
import { requireCustomer } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { formatDateTime, humanizeEnum } from "@/lib/utils";
import { listCustomerPayments } from "@/services/customer/account";

export const metadata: Metadata = {
  title: "Payments",
  description: "Payments on your orders and installments.",
};

export default async function CustomerPaymentsPage() {
  const actor = await requireCustomer();
  const payments = await listCustomerPayments(actor.customerId);

  return (
    <>
      <PageHeader
        title="Payments"
        description="Nothing financial is edited in place — corrections append new entries."
      />

      <Card>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <EmptyState
              icon={Banknote}
              title="No payments yet"
              description="Order and installment payments will appear here."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Reference</TH>
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
                      {humanizeEnum(payment.purpose)}
                      {payment.order && (
                        <Link
                          href={`/customer/orders/${payment.order.id}`}
                          className="mt-0.5 block text-xs text-slate-400 hover:underline"
                        >
                          {payment.order.orderNumber}
                        </Link>
                      )}
                    </TD>
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
