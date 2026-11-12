"use client";

import React from "react";

export default function FactoryBufferCard() {
  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground p-5 sm:p-6 shadow-xs flex items-center gap-4 sm:gap-5 h-full">
      {/* Circular Aqua Ring */}
      <div className="relative size-16 sm:size-18 shrink-0 flex items-center justify-center">
        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-muted"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-primary"
            strokeDasharray="88, 100"
            strokeWidth="3.5"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black text-card-foreground">8.4k</span>
        </div>
      </div>

      <div className="min-w-0">
        <h4 className="text-sm sm:text-base font-bold text-card-foreground tracking-tight">
          Factory Bottling Buffer
        </h4>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          8,400 sealed 19L bottles ready for same-day dispatch.
        </p>
      </div>
    </div>
  );
}

