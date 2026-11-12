"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ReferralProgressGaugeProps {
  progressTowardsNext: number; // 0 to 4 (number of qualified referrals in current cycle)
  freeBottlesEarned: number;   // all-time free bottles earned
  freeBottleBalance: number;   // unredeemed free bottles ready to spend
}

export default function ReferralProgressGauge({
  progressTowardsNext,
  freeBottlesEarned,
  freeBottleBalance,
}: ReferralProgressGaugeProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const progressPercent = Math.round((progressTowardsNext / 5) * 100);
  const remainingNeeded = 5 - progressTowardsNext;
  const series = [progressPercent];

  const options: ApexOptions = {
    colors: ["#0057B8"],
    chart: {
      fontFamily: "Outfit, Inter, sans-serif",
      type: "radialBar",
      height: 260,
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
          margin: 4,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "26px",
            fontWeight: "800",
            offsetY: -26,
            color: isDark ? "#F9FAFB" : "#1D2939",
            formatter: () => `${progressTowardsNext} / 5`,
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: [progressTowardsNext >= 4 ? "#10B981" : "#0057B8"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: ["Reward Progress"],
  };

  return (
    <div className="rounded-xl border border-border bg-card text-card-foreground p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-card-foreground">
              Free Bottle Goal
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              5:1 Referral reward progress
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {freeBottleBalance} Available
          </span>
        </div>

        <div className="relative mt-2 flex items-center justify-center">
          <Chart options={options} series={series} type="radialBar" height={220} />
        </div>

        <div className="text-center -mt-6">
          <p className="text-xs font-semibold text-card-foreground">
            {remainingNeeded === 1
              ? "Just 1 more friend needed for your next free refill bottle!"
              : `${remainingNeeded} more friends needed to earn your next free bottle.`}
          </p>
          <span className="text-[11px] text-muted-foreground block mt-0.5">
            Each free bottle saves you GH₵ 25.00 on delivery
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-muted/50">
          <span className="text-muted-foreground text-[10px] block">All-Time Free Bottles</span>
          <span className="font-bold text-card-foreground text-sm">
            {freeBottlesEarned} Earned
          </span>
        </div>
        <div className="p-2 rounded-xl bg-emerald-500/10">
          <span className="text-emerald-600 dark:text-emerald-400 text-[10px] block">Ready to Spend</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
            {freeBottleBalance} Bottles
          </span>
        </div>
      </div>
    </div>
  );
}
