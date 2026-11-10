"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function MonthlyTarget() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const series = [72];

  const options: ApexOptions = {
    colors: ["#10B981"],
    chart: {
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      type: "radialBar",
      height: 220,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "72%",
        },
        track: {
          background: isDark ? "#1F2937" : "#E4E7EC",
          strokeWidth: "100%",
          margin: 0,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            show: false,
          },
        },
      },
    },
    stroke: {
      lineCap: "round",
    },
  };

  return (
    <div className="rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Refill Quota &amp; Bottle Returns
        </span>
        <div className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mt-3">
          72%
        </div>
      </div>

      <div className="my-2 flex justify-center items-center relative overflow-hidden -mb-4">
        <Chart options={options} series={series} type="radialBar" height={220} width="100%" />
      </div>

      <div className="text-center pt-2">
        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500">
          Deviation Index 2% · 11,200 of 15,000 Refills
        </span>
      </div>
    </div>
  );
}
