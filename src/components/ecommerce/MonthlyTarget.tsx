"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import type { ApexOptions } from "apexcharts";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";

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
    colors: ["#12b76a"],
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
          background: isDark ? "#1d2939" : "#e4e7ec",
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
    <Card className="flex flex-col justify-between h-full">
      <CardHeader>
        <div>
          <CardTitle className="text-sm font-semibold">Refill Quota & Returns</CardTitle>
          <p className="text-xs text-text-tertiary mt-0.5">Accra monthly fulfillment goal</p>
        </div>
      </CardHeader>

      <CardContent className="my-1 flex flex-col items-center justify-center">
        <div className="text-3xl font-black text-text-primary tracking-tight">
          72%
        </div>
        <div className="w-full flex justify-center items-center relative overflow-hidden -mb-4">
          <Chart options={options} series={series} type="radialBar" height={200} width="100%" />
        </div>
      </CardContent>

      <div className="text-center pt-2 border-t border-border-primary">
        <span className="text-[11px] font-medium text-text-tertiary">
          11,200 of 15,000 refills completed
        </span>
      </div>
    </Card>
  );
}
