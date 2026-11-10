"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ProductDistributionProps {
  categories: Array<{
    name: string;
    unitsSold: number;
    revenueGHS: number;
    percentage: number;
  }>;
}

export default function ProductDistributionDonutChart({
  categories,
}: ProductDistributionProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const labels = categories.map((c) => c.name);
  const series = categories.map((c) => c.percentage);

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      height: 240,
    },
    colors: ["#0057B8", "#00AEEF", "#F59E0B"],
    labels,
    stroke: {
      colors: [isDark ? "#111827" : "#FFFFFF"],
      width: 2,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: false,
              label: "Sales Mix",
              fontSize: "12px",
              fontWeight: 600,
              color: isDark ? "#9CA3AF" : "#6B7280",
              formatter: () => "100%",
            },
            value: {
              fontSize: "18px",
              fontWeight: 800,
              color: isDark ? "#FFFFFF" : "#111827",
              formatter: (val) => `${val}%`,
            },
          },
        },
      },
    },
    legend: {
      position: "bottom",
      fontSize: "11px",
      fontFamily: "Inter, sans-serif",
      labels: {
        colors: isDark ? "#D1D5DB" : "#374151",
      },
      itemMargin: { horizontal: 6, vertical: 2 },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: isDark ? "dark" : "light",
      y: {
        formatter: (val) => `${val}% of revenue`,
      },
    },
  };

  if (!mounted) {
    return (
      <div className="h-[240px] w-full flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 rounded-xl text-xs text-gray-400">
        Loading product sales distribution...
      </div>
    );
  }

  return (
    <div className="w-full">
      <Chart options={options} series={series} type="donut" height={240} />
    </div>
  );
}
