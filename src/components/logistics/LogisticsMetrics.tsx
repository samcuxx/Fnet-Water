"use client";

import React from "react";
import Badge from "@/components/ui/badge/Badge";

export default function LogisticsMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {/* Metric 1 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Active Delivery Runs
          </span>
          <Badge color="primary" size="sm">
            Live
          </Badge>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
            18 Orders
          </h4>
          <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
            4 Vans Dispatched
          </span>
        </div>
      </div>

      {/* Metric 2 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            On-Time Dispatch Rate
          </span>
          <Badge color="success" size="sm">
            Optimal
          </Badge>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
            97.8%
          </h4>
          <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
            &uarr; 2.4% vs last week
          </span>
        </div>
      </div>

      {/* Metric 3 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            1:1 Bottles Exchanged
          </span>
          <Badge color="info" size="sm">
            Dual Stock
          </Badge>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
            348 Bottles
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            348 Collected
          </span>
        </div>
      </div>

      {/* Metric 4 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            Damaged Bottle Alerts
          </span>
          <Badge color="error" size="sm">
            Quality Control
          </Badge>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <h4 className="text-2xl font-bold text-red-600 dark:text-red-400">
            2 Bottles
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Quarantined
          </span>
        </div>
      </div>
    </div>
  );
}
