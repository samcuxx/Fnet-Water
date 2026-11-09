"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function DeliveryStatisticsChart() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 260,
      toolbar: { show: false },
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "48%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 3,
      colors: ["transparent"],
    },
    colors: ["#00AEEF", "#0057B8"],
    xaxis: {
      categories: [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
      ],
      axisTicks: { show: false },
      axisBorder: { show: false },
      labels: {
        style: {
          colors: isDark ? "#9CA3AF" : "#667085",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val}`,
        style: { fontSize: "12px", colors: isDark ? "#9CA3AF" : "#667085" },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} Deliveries`,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      labels: {
        colors: isDark ? "#9CA3AF" : "#667085",
      },
    },
    grid: {
      borderColor: isDark ? "#1F2937" : "#F2F4F7",
      strokeDashArray: 3,
    },
  };

  const series = [
    {
      name: "Scheduled Refills",
      data: [65, 78, 85, 92, 88, 70, 45],
    },
    {
      name: "Completed & Exchanged",
      data: [62, 75, 84, 90, 86, 68, 44],
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
            Daily Delivery Run Statistics
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Total completed vs scheduled routes across Ghana hubs
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-blue-light-400 self-start sm:self-auto">
          Weekly Fulfillment: 98.4%
        </span>
      </div>

      <div className="w-full">
        <Chart options={options} series={series} type="bar" height={260} />
      </div>
    </div>
  );
}
