"use client";

import React from "react";
import Link from "next/link";
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
        <div className="pb-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
              Coordinate drivers, track bottle returns, and balance factory stock.
            </p>
          </div>

          <Link
            href="/manager/deliveries"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs self-start sm:self-auto cursor-pointer"
          >
            <span>Delivery Queue</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
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
