"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/badge/Badge";
import type { DriverProfile } from "@/lib/dispatch-store";

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDrivers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dispatch/drivers");
      if (res.ok) {
        const d = await res.json();
        setDrivers(d.drivers || []);
      }
    } catch (err) {
      console.error("Failed to load drivers:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  return (
    <AppLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Fleet Drivers &amp; Delivery Vans
              </h1>
              <Badge color="primary" size="sm">
                Logistics Fleet
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Assigned van drivers, vehicle registrations, and real-time delivery workloads in Accra.
            </p>
          </div>
        </div>

        {/* Drivers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {drivers.map((drv) => (
            <div
              key={drv.id}
              className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-blue-light-400 flex items-center justify-center font-bold text-base">
                    {drv.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {drv.name}
                    </h3>
                    <span className="text-[11px] text-gray-400 font-mono">{drv.phone}</span>
                  </div>
                </div>
                <Badge color={drv.isAvailable ? "success" : "info"} size="sm">
                  {drv.isAvailable ? "Available" : "On Duty"}
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Van &amp; Reg:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{drv.vanNumber}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">License Plate:</span>
                  <span className="font-mono font-medium text-gray-800 dark:text-gray-200">{drv.licensePlate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Pending Stops:</span>
                  <span className="font-bold text-amber-600">{drv.activeStopsCount} stops</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Completed Stops Today:</span>
                  <span className="font-bold text-emerald-600">{drv.completedStopsCount} deliveries</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`tel:${drv.phone}`}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-brand-600 dark:text-blue-light-400 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 dark:hover:bg-brand-950/70 transition flex items-center justify-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Call Driver</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
