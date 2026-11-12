"use client";

import React from "react";
import Link from "next/link";

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  isPositive?: boolean;
  barColor: string;
  barHeights: number[]; // e.g. [35, 60, 45, 90, 70]
  href: string;
}

function MiniBarChart({ color, heights }: { color: string; heights: number[] }) {
  return (
    <div className="flex items-end gap-1.5 h-8">
      {heights.map((h, i) => (
        <span
          key={i}
          style={{ height: `${h}%`, backgroundColor: color }}
          className="w-1.5 rounded-full opacity-85 transition-all duration-300 group-hover:opacity-100"
        />
      ))}
    </div>
  );
}

function MetricCard({
  title,
  value,
  trend,
  isPositive = true,
  barColor,
  barHeights,
  href,
}: MetricCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {title}
        </span>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {value}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`text-xs font-bold flex items-center gap-0.5 ${
                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
              }`}
            >
              <span>{isPositive ? "↗" : "↘"}</span>
              <span>{trend}</span>
            </span>
            <span className="text-[11px] text-gray-400">vs last month</span>
          </div>
        </div>

        <div className="shrink-0">
          <MiniBarChart color={barColor} heights={barHeights} />
        </div>
      </div>
    </Link>
  );
}

export default function EcommerceMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      <MetricCard
        title="Daily Pure Water Fulfilled"
        value="4,850 Liters"
        trend="12.4%"
        isPositive={true}
        barColor="#10B981"
        barHeights={[40, 75, 50, 95, 65]}
        href="/admin/orders"
      />

      <MetricCard
        title="On-Time Delivery Rate"
        value="99.4%"
        trend="1.8%"
        isPositive={true}
        barColor="#EF4444"
        barHeights={[65, 45, 80, 55, 90]}
        href="/admin/deliveries"
      />

      <MetricCard
        title="Monthly Revenue & MoMo"
        value="GH₵ 113,300"
        trend="14.2%"
        isPositive={true}
        barColor="#0057B8"
        barHeights={[50, 70, 85, 60, 100]}
        href="/admin/finance/transactions"
      />
    </div>
  );
}
