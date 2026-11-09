"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function MonthlySalesChart() {
  const [timeframe, setTimeframe] = useState<"2026" | "2025">("2026");

  const options: ApexOptions = {
    colors: ["#0057B8"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 200,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "38%",
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
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#667085",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#667085",
          fontSize: "12px",
        },
        formatter: (val: number) => `${val}`,
      },
    },
    grid: {
      borderColor: "#F2F4F7",
      strokeDashArray: 3,
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} Refill Bottles`,
      },
    },
  };

  const series = [
    {
      name: "19L Refill Bottles",
      data:
        timeframe === "2026"
          ? [320, 480, 410, 590, 620, 710, 680, 750, 810, 890, 940, 1020]
          : [210, 260, 310, 340, 390, 420, 460, 490, 530, 580, 620, 690],
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-theme-xs">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
            Monthly Water Refills (19L)
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Total refill bottles delivered nationwide
          </p>
        </div>

        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value as "2026" | "2025")}
          className="text-xs h-8 px-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-hidden focus:border-brand-500"
        >
          <option value="2026">Year 2026</option>
          <option value="2025">Year 2025</option>
        </select>
      </div>

      <div className="w-full">
        <Chart options={options} series={series} type="bar" height={220} />
      </div>
    </div>
  );
}
