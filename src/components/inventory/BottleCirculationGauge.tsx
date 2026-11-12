"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface BottleCirculationGaugeProps {
  ratePercent: number;
  totalFleet: number;
  withCustomers: number;
  inWarehouse: number;
}

export default function BottleCirculationGauge({
  ratePercent,
  totalFleet,
  withCustomers,
  inWarehouse,
}: BottleCirculationGaugeProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const series = [ratePercent];

  const options: ApexOptions = {
    colors: ["#0057B8"],
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
        startAngle: -90,
        endAngle: 90,
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
      colors: ["#0057B8"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Circulation Health"],
  };

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-card-foreground">
              Bottle Circulation
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Active working bottles across customer fleet
            </p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Active Fleet
          </span>
        </div>

        <div className="relative mt-2 flex items-center justify-center">
          <Chart options={options} series={series} type="radialBar" height={240} />
        </div>
      </div>

      <div className="pt-3 border-t border-border grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <span className="text-muted-foreground block text-[11px]">With Customers</span>
          <span className="font-bold text-card-foreground text-sm">
            {withCustomers}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground block text-[11px]">In Warehouse</span>
          <span className="font-bold text-card-foreground text-sm">
            {inWarehouse}
          </span>
        </div>
        <div>
          <span className="text-gray-400 block text-[11px]">Total Fleet</span>
          <span className="font-bold text-brand-600 dark:text-blue-light-400 text-sm">
            {totalFleet}
          </span>
        </div>
      </div>
    </div>
  );
}
