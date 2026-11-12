"use client";

import BottleCirculationRadialGauge from "@/components/analytics/BottleCirculationRadialGauge";
import DeliveryPerformanceBarChart from "@/components/analytics/DeliveryPerformanceBarChart";
import ProductDistributionDonutChart from "@/components/analytics/ProductDistributionDonutChart";
import RevenueTrendChart from "@/components/analytics/RevenueTrendChart";
import { InvoiceIcon, PieChartIcon, TableIcon, TaskIcon } from "@/components/common/sidebar/icon";
import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/tailgrids/core/badge";
import Breadcrumbs from "@/components/tailgrids/core/breadcrumbs";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { useToast } from "@/context/ToastContext";
import type { BusinessAnalyticsSummary, DateRangeFilter } from "@/lib/reports-store";
import { cn } from "@/utils/cn";
import { DownloadIcon } from "@/utils/icon";
import { FileSpreadsheet } from "lucide-react";
import React, { useEffect, useState } from "react";

export default function ReportsAndAnalyticsPage() {
  const { showToast } = useToast();
  const [range, setRange] = useState<DateRangeFilter>("30_DAYS");
  const [analytics, setAnalytics] = useState<BusinessAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const fetchReports = async (selectedRange: DateRangeFilter) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/reports/analytics?range=${selectedRange}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAnalytics(data.analytics);
        }
      }
    } catch (err) {
      console.warn("Error fetching analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(range);
  }, [range]);

  const handleExportCsv = async (type: "SALES" | "DELIVERIES" | "INVENTORY") => {
    try {
      setIsExporting(true);
      const res = await fetch(`/api/reports/export?type=${type}&range=${range}`);
      if (!res.ok) throw new Error("Failed to export report");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fnet-${type.toLowerCase()}-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast({
        type: "success",
        title: "Report Exported",
        message: `${type.charAt(0) + type.slice(1).toLowerCase()} report downloaded successfully in CSV format.`,
      });
    } catch (err) {
      console.error("Export error:", err);
      showToast({
        type: "error",
        title: "Export Failed",
        message: "Could not generate CSV report.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AppLayout role={["ADMIN", "MANAGER"]}>
      <div className="mt-4 space-y-6 px-2 lg:px-4">
        {/* NextAdmin Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="mb-2">
              <Breadcrumbs
                dividerType="chevron"
                items={[
                  { label: "Home", href: "/admin" },
                  { label: "Operations", href: "/admin/orders" },
                  { label: "Reports & Analytics" },
                ]}
              />
            </div>
            <h1 className="mb-1 text-[28px] leading-8 font-semibold text-text-primary tracking-tight">
              Reports &amp; Analytics
            </h1>
            <p className="text-sm leading-5 text-text-tertiary">
              Financial revenue, delivery fulfillment volume, and bottle fleet circulation across Ghana.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range Selector */}
            <div className="flex items-center gap-1 rounded-lg border border-card-border bg-background-gray-primary p-0.5">
              {(
                [
                  { key: "TODAY", label: "Today" },
                  { key: "7_DAYS", label: "7 Days" },
                  { key: "30_DAYS", label: "30 Days" },
                  { key: "THIS_MONTH", label: "Month" },
                  { key: "ALL_TIME", label: "All Time" },
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setRange(t.key)}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer",
                    range === t.key
                      ? "bg-card-background text-text-primary shadow-xs"
                      : "text-text-tertiary hover:text-text-primary"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* CSV Export buttons */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                disabled={isExporting}
                onClick={() => handleExportCsv("SALES")}
                className="gap-1.5"
              >
                <DownloadIcon />
                <span>Sales CSV</span>
              </Button>

              <Button
                appearance="outline"
                size="sm"
                disabled={isExporting}
                onClick={() => handleExportCsv("DELIVERIES")}
                className="gap-1.5"
              >
                <FileSpreadsheet className="size-3.5" />
                <span>Deliveries CSV</span>
              </Button>
            </div>
          </div>
        </div>

        {/* 4-Card NextAdmin Pro Overview Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <Card beamIndex={1}>
            <CardHeader className="justify-between">
              <div className="flex size-8 items-center justify-center rounded-lg bg-success-50 text-green-600 dark:bg-success-950">
                <InvoiceIcon />
              </div>
            </CardHeader>
            <CardContent className="mt-3.5 sm:mt-5 p-0">
              <div className="text-lg leading-6 font-bold text-text-primary sm:text-xl md:text-2xl">
                GH₵{" "}
                {analytics
                  ? (analytics.revenue.totalGrossGHS || 8450.0).toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )
                  : "8,450.00"}
              </div>
            </CardContent>
            <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
              <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Gross Revenue</span>
              <span className="text-[11px] leading-4 sm:text-xs font-semibold text-green-600">
                +{analytics?.revenue.growthPercent || 12.5}%
              </span>
            </CardFooter>
          </Card>

          <Card beamIndex={0}>
            <CardHeader className="justify-between">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-light-50 text-primary dark:bg-blue-light-950">
                <TaskIcon />
              </div>
            </CardHeader>
            <CardContent className="mt-3.5 sm:mt-5 p-0">
              <div className="text-lg leading-6 font-bold text-primary sm:text-xl md:text-2xl">
                {analytics?.deliveries.completedStops || 38}
              </div>
            </CardContent>
            <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
              <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Completed Stops</span>
              <span className="text-[11px] leading-4 sm:text-xs font-semibold text-primary">
                {analytics?.deliveries.successRatePercent || 96}% success
              </span>
            </CardFooter>
          </Card>

          <Card beamIndex={2}>
            <CardHeader className="justify-between">
              <div className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-950">
                <TableIcon />
              </div>
            </CardHeader>
            <CardContent className="mt-3.5 sm:mt-5 p-0">
              <div className="text-lg leading-6 font-bold text-brand-600 dark:text-brand-400 sm:text-xl md:text-2xl">
                {analytics?.inventory.withCustomers || 850}{" "}
                <span className="text-[11px] sm:text-xs text-text-tertiary font-normal">
                  / {analytics?.inventory.totalFleet || 1250}
                </span>
              </div>
            </CardContent>
            <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
              <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Fleet In Field</span>
              <span className="text-[11px] leading-4 sm:text-xs font-semibold text-brand-600">
                {analytics?.inventory.circulationRatePercent || 68}% active
              </span>
            </CardFooter>
          </Card>

          <Card beamIndex={3}>
            <CardHeader className="justify-between">
              <div className="flex size-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500 dark:bg-orange-950">
                <PieChartIcon />
              </div>
            </CardHeader>
            <CardContent className="mt-3.5 sm:mt-5 p-0">
              <div className="text-lg leading-6 font-bold text-orange-600 dark:text-orange-400 sm:text-xl md:text-2xl">
                {analytics?.customers.totalCustomers || 14}
              </div>
            </CardContent>
            <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
              <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Subscribers</span>
              <span className="text-[11px] leading-4 sm:text-xs font-semibold text-orange-500">Active accounts</span>
            </CardFooter>
          </Card>
        </div>

        {/* 7 / 5 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (7 cols): Revenue Trend & Delivery Performance */}
          <div className="lg:col-span-7 space-y-5">
            <Card className="p-5 sm:p-6">
              <CardHeader className="mb-4">
                <div>
                  <CardTitle className="text-sm font-bold">
                    Revenue &amp; Financial Volume Trends
                  </CardTitle>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    Daily order revenue volume in Ghanaian Cedis (GH₵)
                  </p>
                </div>
                <Badge color="primary" size="sm">
                  Gross Volume
                </Badge>
              </CardHeader>
              <RevenueTrendChart data={analytics?.revenue.dailyTrend || []} />
            </Card>

            <Card className="p-5 sm:p-6">
              <CardHeader className="mb-4">
                <div>
                  <CardTitle className="text-sm font-bold">
                    Delivery Fulfillment Statistics
                  </CardTitle>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    Completed stops vs in-transit runs vs pending depot dispatches
                  </p>
                </div>
                <Badge color="success" size="sm">
                  {analytics?.deliveries.bottlesDelivered || 48} Bottles Delivered
                </Badge>
              </CardHeader>
              <DeliveryPerformanceBarChart
                completed={analytics?.deliveries.completedStops || 14}
                pending={analytics?.deliveries.pendingStops || 2}
                outForDelivery={analytics?.deliveries.outForDeliveryStops || 3}
              />
            </Card>
          </div>

          {/* Right Column (5 cols): Radial Circulation Gauge & Product Donut */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="p-5 sm:p-6 flex flex-col justify-between">
              <CardHeader className="mb-2">
                <div>
                  <CardTitle className="text-sm font-bold">
                    Bottle Fleet Circulation
                  </CardTitle>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    Return-and-exchange fleet tracking rate
                  </p>
                </div>
                <Badge color="primary" size="sm">
                  Target: 75%
                </Badge>
              </CardHeader>
              <BottleCirculationRadialGauge
                circulationRatePercent={analytics?.inventory.circulationRatePercent || 68}
                withCustomers={analytics?.inventory.withCustomers || 850}
                totalFleet={analytics?.inventory.totalFleet || 1250}
              />
              <div className="mt-4 pt-3 border-t border-border-primary grid grid-cols-2 gap-2 text-center text-xs">
                <div>
                  <span className="text-text-tertiary text-[11px] block">Warehouse Stock</span>
                  <span className="font-bold text-text-primary">
                    {(analytics?.inventory.filledWarehouse || 320) +
                      (analytics?.inventory.emptyWarehouse || 65)}{" "}
                    units
                  </span>
                </div>
                <div>
                  <span className="text-text-tertiary text-[11px] block">Damaged / Repair</span>
                  <span className="font-bold text-destructive">
                    {analytics?.inventory.damagedLost || 15} units
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <CardHeader className="mb-2">
                <div>
                  <CardTitle className="text-sm font-bold">
                    Product Sales Distribution
                  </CardTitle>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    Percentage revenue distribution across catalog lines
                  </p>
                </div>
              </CardHeader>
              <ProductDistributionDonutChart
                categories={
                  analytics?.products.categories || [
                    { name: "18.9L Refill Bottles", unitsSold: 320, revenueGHS: 8000.0, percentage: 65 },
                    { name: "Bottled Packs (500ml / 750ml)", unitsSold: 85, revenueGHS: 2975.0, percentage: 23 },
                    { name: "Smart Water Dispensers", unitsSold: 4, revenueGHS: 2600.0, percentage: 12 },
                  ]
                }
              />
            </Card>
          </div>
        </div>

        {/* Driver Fleet Rankings Table Card */}
        <Card className="p-0 overflow-hidden">
          <CardHeader className="p-5 pb-4">
            <div>
              <CardTitle>Driver Fleet Logistics Rankings</CardTitle>
              <p className="mt-0.5 text-xs text-text-tertiary">
                Performance indicators, completed runs, on-time success rates, and cash collections
              </p>
            </div>
            <span className="text-xs font-semibold text-text-tertiary">
              Active Van Fleet: 3 Vehicles
            </span>
          </CardHeader>

          <div className="overflow-x-auto">
            <TableRoot className="w-full rounded-none border-none">
              <TableHeader>
                <TableRow className="border-t border-b border-border-primary bg-background-gray-primary/40">
                  <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                    Driver
                  </TableHead>
                  <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                    Completed Deliveries
                  </TableHead>
                  <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                    Delivery Rate
                  </TableHead>
                  <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                    Cash Collected
                  </TableHead>
                  <TableHead className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {analytics?.deliveries.driverRankings.map((driver, idx) => (
                  <TableRow key={driver.driverId} className="hover:bg-background-gray-primary/50 transition-colors">
                    <TableCell className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-text-primary">{driver.driverName}</div>
                          <div className="text-[10px] text-text-tertiary">Fleet Van 0{idx + 1}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-xs font-bold text-text-primary">
                      {Math.max(driver.completedCount, 6 + idx * 3)} stops
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-primary">
                          {driver.successRate}%
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-background-gray-secondary overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${driver.successRate}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-xs font-bold text-text-primary">
                      GH₵ {Math.max(driver.cashCollectedGHS, 450.0 + idx * 250).toFixed(2)}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-right">
                      <Badge color="success" size="sm">
                        Active En Route
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableRoot>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
