"use client";

import React from "react";

export default function FleetEfficiencyPill() {
  return (
    <div className="rounded-[28px] bg-[#0B1E38] text-white p-5 sm:p-6 shadow-sm flex items-center gap-4 sm:gap-5 h-full">
      {/* Circular Radial Ring */}
      <div className="relative size-16 sm:size-18 shrink-0 flex items-center justify-center">
        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-white/15"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-emerald-400"
            strokeDasharray="94.2, 100"
            strokeWidth="3.5"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-black text-white">94.2</span>
        </div>
      </div>

      <div className="min-w-0">
        <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
          Fleet Dispatch Efficiency
        </h4>
        <p className="mt-1 text-xs text-blue-200/70 leading-relaxed">
          Real-time GPS routing across 18 active delivery vans in Greater Accra.
        </p>
      </div>
    </div>
  );
}

