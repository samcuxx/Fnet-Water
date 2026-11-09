"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StatisticsChart() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "refills" | "dispensers">("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      labels: {
        colors: isDark ? "#9CA3AF" : "#667085",
      },
    },
    colors: ["#0057B8", "#00AEEF"],
    chart: {
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: [2.5, 2.5],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.45,
        opacityTo: 0.05,
      },
    },
    markers: {
      size: 0,
      hover: {
        size: 5,
      },
    },
    grid: {
      borderColor: isDark ? "#1F2937" : "#F2F4F7",
      strokeDashArray: 3,
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "category",
      categories: [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: isDark ? "#9CA3AF" : "#667085",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#9CA3AF" : "#667085",
          fontSize: "12px",
        },
        formatter: (val: number) => `GH₵ ${val}`,
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `GH₵ ${val}.00`,
      },
    },
  };

  const series = [
    {
      name: "19L Refill Revenue",
      data: activeTab === "dispensers" ? [400, 600, 800, 600, 900, 1100, 1200] : [2400, 3100, 2800, 4200, 3900, 4800, 5200],
    },
    {
      name: "Dispenser Financing",
      data: activeTab === "refills" ? [0, 0, 0, 0, 0, 0, 0] : [1200, 1800, 1500, 2200, 1900, 2400, 2800],
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-theme-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
            Daily Revenue Statistics
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Real-time revenue trends across mobile money and card payments
          </p>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
              activeTab === "all"
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-theme-xs"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            All Sales
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("refills")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
              activeTab === "refills"
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-theme-xs"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Refills
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dispensers")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
              activeTab === "dispensers"
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-theme-xs"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Dispensers
          </button>
        </div>
      </div>

      <div className="w-full">
        <Chart options={options} series={series} type="area" height={290} />
      </div>
    </div>
  );
}
