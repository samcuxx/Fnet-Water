"use client";

import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/tailgrids/core/badge";
import Breadcrumbs from "@/components/tailgrids/core/breadcrumbs";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import Modal from "@/components/ui/Modal";
import type { StoredAddress, StoredCustomerProfile } from "@/lib/customer-store";
import { cn } from "@/utils/cn";
import { ArrowUpIcon } from "@/utils/icon";
import { ChatIcon, InvoiceIcon, TableIcon, TaskIcon } from "@/components/common/sidebar/icon";
import type { ApexOptions } from "apexcharts";
import { Cpu, FileText, Gift, MapPin, Package, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface RecentOrder {
  id: string;
  title: string;
  date: string;
  amount: string;
  status: "Delivered" | "Assigned" | "Pending";
}

const RECENT_ORDERS: RecentOrder[] = [
  {
    id: "FNW-8821",
    title: "19L Refill (4 Bottles)",
    date: "Today, 10:45 AM",
    amount: "GH₵ 120.00",
    status: "Delivered",
  },
  {
    id: "FNW-8823",
    title: "19L Refill (2 Bottles)",
    date: "Yesterday",
    amount: "GH₵ 60.00",
    status: "Delivered",
  },
  {
    id: "FNW-8825",
    title: "19L Refill (1 Bottle)",
    date: "Nov 3, 2026",
    amount: "GH₵ 30.00",
    status: "Delivered",
  },
];

export default function CustomerDashboardPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<StoredCustomerProfile | null>(null);
  const [userName, setUserName] = useState<string>("Ama Osei");
  const [addresses, setAddresses] = useState<StoredAddress[]>([]);
  const [chartTab, setChartTab] = useState<"consumption" | "dispenser">("consumption");
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const loadCustomerData = useCallback(async () => {
    try {
      const [profRes, addrRes] = await Promise.all([
        fetch("/api/customer/profile"),
        fetch("/api/customer/addresses"),
      ]);

      const profData = await profRes.json();
      if (profData.success) {
        if (profData.customer) setProfile(profData.customer);
        if (profData.user?.name) setUserName(profData.user.name);
      }

      const addrData = await addrRes.json();
      if (addrData.success && addrData.addresses) {
        setAddresses(addrData.addresses);
      }
    } catch (err) {
      console.error("Failed to fetch customer dashboard data:", err);
    }
  }, []);

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;

  const barOptions: ApexOptions = {
    colors: ["#0057b8"],
    chart: {
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      type: "bar",
      height: 200,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        columnWidth: "45%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
      labels: { style: { colors: isDark ? "#98a2b3" : "#667085", fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: isDark ? "#98a2b3" : "#667085", fontSize: "11px" },
        formatter: (val) => `${val}`,
      },
    },
    grid: {
      borderColor: isDark ? "#1d2939" : "#f2f4f7",
      strokeDashArray: 3,
    },
    tooltip: {
      y: { formatter: (val) => `${val} Refill Bottles` },
    },
  };

  const barSeries = [
    {
      name: "19L Refills",
      data: [6, 8, 7, 10, 9, 12],
    },
  ];

  const paidMonths = profile?.dispenserPaidMonths ?? 8;
  const totalMonths = profile?.dispenserTotalMonths ?? 12;
  const gaugePercent = Math.round((paidMonths / totalMonths) * 100);

  const radialOptions: ApexOptions = {
    colors: ["#0057b8"],
    chart: {
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      type: "radialBar",
      height: 220,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "72%" },
        track: {
          background: isDark ? "#1d2939" : "#e4e7ec",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "24px",
            fontWeight: "700",
            offsetY: -20,
            color: isDark ? "#f9fafb" : "#101828",
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#0057b8"] },
    stroke: { lineCap: "round" },
  };

  const radialSeries = [gaugePercent];

  const handleCopyCode = () => {
    const code = profile?.referralCode || "FNW-AMA01";
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralsTowardsNext = (profile?.totalReferrals ?? 5) % 5;

  const getStatusBadge = (status: RecentOrder["status"]) => {
    switch (status) {
      case "Delivered":
        return <Badge color="success" size="sm">Delivered</Badge>;
      case "Assigned":
        return <Badge color="primary" size="sm">Driver Assigned</Badge>;
      case "Pending":
        return <Badge color="warning" size="sm">Pending</Badge>;
    }
  };

  return (
    <AppLayout role="CUSTOMER">
      <div className="mt-4 space-y-6 px-2 lg:px-4 max-w-5xl mx-auto">
        {/* NextAdmin Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="mb-2">
              <Breadcrumbs
                dividerType="chevron"
                items={[
                  { label: "Home", href: "/customer" },
                  { label: "Portals", href: "/customer" },
                  { label: "Customer Portal" },
                ]}
              />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-[28px] leading-8 font-semibold text-text-primary tracking-tight">
                Hello, {userName}
              </h1>
              <Badge color="primary" size="sm">
                {profile?.customerCode || "CUST-8802"}
              </Badge>
            </div>
            {defaultAddress && (
              <Link
                href="/customer/addresses"
                className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-primary transition-colors"
              >
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span className="truncate max-w-xs">{defaultAddress.areaName}</span>
                <span className="font-mono text-[11px] text-text-tertiary">
                  ({defaultAddress.digitalAddress})
                </span>
              </Link>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            {/* Order Refill: Primary blue with white text */}
            <Button asChild size="md" className="gap-2 cursor-pointer shadow-xs">
              <Link href="/customer/order?type=refill">
                <Plus className="size-4" />
                <span>Order Refill</span>
              </Link>
            </Button>

            {/* Order Non-Refill: White background with blue words */}
            <Button
              asChild
              size="md"
              appearance="outline"
              className="gap-2 bg-white text-primary border-2 border-primary hover:bg-blue-50/80 font-semibold shadow-xs dark:bg-card-surface-area dark:text-sky-400 dark:border-sky-500 dark:hover:bg-sky-950/40 cursor-pointer"
            >
              <Link href="/customer/order?type=non-refill">
                <Package className="size-4" />
                <span>Order Non-Refill</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* 3-Card NextAdmin Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
          <Card beamIndex={0}>
            <CardHeader className="justify-between">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-light-50 text-primary dark:bg-blue-light-950">
                <TableIcon />
              </div>
            </CardHeader>
            <CardContent className="mt-3.5 sm:mt-5 p-0">
              <div className="text-lg leading-6 font-bold text-text-primary sm:text-xl md:text-2xl">
                {profile?.bottlesHeld ?? 4}
              </div>
            </CardContent>
            <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
              <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Bottles Held</span>
              <span className="text-[11px] leading-4 sm:text-xs font-semibold text-primary">Empties ready</span>
            </CardFooter>
          </Card>

          <Card beamIndex={1}>
            <CardHeader className="justify-between">
              <div className="flex size-8 items-center justify-center rounded-lg bg-success-50 text-green-600 dark:bg-success-950">
                <Gift className="size-4.5" />
              </div>
            </CardHeader>
            <CardContent className="mt-3.5 sm:mt-5 p-0">
              <div className="text-lg leading-6 font-bold text-green-600 sm:text-xl md:text-2xl">
                {profile?.freeBottleBalance ?? 1}
              </div>
            </CardContent>
            <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
              <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Free Refill Credits</span>
              <span className="text-[11px] leading-4 sm:text-xs font-semibold text-green-600">Referral reward</span>
            </CardFooter>
          </Card>

          <Card beamIndex={4} className="col-span-2 sm:col-span-1">
            <CardHeader className="justify-between">
              <div className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-950">
                <Cpu className="size-4.5" />
              </div>
            </CardHeader>
            <CardContent className="mt-3.5 sm:mt-5 p-0">
              <div className="text-lg leading-6 font-bold text-brand-600 dark:text-brand-400 sm:text-xl md:text-2xl">
                {paidMonths}/{totalMonths}m
              </div>
            </CardContent>
            <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
              <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Dispenser Plan</span>
              <span className="text-[11px] leading-4 sm:text-xs font-semibold text-brand-600">Rent-to-own</span>
            </CardFooter>
          </Card>
        </div>

        {/* 4 Clean Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/customer/orders"
            className="p-4 rounded-xl border border-card-border bg-card-background hover:border-primary/40 transition-colors shadow-xs flex items-center gap-3 cursor-pointer"
          >
            <div className="size-10 rounded-lg bg-blue-light-50 dark:bg-blue-light-950 text-primary flex items-center justify-center shrink-0">
              <Package className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-text-primary truncate">
                My Orders
              </h3>
              <p className="text-[11px] text-text-tertiary truncate">
                Track deliveries
              </p>
            </div>
          </Link>

          <Link
            href="/customer/addresses"
            className="p-4 rounded-xl border border-card-border bg-card-background hover:border-primary/40 transition-colors shadow-xs flex items-center gap-3 cursor-pointer"
          >
            <div className="size-10 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-500 flex items-center justify-center shrink-0">
              <MapPin className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-text-primary truncate">
                Address Book
              </h3>
              <p className="text-[11px] text-text-tertiary truncate">
                {addresses.length} saved locations
              </p>
            </div>
          </Link>

          <Link
            href="/customer/dispenser"
            className="p-4 rounded-xl border border-card-border bg-card-background hover:border-primary/40 transition-colors shadow-xs flex items-center gap-3 cursor-pointer"
          >
            <div className="size-10 rounded-lg bg-orange-50 dark:bg-orange-950 text-orange-500 flex items-center justify-center shrink-0">
              <Cpu className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-text-primary truncate">
                Smart Dispenser
              </h3>
              <p className="text-[11px] text-text-tertiary truncate">
                Rent-to-own tracking
              </p>
            </div>
          </Link>

          <Link
            href="/customer/referrals"
            className="p-4 rounded-xl border border-card-border bg-card-background hover:border-primary/40 transition-colors shadow-xs flex items-center gap-3 text-left cursor-pointer"
          >
            <div className="size-10 rounded-lg bg-success-50 dark:bg-success-950 text-green-600 flex items-center justify-center shrink-0">
              <Gift className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-text-primary truncate">
                Refer Friends
              </h3>
              <p className="text-[11px] text-green-600 font-bold truncate">
                5:1 Free bottle rule
              </p>
            </div>
          </Link>
        </div>

        {/* Tabbed Visual Hub with ApexCharts */}
        <Card className="p-5 sm:p-6">
          <CardHeader className="border-b border-border-primary pb-3">
            <div className="flex items-center gap-1 rounded-lg border border-card-border bg-background-gray-primary p-0.5">
              <button
                type="button"
                onClick={() => setChartTab("consumption")}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer",
                  chartTab === "consumption"
                    ? "bg-card-background text-text-primary shadow-xs"
                    : "text-text-tertiary hover:text-text-primary"
                )}
              >
                Refill Usage
              </button>
              <button
                type="button"
                onClick={() => setChartTab("dispenser")}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer",
                  chartTab === "dispenser"
                    ? "bg-card-background text-text-primary shadow-xs"
                    : "text-text-tertiary hover:text-text-primary"
                )}
              >
                Dispenser Plan
              </button>
            </div>

            <span className="text-xs text-text-tertiary">
              {chartTab === "consumption" ? "Avg 8.6 bottles/month" : `${gaugePercent}% paid off`}
            </span>
          </CardHeader>

          <div className="pt-4">
            {chartTab === "consumption" ? (
              <Chart options={barOptions} series={barSeries} type="bar" height={200} />
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="relative size-32 rounded-xl overflow-hidden bg-background-gray-primary p-2 shrink-0 border border-card-border">
                  <Image
                    src="/images/product/fnet-smart-dispenser.jpg"
                    alt="Smart Digital Dispenser"
                    fill
                    sizes="128px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex flex-col items-center flex-1 w-full max-w-sm">
                  <Chart options={radialOptions} series={radialSeries} type="radialBar" height={220} />
                  <div className="w-full pt-2 flex items-center justify-between text-xs text-text-tertiary border-t border-border-primary">
                    <span>Paid: GH₵ {(paidMonths * 200).toFixed(2)}</span>
                    <span>Remaining: GH₵ {((totalMonths - paidMonths) * 200).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Refills Activity Card */}
        <Card className="p-5 sm:p-6">
          <CardHeader className="mb-4">
            <CardTitle>Recent Refills</CardTitle>
            <span className="text-xs text-text-tertiary">Past 30 days</span>
          </CardHeader>

          <div className="divide-y divide-border-primary">
            {RECENT_ORDERS.map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-8 rounded-lg bg-background-gray-primary text-icon-tertiary flex items-center justify-center shrink-0 border border-card-border">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-text-primary truncate">
                        {ord.title}
                      </span>
                      <span className="font-mono text-[10px] text-text-tertiary">
                        {ord.id}
                      </span>
                    </div>
                    <span className="text-[11px] text-text-tertiary block">
                      {ord.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 text-right">
                  <span className="text-xs font-semibold text-text-primary">
                    {ord.amount}
                  </span>
                  {getStatusBadge(ord.status)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Referral Reward Modal */}
        <Modal
          isOpen={isReferralModalOpen}
          onClose={() => setIsReferralModalOpen(false)}
          title="Refer Friends, Earn Free Refills"
        >
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Earn 1 free 19L refill credit for every 5 friends who complete their first refill order with your code.
            </p>

            <div className="p-3.5 rounded-xl bg-background-gray-primary border border-card-border flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-text-tertiary block">
                  Your Referral Code
                </span>
                <div className="text-base font-mono font-bold text-primary tracking-wider">
                  {profile?.referralCode || "FNW-AMA01"}
                </div>
              </div>
              <Button size="sm" onClick={handleCopyCode} className="cursor-pointer">
                {copied ? "Copied!" : "Copy Code"}
              </Button>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-text-secondary">Next Free Refill</span>
                <span className="font-semibold text-primary">
                  {referralsTowardsNext} / 5 completed
                </span>
              </div>
              <div className="w-full bg-background-gray-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(referralsTowardsNext / 5) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-card-border">
              <Button variant="ghost" size="sm" onClick={() => setIsReferralModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
