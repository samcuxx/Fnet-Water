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
  const series = [75.55];

  const options: ApexOptions = {
    colors: ["#0057B8"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 300,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: {
          size: "78%",
        },
        track: {
          background: isDark ? "#1F2937" : "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "32px",
            fontWeight: "700",
            offsetY: -35,
            color: isDark ? "#F9FAFB" : "#1D2939",
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#0057B8"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Monthly Target"],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-theme-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
            Monthly Target
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 font-semibold">
            On Track
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Target set for refill delivery &amp; dispenser financing
        </p>
      </div>

      <div className="my-2 flex justify-center">
        <Chart options={options} series={series} type="radialBar" height={280} />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
        <div>
          <span className="text-[11px] text-gray-400 block">Target</span>
          <span className="text-xs sm:text-sm font-bold text-gray-800 dark:text-white">
            GH₵ 150K
          </span>
        </div>
        <div>
          <span className="text-[11px] text-gray-400 block">Revenue</span>
          <span className="text-xs sm:text-sm font-bold text-brand-600 dark:text-blue-light-400">
            GH₵ 113.3K
          </span>
        </div>
        <div>
          <span className="text-[11px] text-gray-400 block">Today</span>
          <span className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400">
            GH₵ 4,250
          </span>
        </div>
      </div>
    </div>
  );
}
