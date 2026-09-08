import type { Metadata } from "next";

import { Boxes } from "lucide-react";

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
import { requireDriver } from "@/lib/auth/dal";
import { formatNumber } from "@/lib/utils";
import { listDriverStock } from "@/services/driver";

export const metadata: Metadata = {
  title: "My stock",
  description: "Bottles currently assigned to your vehicle.",
};

export default async function DriverStockPage() {
  const actor = await requireDriver();
  const positions = await listDriverStock(actor.driverId);

  return (
    <>
      <PageHeader
        title="My stock"
        description="These positions change when a manager loads you or you complete a stop."
      />

      <Card>
        <CardContent className="p-0">
          {positions.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title="Nothing on the vehicle"
              description="Filled bottles appear here after a manager assigns a delivery."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Product</TH>
                  <TH>State</TH>
                  <TH numeric>Qty</TH>
                </TR>
              </THead>
              <TBody>
                {positions.map((row) => (
                  <TR key={row.id}>
                    <TD>
                      {row.product.name}
                      <span className="mt-0.5 block font-mono text-xs text-slate-400">
                        {row.product.sku}
                      </span>
                    </TD>
                    <TD>
                      <StatusBadge status={row.state} />
                    </TD>
                    <TD numeric>{formatNumber(row.quantity)}</TD>
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
