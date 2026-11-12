"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DispenserPayoffGaugeProps {
  amountPaid: number;
  totalCost: number;
  isFullyPaid: boolean;
}

export default function DispenserPayoffGauge({
  amountPaid,
  totalCost,
  isFullyPaid,
}: DispenserPayoffGaugeProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const percentage = Math.min(100, Number(((amountPaid / totalCost) * 100).toFixed(1)));
  const series = [percentage];

  const primaryColor = isFullyPaid ? "#10B981" : "#0057B8";

  const options: ApexOptions = {
    colors: [primaryColor],
    chart: {
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      type: "radialBar",
      height: 280,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -95,
        endAngle: 95,
        hollow: {
          size: "74%",
        },
        track: {
          background: isDark ? "#1F2937" : "#E4E7EC",
          strokeWidth: "100%",
          margin: 4,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "28px",
            fontWeight: "700",
            offsetY: -30,
            color: isDark ? "#F9FAFB" : "#1D2939",
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: [primaryColor],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Ownership Progress"],
  };

  return (
    <div className="rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Rent-to-Own Progress
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {isFullyPaid
                ? "Congratulations! You own this dispenser 100%"
                : "Monthly payments build toward permanent ownership"}
            </p>
          </div>
          {isFullyPaid ? (
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Customer Owned
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-brand-700 dark:bg-brand-950/40 dark:text-sky-400 border border-sky-200 dark:border-brand-800">
              Active Plan
            </span>
          )}
        </div>

        <div className="relative mt-2 flex items-center justify-center">
          <Chart options={options} series={series} type="radialBar" height={240} />
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-3 text-center text-xs">
        <div>
          <span className="text-gray-400 block text-[11px]">Paid so far</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
            GH₵ {amountPaid.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="text-gray-400 block text-[11px]">Total plan value</span>
          <span className="font-bold text-gray-900 dark:text-white text-sm">
            GH₵ {totalCost.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
