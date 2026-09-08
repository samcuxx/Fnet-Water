import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard";
import { DeliveryCardList } from "@/components/deliveries/delivery-list";
import { Card, CardContent } from "@/components/ui";
import { requireDriver } from "@/lib/auth/dal";
import { listDriverHistory } from "@/services/driver";

export const metadata: Metadata = {
  title: "History",
  description: "Completed, failed and cancelled deliveries.",
};

export default async function DriverHistoryPage() {
  const actor = await requireDriver();
  const deliveries = await listDriverHistory(actor.driverId);

  return (
    <>
      <PageHeader
        title="History"
        description="Your past attempts, including failed stops waiting for warehouse return."
      />
      <Card>
        <CardContent className="pt-6">
          <DeliveryCardList
            deliveries={deliveries}
            hrefFor={(id) => `/driver/assigned/${id}`}
            emptyTitle="No history yet"
            emptyDescription="Completed and failed deliveries will collect here."
          />
        </CardContent>
      </Card>
    </>
  );
}
