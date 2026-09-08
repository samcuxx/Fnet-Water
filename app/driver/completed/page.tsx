import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard";
import { DeliveryCardList } from "@/components/deliveries/delivery-list";
import { Card, CardContent } from "@/components/ui";
import { requireDriver } from "@/lib/auth/dal";
import { listCompletedDeliveries } from "@/services/driver";

export const metadata: Metadata = {
  title: "Completed",
  description: "Deliveries you have completed.",
};

export default async function DriverCompletedPage() {
  const actor = await requireDriver();
  const deliveries = await listCompletedDeliveries(actor.driverId);

  return (
    <>
      <PageHeader
        title="Completed"
        description="Successful stops, most recent first."
      />
      <Card>
        <CardContent className="pt-6">
          <DeliveryCardList
            deliveries={deliveries}
            hrefFor={(id) => `/driver/assigned/${id}`}
            emptyTitle="No completed deliveries yet"
            emptyDescription="Finished stops will appear here after you record them."
          />
        </CardContent>
      </Card>
    </>
  );
}
