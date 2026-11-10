"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface RevenueTrendChartProps {
  data: Array<{ date: string; amount: number; orderCount: number }>;
}

export default function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const categories = data.length > 0 ? data.map((d) => d.date) : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const seriesData = data.length > 0 ? data.map((d) => d.amount) : [320, 580, 890, 720, 1150, 1420, 980];

  const options: ApexOptions = {
    chart: {
      type: "area",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      height: 290,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#0057B8"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 95, 100],
      },
    },
    stroke: {
      curve: "smooth",
      width: 2.5,
      colors: ["#0057B8"],
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: isDark ? "#1F2937" : "#F3F4F6",
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories,
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
        formatter: (val) => `GH₵ ${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0)}`,
      },
    },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val) => `GH₵ ${val.toFixed(2)}`,
      },
    },
  };

  const series = [
    {
      name: "Gross Revenue",
      data: seriesData,
    },
  ];

  if (!mounted) {
    return (
      <div className="h-[290px] w-full flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 rounded-xl text-xs text-gray-400">
        Loading revenue trends...
      </div>
    );
  }

  return (
    <div className="w-full">
      <Chart options={options} series={series} type="area" height={290} />
    </div>
  );
}
