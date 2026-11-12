"use client";

import React from "react";
import Link from "next/link";

export default function WaterCategoryBreakdown() {
  const categories = [
    { name: "19L Refill Bottles", percent: "52%", color: "#10B981" },
    { name: "Smart Dispensers", percent: "22%", color: "#0284C7" },
    { name: "24-Pack Cases", percent: "12%", color: "#06B6D4" },
  ];

  return (
    <div className="rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Water Category Share
        </span>
        <div className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mt-3">
          86%
        </div>
      </div>

      <div className="my-4 space-y-2.5">
        {categories.map((c) => (
          <div key={c.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                style={{ backgroundColor: c.color }}
                className="size-2 rounded-full shrink-0"
              />
              <span className="font-medium text-gray-600 dark:text-gray-300">
                {c.name}
              </span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              {c.percent}
            </span>
          </div>
        ))}
      </div>

      <div>
        <Link
          href="/admin/inventory"
          className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700/80 border border-gray-200/80 dark:border-gray-700 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

