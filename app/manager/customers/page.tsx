import type { Metadata } from "next";

import Link from "next/link";

import { Users } from "lucide-react";

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
import { requireManager } from "@/lib/auth/dal";
import { formatDate, formatNumber } from "@/lib/utils";
import { listCustomers } from "@/services/admin/customers";

export const metadata: Metadata = {
  title: "Customers",
  description: "Customer accounts, shortages and recent orders.",
};

export default async function ManagerCustomersPage() {
  await requireManager();
  const customers = await listCustomers();

  return (
    <>
      <PageHeader
        title="Customers"
        description={`${formatNumber(customers.length)} registered customer accounts.`}
      />

      <Card>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers yet"
              description="Customer accounts created by staff, agents or self-registration will appear here."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Customer</TH>
                  <TH>Contact</TH>
                  <TH>Status</TH>
                  <TH numeric>Orders</TH>
                  <TH numeric>Shortage</TH>
                  <TH>Joined</TH>
                </TR>
              </THead>
              <TBody>
                {customers.map((customer) => (
                  <TR key={customer.id}>
                    <TD>
                      <Link
                        href={`/manager/customers/${customer.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {customer.user.fullName}
                      </Link>
                      <span className="mt-0.5 block font-mono text-xs text-slate-400">
                        {customer.customerCode}
                      </span>
                    </TD>
                    <TD>
                      <span className="block text-slate-700">
                        {customer.user.phone}
                      </span>
                      <span className="block text-xs text-slate-400">
                        {customer.user.email}
                      </span>
                    </TD>
                    <TD>
                      <StatusBadge status={customer.user.status} />
                    </TD>
                    <TD numeric>{formatNumber(customer._count.orders)}</TD>
                    <TD numeric>
                      {formatNumber(
                        customer.bottleBalance?.outstandingShortage ?? 0,
                      )}
                    </TD>
                    <TD className="whitespace-nowrap text-slate-500">
                      {formatDate(customer.createdAt)}
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
