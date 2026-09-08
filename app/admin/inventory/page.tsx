import type { Metadata } from "next";

import { Boxes } from "lucide-react";

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
import { requireAdministrator } from "@/lib/auth/dal";
import { formatDateTime, formatNumber, humanizeEnum } from "@/lib/utils";
import {
  listInventoryAdjustments,
  listInventoryMovements,
  listStockPositions,
} from "@/services/admin/inventory";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Stock positions, movements and adjustment requests.",
};

export default async function AdminInventoryPage() {
  await requireAdministrator();
  const [positions, movements, adjustments] = await Promise.all([
    listStockPositions(),
    listInventoryMovements(),
    listInventoryAdjustments(),
  ]);

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Positions are derived from the movement ledger, not from editable counters."
      />

      <Card>
        <CardHeader>
          <CardTitle>Stock positions</CardTitle>
          <CardDescription>
            Quantity per product, state and holder.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {positions.length === 0 ? (
            <EmptyState
              icon={Boxes}
              title="No stock positions"
              description="Positions appear after the first inventory movement."
            />
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Product</TH>
                  <TH>State</TH>
                  <TH>Holder</TH>
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
                    <TD className="text-slate-500">
                      {humanizeEnum(row.holderType)}
                      {row.holderId ? ` · ${row.holderId.slice(0, 8)}` : ""}
                    </TD>
                    <TD numeric>{formatNumber(row.quantity)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent movements</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>When</TH>
                  <TH>Type</TH>
                  <TH numeric>Qty</TH>
                </TR>
              </THead>
              <TBody>
                {movements.map((row) => (
                  <TR key={row.id}>
                    <TD className="whitespace-nowrap text-slate-500">
                      {formatDateTime(row.occurredAt)}
                      <span className="mt-0.5 block font-mono text-xs text-slate-400">
                        {row.reference}
                      </span>
                    </TD>
                    <TD>
                      {humanizeEnum(row.movementType)}
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {row.product.sku}
                      </span>
                    </TD>
                    <TD numeric>{row.quantity}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adjustments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <THead>
                <TR>
                  <TH>Reference</TH>
                  <TH>Delta</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {adjustments.map((row) => (
                  <TR key={row.id}>
                    <TD>
                      {row.reference}
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {row.product.name} · {row.requestedByUser.fullName}
                      </span>
                    </TD>
                    <TD numeric>{row.deltaQuantity}</TD>
                    <TD>
                      <StatusBadge status={row.status} />
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
