"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface BottleDistributionChartProps {
  filledWarehouse: number;
  emptyWarehouse: number;
  withCustomers: number;
  damaged: number;
  lost: number;
}

export default function BottleDistributionChart({
  filledWarehouse,
  emptyWarehouse,
  withCustomers,
  damaged,
  lost,
}: BottleDistributionChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const series = [
    {
      name: "Bottles Count",
      data: [filledWarehouse, emptyWarehouse, withCustomers, damaged, lost],
    },
  ];

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 280,
      toolbar: { show: false },
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 6,
        borderRadiusApplication: "end",
        distributed: true,
      },
    },
    colors: [
      "#0057B8", // Filled (Brand Blue)
      "#00AEEF", // Empty (Cyan)
      "#10B981", // With Customers (Emerald)
      "#F59E0B", // Damaged (Amber)
      "#EF4444", // Lost (Red)
    ],
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: "12px",
        fontWeight: "700",
        colors: [isDark ? "#F9FAFB" : "#374151"],
      },
      formatter: (val) => `${val}`,
    },
    legend: {
      show: false,
    },
    xaxis: {
      categories: [
        "Filled (Warehouse)",
        "Empty (Warehouse)",
        "With Customers",
        "Damaged",
        "Lost",
      ],
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: {
        style: {
          colors: isDark ? "#9CA3AF" : "#6B7280",
          fontSize: "11px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#9CA3AF" : "#6B7280",
          fontSize: "11px",
        },
      },
    },
    grid: {
      borderColor: isDark ? "#1F2937" : "#E5E7EB",
      strokeDashArray: 4,
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} bottles`,
      },
    },
  };

  return (
    <div className="rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
            Bottle Fleet Distribution
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Real-time balance across warehouse and customer locations
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-brand-500 inline-block" />
            Filled
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500 inline-block" />
            With Customers
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500 inline-block" />
            Damaged
          </span>
        </div>
      </div>

      <Chart options={options} series={series} type="bar" height={260} />
    </div>
  );
}
