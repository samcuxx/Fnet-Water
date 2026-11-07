"use client";

import React from "react";
import Badge from "@/components/ui/badge/Badge";

export default function EcommerceMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Metric 1: Customers */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <svg
            className="text-brand-600 dark:text-blue-light-400 size-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Active Customers
            </span>
            <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
              3,782
            </h4>
          </div>
          <Badge color="success" size="sm">
            <span className="text-xs font-semibold">&uarr; 11.01%</span>
          </Badge>
        </div>
      </div>

      {/* Metric 2: 19L Refill Orders */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <svg
            className="text-brand-600 dark:text-blue-light-400 size-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              19L Bottle Refills
            </span>
            <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
              5,359
            </h4>
          </div>

          <Badge color="success" size="sm">
            <span className="text-xs font-semibold">&uarr; 9.40%</span>
          </Badge>
        </div>
      </div>

      {/* Metric 3: Active Dispensers on Plan */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <svg
            className="text-brand-600 dark:text-blue-light-400 size-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="16" y1="14" x2="16" y2="18" />
            <path d="M12 12v6" />
            <path d="M8 12v6" />
          </svg>
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Dispensers on Plan
            </span>
            <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
              214
            </h4>
          </div>

          <Badge color="primary" size="sm">
            <span className="text-xs font-semibold">&uarr; 14.2%</span>
          </Badge>
        </div>
      </div>

      {/* Metric 4: MoMo & Card Revenue */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 shadow-theme-xs">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <svg
            className="text-brand-600 dark:text-blue-light-400 size-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Paystack MoMo Revenue
            </span>
            <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
              GH₵ 128,450
            </h4>
          </div>

          <Badge color="success" size="sm">
            <span className="text-xs font-semibold">&uarr; 18.5%</span>
          </Badge>
        </div>
      </div>
    </div>
  );
}
