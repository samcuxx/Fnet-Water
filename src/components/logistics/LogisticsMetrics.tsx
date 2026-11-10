"use client";

import React from "react";
import Badge from "@/components/ui/badge/Badge";

export default function LogisticsMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
      {/* Metric 1 */}
      <div className="rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Active Delivery Runs
          </span>
          <Badge color="primary" size="sm">
            Live
          </Badge>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <h4 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            18 Orders
          </h4>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            4 Vans Dispatched
          </span>
        </div>
      </div>

      {/* Metric 2 */}
      <div className="rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            On-Time Dispatch Rate
          </span>
          <Badge color="success" size="sm">
            Optimal
          </Badge>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <h4 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            97.8%
          </h4>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            +2.4% vs last week
          </span>
        </div>
      </div>

      {/* Metric 3 */}
      <div className="rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Bottles Exchanged
          </span>
          <Badge color="info" size="sm">
            Returns
          </Badge>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <h4 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            348 Bottles
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
            348 Collected
          </span>
        </div>
      </div>

      {/* Metric 4 */}
      <div className="rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Damaged Bottle Alerts
          </span>
          <Badge color="error" size="sm">
            Quality Control
          </Badge>
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <h4 className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            2 Bottles
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
            Quarantined
          </span>
        </div>
      </div>
    </div>
  );
}
