"use client";

import React from "react";

export default function AccraDeliveryZones() {
  const zones = [
    { name: "East Legon", percent: 89, level: "High Volume" },
    { name: "Cantonments", percent: 82 },
    { name: "Osu", percent: 85 },
    { name: "Airport Res.", percent: 80 },
    { name: "Ridge", percent: 79 },
    { name: "Spintex", percent: 76 },
  ];

  return (
    <div className="rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 p-5 sm:p-6 shadow-xs h-full flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Greater Accra Delivery Zones
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Fulfillment density and active van route coverage across Accra.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-3">
        {/* Left: Zone list */}
        <div className="sm:col-span-7 space-y-2">
          {zones.map((z) => (
            <div key={z.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {z.name}
                </span>
                {z.level && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold">
                    {z.level}
                  </span>
                )}
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {z.percent}%
              </span>
            </div>
          ))}
        </div>

        {/* Right: Modern Route Map Visual Indicator */}
        <div className="sm:col-span-5 relative rounded-2xl bg-gradient-to-br from-blue-50/80 via-sky-50/50 to-indigo-50/60 dark:from-gray-800/60 dark:to-gray-800/30 border border-blue-100/70 dark:border-gray-700/60 p-4 flex flex-col items-center justify-center text-center">
          <div className="relative size-16 flex items-center justify-center mb-2">
            <span className="absolute inset-0 rounded-full bg-brand-500/15 animate-ping" />
            <div className="size-12 rounded-full bg-brand-500 text-white flex items-center justify-center font-black text-sm shadow-sm">
              89%
            </div>
          </div>
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            Accra Metro
          </span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
            18 Vans En Route
          </span>
        </div>
      </div>

      <div className="pt-2 text-right">
        <span className="text-[11px] font-semibold text-brand-600 dark:text-sky-400 cursor-pointer hover:underline">
          View Fleet Map →
        </span>
      </div>
    </div>
  );
}

