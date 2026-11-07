"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import LogisticsMetrics from "@/components/logistics/LogisticsMetrics";
import DeliveryStatisticsChart from "@/components/logistics/DeliveryStatisticsChart";
import DeliveryVehicle from "@/components/logistics/DeliveryVehicle";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import Badge from "@/components/ui/badge/Badge";

export default function ManagerDashboardPage() {
  return (
    <AppLayout role="MANAGER">
      <div className="space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Dispatch Hub &amp; Logistics Control
              </h1>
              <Badge color="info" size="sm">
                Manager
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Coordinate van drivers, track 1:1 bottle returns, and balance factory stock.
            </p>
          </div>
        </div>

        {/* 1. Logistics Metrics Cards */}
        <LogisticsMetrics />

        {/* 2. Charts & Fleet Tracking Grid */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 xl:col-span-7">
            <DeliveryStatisticsChart />
          </div>

          <div className="col-span-12 xl:col-span-5">
            <DeliveryVehicle />
          </div>
        </div>

        {/* 3. Live Order Fulfillment Queue */}
        <RecentOrders />
      </div>
    </AppLayout>
  );
}
