"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import EcommerceMetrics from "@/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";

export default function AdminDashboardPage() {
  return (
    <AppLayout role="ADMIN">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="pb-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Operations &amp; Executive Overview
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Real-time analytics for water refills, bottle exchange, dispensers, and revenue across Ghana.
            </p>
          </div>
        </div>

        {/* Grid Structure: Executive Dashboard Archetype (Ecommerce.tsx) */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Top Row: 4 KPI Metrics Cards (12 cols) */}
          <div className="col-span-12">
            <EcommerceMetrics />
          </div>

          {/* Middle Row (7 / 5 Column Split): Bar Chart (7 cols) & Radial Gauge (5 cols) */}
          <div className="col-span-12 xl:col-span-7">
            <MonthlySalesChart />
          </div>

          <div className="col-span-12 xl:col-span-5">
            <MonthlyTarget />
          </div>

          {/* Full Width: Daily Revenue Statistics (Area & Line Chart) */}
          <div className="col-span-12">
            <StatisticsChart />
          </div>

          {/* Bottom Table: Recent Orders */}
          <div className="col-span-12">
            <RecentOrders />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
