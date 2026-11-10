"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface BottleCirculationProps {
  circulationRatePercent: number;
  withCustomers: number;
  totalFleet: number;
}

export default function BottleCirculationRadialGauge({
  circulationRatePercent,
  withCustomers,
  totalFleet,
}: BottleCirculationProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const rate = Math.min(100, Math.max(0, circulationRatePercent));

  const options: ApexOptions = {
    chart: {
      type: "radialBar",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      height: 240,
      sparkline: { enabled: true },
    },
    colors: ["#0057B8"],
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: isDark ? "#1F2937" : "#E5E7EB",
          strokeWidth: "97%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: "12px",
            color: isDark ? "#9CA3AF" : "#6B7280",
            offsetY: -20,
          },
          value: {
            offsetY: -10,
            fontSize: "24px",
            fontWeight: "900",
            color: isDark ? "#FFFFFF" : "#111827",
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        gradientToColors: ["#00AEEF"],
        stops: [0, 100],
      },
    },
    labels: ["Customer Fleet"],
  };

  const series = [rate];

  if (!mounted) {
    return (
      <div className="h-[240px] w-full flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 rounded-xl text-xs text-gray-400">
        Loading fleet circulation...
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <Chart options={options} series={series} type="radialBar" height={240} />
      <div className="text-center -mt-6">
        <p className="text-xs font-bold text-gray-900 dark:text-white">
          {withCustomers} of {totalFleet} Bottles
        </p>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Actively in circulation across customer sites
        </p>
      </div>
    </div>
  );
}
