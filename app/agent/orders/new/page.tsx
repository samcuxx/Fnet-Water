import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard";
import { PlaceOrderForm } from "@/components/orders/place-order-form";
import { Card, CardContent } from "@/components/ui";
import { requireAgent } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import { getAgentCustomer, listAgentCustomers } from "@/services/agent";
import { listOrderableProducts } from "@/services/orders/place";

import { CustomerPicker } from "./customer-picker";
import { placeAgentOrder } from "../actions";

export const metadata: Metadata = {
  title: "Place order",
  description: "Order water for one of your customers.",
};

export default async function AgentPlaceOrderPage({
  searchParams,
}: PageProps<"/agent/orders/new">) {
  const actor = await requireAgent();
  const params = await searchParams;
  const selectedId =
    typeof params.customerId === "string" ? params.customerId : undefined;

  const [customers, products] = await Promise.all([
    listAgentCustomers(actor.agentId),
    listOrderableProducts(),
  ]);

  const customer = selectedId
    ? await getAgentCustomer(actor.agentId, selectedId)
    : customers[0]
      ? await getAgentCustomer(actor.agentId, customers[0].id)
      : null;

  return (
    <>
      <PageHeader
        title="Place order"
        description="Prices are copied onto the order so later catalogue changes never rewrite it."
      />

      {!customer ? (
        <Card>
          <CardContent className="pt-6 text-sm text-slate-500">
            Register a customer before placing an order.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-6 pt-6">
            <CustomerPicker customers={customers} selectedId={customer.id} />

            <PlaceOrderForm
              action={placeAgentOrder}
              customerId={customer.id}
              products={products.map((product) => ({
                id: product.id,
                name: product.name,
                sku: product.sku,
                unitPriceLabel: formatMoney(product.unitPrice),
                requiresBottleExchange: product.requiresBottleExchange,
              }))}
              addresses={customer.addresses.map((address) => ({
                id: address.id,
                label: address.label,
                addressLine: address.addressLine,
                city: address.city,
                isDefault: address.isDefault,
              }))}
              rewardsAvailable={customer.rewardBalance?.available ?? 0}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}
