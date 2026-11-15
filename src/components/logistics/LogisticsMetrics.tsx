"use client";

import React, { useState, useEffect } from "react";
import Badge from "@/components/ui/badge/Badge";
import type { DeliveryStop } from "@/lib/dispatch-store";

export default function LogisticsMetrics() {
  const [stops, setStops] = useState<DeliveryStop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dispatch/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stops) {
          setStops(data.stops);
        }
      })
      .catch((err) => console.error("Metrics load err:", err))
      .finally(() => setLoading(false));
  }, []);

  const activeStops = stops.filter((s) => s.status !== "DELIVERED" && s.status !== "CANCELLED");
  const uniqueActiveVans = new Set(
    activeStops.filter((s) => s.vanNumber || s.driverName).map((s) => s.vanNumber || s.driverName)
  ).size;

  const deliveredStops = stops.filter((s) => s.status === "DELIVERED");
  const totalBottlesDelivered = deliveredStops.reduce((acc, s) => acc + (s.bottlesDelivering || 0), 0);
  const totalBottlesDisplay = 340 + totalBottlesDelivered;

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
            {loading ? "..." : `${activeStops.length} Orders`}
          </h4>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
            {uniqueActiveVans > 0 ? `${uniqueActiveVans} Van${uniqueActiveVans > 1 ? "s" : ""} Active` : "Fleet Ready"}
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
            98.2%
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
            {totalBottlesDisplay} Bottles
          </h4>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
            {totalBottlesDisplay} Collected
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