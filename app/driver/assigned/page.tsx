import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard";
import { DeliveryCardList } from "@/components/deliveries/delivery-list";
import { Card, CardContent } from "@/components/ui";
import { requireDriver } from "@/lib/auth/dal";
import { listAssignedDeliveries } from "@/services/driver";

export const metadata: Metadata = {
  title: "Assigned",
  description: "Open deliveries on your round.",
};

export default async function DriverAssignedPage() {
  const actor = await requireDriver();
  const deliveries = await listAssignedDeliveries(actor.driverId);

  return (
    <>
      <PageHeader
        title="Assigned"
        description="Open a delivery to record the exchange and any cash collected."
      />
      <Card>
        <CardContent className="pt-6">
          <DeliveryCardList
            deliveries={deliveries}
            hrefFor={(id) => `/driver/assigned/${id}`}
            emptyTitle="Nothing assigned right now"
            emptyDescription="When a manager assigns you a delivery it will appear here."
          />
        </CardContent>
      </Card>
    </>
  );
}
