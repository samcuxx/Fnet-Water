import type { Metadata } from "next";

import Link from "next/link";

import { PageHeader } from "@/components/dashboard";
import { PlaceOrderForm } from "@/components/orders/place-order-form";
import { buttonClasses, Card, CardContent } from "@/components/ui";
import { requireCustomer } from "@/lib/auth/dal";
import { formatMoney } from "@/lib/money";
import {
  getCustomerRewards,
  listCustomerAddresses,
} from "@/services/customer/account";
import { listOrderableProducts } from "@/services/orders/place";

import { placeCustomerOrder } from "./actions";

export const metadata: Metadata = {
  title: "Order water",
  description: "Place a refillable, takeaway or bulk water order.",
};

export default async function CustomerOrderPage() {
  const actor = await requireCustomer();
  const [products, addresses, rewards] = await Promise.all([
    listOrderableProducts(),
    listCustomerAddresses(actor.customerId),
    getCustomerRewards(actor.customerId),
  ]);

  return (
    <>
      <PageHeader
        title="Order water"
        description="Empty refillable bottles are expected back on delivery."
      />

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p className="text-sm text-slate-600">
              Add a delivery address before placing an order.
            </p>
            <Link href="/customer/addresses" className={buttonClasses()}>
              Add an address
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <PlaceOrderForm
              action={placeCustomerOrder}
              customerId={actor.customerId}
              products={products.map((product) => ({
                id: product.id,
                name: product.name,
                sku: product.sku,
                unitPriceLabel: formatMoney(product.unitPrice),
                requiresBottleExchange: product.requiresBottleExchange,
              }))}
              addresses={addresses.map((address) => ({
                id: address.id,
                label: address.label,
                addressLine: address.addressLine,
                city: address.city,
                isDefault: address.isDefault,
              }))}
              rewardsAvailable={rewards.balance?.available ?? 0}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}
