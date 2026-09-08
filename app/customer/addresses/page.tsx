import type { Metadata } from "next";

import { MapPin } from "lucide-react";

import { PageHeader } from "@/components/dashboard";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/components/ui";
import { requireCustomer } from "@/lib/auth/dal";
import { listCustomerAddresses } from "@/services/customer/account";

import { AddressForm } from "./address-form";
import { removeAddress } from "./actions";

export const metadata: Metadata = {
  title: "Addresses",
  description: "Delivery addresses on your account.",
};

export default async function CustomerAddressesPage() {
  const actor = await requireCustomer();
  const addresses = await listCustomerAddresses(actor.customerId);

  return (
    <>
      <PageHeader
        title="Addresses"
        description="Orders use the address you pick at checkout."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <EmptyState
                icon={MapPin}
                title="No addresses yet"
                description="Add a home or shop address so we can deliver."
              />
            </CardContent>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card key={address.id}>
              <CardHeader>
                <CardTitle>
                  {address.label}
                  {address.isDefault ? " · Default" : ""}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AddressForm address={address} />
                <form action={removeAddress}>
                  <input type="hidden" name="id" value={address.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Remove
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))
        )}

        <Card>
          <CardHeader>
            <CardTitle>Add an address</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
