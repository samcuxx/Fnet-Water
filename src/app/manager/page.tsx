"use client";

import RecentOrders from "@/components/ecommerce/RecentOrders";
import AppLayout from "@/components/layout/AppLayout";
import DeliveryStatisticsChart from "@/components/logistics/DeliveryStatisticsChart";
import DeliveryVehicle from "@/components/logistics/DeliveryVehicle";
import LogisticsMetrics from "@/components/logistics/LogisticsMetrics";
import Breadcrumbs from "@/components/tailgrids/core/breadcrumbs";
import { Button } from "@/components/tailgrids/core/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function ManagerDashboardPage() {
  return (
    <AppLayout role="MANAGER">
      <div className="mt-4 space-y-6 px-2 lg:px-4">
        {/* NextAdmin Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="mb-2">
              <Breadcrumbs
                dividerType="chevron"
                items={[
                  { label: "Home", href: "/manager" },
                  { label: "Portals", href: "/manager" },
                  { label: "Operations Manager" },
                ]}
              />
            </div>
            <h1 className="mb-1 text-[28px] leading-8 font-semibold text-text-primary tracking-tight">
              Dispatch Hub &amp; Logistics Control
            </h1>
            <p className="text-sm leading-5 text-text-tertiary">
              Coordinate drivers, track bottle returns, and balance factory buffer stock across Accra.
            </p>
          </div>

          <Button asChild size="md" className="gap-1.5 self-start sm:self-auto cursor-pointer">
            <Link href="/admin/orders">
              <span>Fulfillment Queue</span>
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>

        {/* 1. NextAdmin Logistics Metrics 4-Card Overview */}
        <LogisticsMetrics />

        {/* 2. Charts & Fleet Tracking Grid */}
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-12 xl:col-span-7">
            <DeliveryStatisticsChart />
          </div>

          <div className="col-span-12 xl:col-span-5">
            <DeliveryVehicle />
          </div>
        </div>

        {/* 3. Live Order Fulfillment Queue Table */}
        <RecentOrders />
      </div>
    </AppLayout>
  );
}
