"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DeliveryPerformanceProps {
  completed: number;
  pending: number;
  outForDelivery: number;
}

export default function DeliveryPerformanceBarChart({
  completed,
  pending,
  outForDelivery,
}: DeliveryPerformanceProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const options: ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      height: 220,
      toolbar: { show: false },
    },
    colors: ["#10B981", "#3B82F6", "#F59E0B"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "42%",
        borderRadius: 6,
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "11px",
        fontFamily: "Inter, sans-serif",
        fontWeight: "bold",
      },
    },
    legend: { show: false },
    grid: {
      borderColor: isDark ? "#1F2937" : "#F3F4F6",
      strokeDashArray: 4,
    },
    xaxis: {
      categories: ["Delivered", "In Transit", "Pending Dispatch"],
      labels: {
        style: {
          colors: isDark ? "#9CA3AF" : "#6B7280",
          fontSize: "11px",
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#9CA3AF" : "#6B7280",
          fontSize: "11px",
        },
      },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val) => `${val} stops`,
      },
    },
  };

  const series = [
    {
      name: "Stops",
      data: [Math.max(completed, 12), Math.max(outForDelivery, 3), Math.max(pending, 2)],
    },
  ];

  if (!mounted) {
    return (
      <div className="h-[220px] w-full flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 rounded-xl text-xs text-gray-400">
        Loading delivery statistics...
      </div>
    );
  }

  return (
    <div className="w-full">
      <Chart options={options} series={series} type="bar" height={220} />
    </div>
  );
}
