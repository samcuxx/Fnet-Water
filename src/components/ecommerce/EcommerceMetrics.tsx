"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/tailgrids/core/card";
import { cn } from "@/utils/cn";
import { ArrowDownIcon, ArrowUpIcon } from "@/utils/icon";
import {
  InvoiceIcon,
  PieChartIcon,
  TableIcon,
  TaskIcon,
} from "@/components/common/sidebar/icon";
import Link from "next/link";
import React from "react";

interface MetricItem {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  href: string;
  icon: React.ReactNode;
  iconBgClass: string;
  iconColorClass: string;
}

const METRICS_DATA: MetricItem[] = [
  {
    id: "orders",
    title: "Daily Water Fulfilled",
    value: "4,850 L",
    change: "+12.4%",
    isPositive: true,
    href: "/admin/orders",
    icon: <TaskIcon />,
    iconBgClass: "bg-blue-light-50 dark:bg-blue-light-950",
    iconColorClass: "text-primary",
  },
  {
    id: "revenue",
    title: "Monthly Revenue",
    value: "GH₵ 42,650",
    change: "+8.6%",
    isPositive: true,
    href: "/admin/finance/revenue",
    icon: <InvoiceIcon />,
    iconBgClass: "bg-success-50 dark:bg-success-950",
    iconColorClass: "text-green-600",
  },
  {
    id: "bottles",
    title: "Bottles in Circulation",
    value: "1,420 Bottles",
    change: "-2.1%",
    isPositive: false,
    href: "/admin/bottles",
    icon: <TableIcon />,
    iconBgClass: "bg-brand-50 dark:bg-brand-950",
    iconColorClass: "text-brand-500",
  },
  {
    id: "delivery",
    title: "On-Time Dispatch Rate",
    value: "99.4%",
    change: "+1.8%",
    isPositive: true,
    href: "/admin/drivers",
    icon: <PieChartIcon />,
    iconBgClass: "bg-orange-50 dark:bg-orange-950",
    iconColorClass: "text-orange-500",
  },
];

export default function EcommerceMetrics() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {METRICS_DATA.map((item, idx) => (
        <Link key={item.id} href={item.href} className="group block focus:outline-none">
          <Card beamIndex={idx} className="transition-all duration-200 hover:border-primary/40 hover:shadow-xs">
            {/* 32x32 Tinted Icon */}
            <CardHeader className="justify-between">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg transition-transform group-hover:scale-105",
                  item.iconBgClass,
                  item.iconColorClass,
                )}
              >
                {item.icon}
              </div>
            </CardHeader>

            {/* Value */}
            <CardContent className="mt-3.5 sm:mt-5 p-0">
              <div className="text-lg leading-6 font-bold text-text-primary sm:text-xl md:text-2xl md:leading-8 tracking-tight">
                {item.value}
              </div>
            </CardContent>

            {/* Label and Trend Badge */}
            <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between p-0">
              <span className="text-[11px] leading-4 sm:text-xs sm:leading-5 font-medium text-text-tertiary truncate max-w-full">
                {item.title}
              </span>
              <div
                className={cn(
                  "flex items-center gap-1 text-[11px] leading-4 sm:text-xs sm:leading-5 font-semibold shrink-0",
                  item.isPositive ? "text-green-600" : "text-red-600",
                )}
              >
                <span>{item.change}</span>
                {item.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
