"use client";

import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { ApexOptions } from "apexcharts";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

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
        colors: isDark ? "#98a2b3" : "#667085",
      },
    },
    colors: ["#0057b8", "#00aeef"],
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
      borderColor: isDark ? "#1d2939" : "#f2f4f7",
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
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: isDark ? "#98a2b3" : "#667085",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? "#98a2b3" : "#667085",
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
      data:
        activeTab === "dispensers"
          ? [400, 600, 800, 600, 900, 1100, 1200]
          : [2400, 3100, 2800, 4200, 3900, 4800, 5200],
    },
    {
      name: "Dispenser Financing",
      data:
        activeTab === "refills"
          ? [0, 0, 0, 0, 0, 0, 0]
          : [1200, 1800, 1500, 2200, 1900, 2400, 2800],
    },
  ];

  return (
    <Card className="p-5 sm:p-6">
      <CardHeader className="mb-4">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold">
            Daily Revenue Statistics
          </CardTitle>
          <p className="mt-0.5 text-xs text-text-tertiary">
            Real-time revenue trends across mobile money and bank settlements
          </p>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center gap-1 bg-background-gray-primary border border-card-border p-1 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
              activeTab === "all"
                ? "bg-card-background text-text-primary shadow-xs font-bold"
                : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            All Sales
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("refills")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
              activeTab === "refills"
                ? "bg-card-background text-text-primary shadow-xs font-bold"
                : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            Refills
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dispensers")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
              activeTab === "dispensers"
                ? "bg-card-background text-text-primary shadow-xs font-bold"
                : "text-text-tertiary hover:text-text-primary"
            }`}
          >
            Dispensers
          </button>
        </div>
      </CardHeader>

      <div className="w-full">
        <Chart options={options} series={series} type="area" height={290} />
      </div>
    </Card>
  );
}
