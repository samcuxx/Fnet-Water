import type { Metadata } from "next";

import Link from "next/link";

import { Users } from "lucide-react";

import { PageHeader } from "@/components/dashboard";
import {
  buttonClasses,
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
import { requireAgent } from "@/lib/auth/dal";
import { formatDate, formatNumber } from "@/lib/utils";
import { listAgentCustomers } from "@/services/agent";

export const metadata: Metadata = {
  title: "My customers",
  description: "Customers you have onboarded.",
};

export default async function AgentCustomersPage() {
  const actor = await requireAgent();
  const customers = await listAgentCustomers(actor.agentId);

  return (
    <>
      <PageHeader
        title="My customers"
        description={`${formatNumber(customers.length)} accounts you registered.`}
        actions={
          <Link href="/agent/customers/new" className={buttonClasses()}>
            Register customer
          </Link>
        }
      />

      <Card>
        <CardContent className="p-0">
          {customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers yet"
              description="Register a customer to start placing orders for them."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Customer</TH>
                  <TH>Contact</TH>
                  <TH>Status</TH>
                  <TH numeric>Orders</TH>
                  <TH>Joined</TH>
                </TR>
              </THead>
              <TBody>
                {customers.map((customer) => (
                  <TR key={customer.id}>
                    <TD>
                      <Link
                        href={`/agent/customers/${customer.id}`}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        {customer.user.fullName}
                      </Link>
                      <span className="mt-0.5 block font-mono text-xs text-slate-400">
                        {customer.customerCode}
                      </span>
                    </TD>
                    <TD>
                      <span className="block">{customer.user.phone}</span>
                      <span className="block text-xs text-slate-400">
                        {customer.user.email}
                      </span>
                    </TD>
                    <TD>
                      <StatusBadge status={customer.user.status} />
                    </TD>
                    <TD numeric>{customer._count.orders}</TD>
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
