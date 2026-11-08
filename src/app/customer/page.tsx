"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import type { StoredAddress, StoredCustomerProfile } from "@/lib/customer-store";

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
  const [profile, setProfile] = useState<StoredCustomerProfile | null>(null);
  const [userName, setUserName] = useState<string>("Ama Osei");
  const [addresses, setAddresses] = useState<StoredAddress[]>([]);
  const [chartTab, setChartTab] = useState<"consumption" | "dispenser">("consumption");
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load customer profile and addresses
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

  // Default address
  const defaultAddress =
    addresses.find((a) => a.isDefault) || addresses[0] || null;

  // Monthly Consumption ApexChart
  const barOptions: ApexOptions = {
    colors: ["#0057B8"],
    chart: {
      fontFamily: "Outfit, sans-serif",
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
      labels: { style: { colors: "#667085", fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: "#667085", fontSize: "11px" },
        formatter: (val) => `${val}`,
      },
    },
    grid: {
      borderColor: "#F2F4F7",
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

  // Dispenser Rent-to-Own Radial Gauge calculation
  const paidMonths = profile?.dispenserPaidMonths ?? 8;
  const totalMonths = profile?.dispenserTotalMonths ?? 12;
  const gaugePercent = Math.round((paidMonths / totalMonths) * 100);

  const radialOptions: ApexOptions = {
    colors: ["#0057B8"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 240,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "72%" },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "26px",
            fontWeight: "700",
            offsetY: -25,
            color: "#1D2939",
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#0057B8"] },
    stroke: { lineCap: "round" },
    labels: ["Installment Progress"],
  };

  const radialSeries = [gaugePercent];

  // Copy referral code to clipboard
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
        return <Badge color="info" size="sm">Assigned</Badge>;
      case "Pending":
        return <Badge color="warning" size="sm">Pending</Badge>;
    }
  };

  return (
    <AppLayout role="CUSTOMER">
      <div className="space-y-5 max-w-5xl mx-auto">
        {/* Header: Greeting & Primary Order Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Hello, {userName}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-blue-light-400 border border-brand-200 dark:border-brand-800/80">
                {profile?.customerCode || "CUST-8802"}
              </span>
            </div>

            {defaultAddress && (
              <Link
                href="/customer/addresses"
                className="mt-1 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-blue-light-400 transition"
              >
                <svg className="w-3.5 h-3.5 text-brand-500 shrink-0 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="truncate max-w-[200px] sm:max-w-xs">{defaultAddress.areaName}</span>
                <span className="font-mono text-[11px] text-gray-400">({defaultAddress.digitalAddress})</span>
              </Link>
            )}
          </div>

          <Link
            href="/customer/order"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs self-start sm:self-auto cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            Order 19L Refill (GH₵ 30)
          </Link>
        </div>

        {/* 3-Pill Status Summary Strip */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs text-center">
            <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 block truncate">
              Bottles Held
            </span>
            <div className="mt-1 text-base sm:text-xl font-bold text-gray-900 dark:text-white">
              {profile?.bottlesHeld ?? 4}
            </div>
            <span className="text-[10px] sm:text-[11px] text-brand-600 dark:text-blue-light-400 font-medium block truncate">
              Empty bottles ready
            </span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs text-center">
            <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 block truncate">
              Free Credits
            </span>
            <div className="mt-1 text-base sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {profile?.freeBottleBalance ?? 1}
            </div>
            <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium block truncate">
              Referral reward
            </span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs text-center">
            <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 block truncate">
              Dispenser Plan
            </span>
            <div className="mt-1 text-base sm:text-xl font-bold text-gray-900 dark:text-white">
              {paidMonths}/{totalMonths}m
            </div>
            <span className="text-[10px] sm:text-[11px] text-blue-light-600 dark:text-blue-light-400 font-medium block truncate">
              Rent-to-own
            </span>
          </div>
        </div>

        {/* 4 Clean Quick Actions (2x2 on mobile, 4x1 on desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <Link
            href="/customer/order"
            className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-brand-500 transition shadow-theme-xs flex items-center gap-3 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-blue-light-400 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                Order Refill
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                Doorstep delivery
              </p>
            </div>
          </Link>

          <Link
            href="/customer/addresses"
            className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-brand-500 transition shadow-theme-xs flex items-center gap-3 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-light-50 dark:bg-blue-light-950/60 text-blue-light-600 dark:text-blue-light-400 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                Address Book
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                {addresses.length} saved locations
              </p>
            </div>
          </Link>

          <Link
            href="/customer/dispenser"
            className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-brand-500 transition shadow-theme-xs flex items-center gap-3 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                Smart Dispenser
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                Rent-to-own tracking
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsReferralModalOpen(true)}
            className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-brand-500 transition shadow-theme-xs flex items-center gap-3 text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.5 2.5 0 0 0-5 0c0 .35.07.69.18 1H11a2.5 2.5 0 0 0-5 0c0 .35.07.69.18 1H4a2 2 0 0 0-2 2v3a1 1 0 0 0 1 1h1v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7h1a1 1 0 0 0 1-1V8a2 2 0 0 0-2-2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                Refer Friends
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                Earn 1 free refill
              </p>
            </div>
          </button>
        </div>

        {/* Clean Visual Hub with Tab Switcher */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-theme-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            {/* Pill Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs">
              <button
                type="button"
                onClick={() => setChartTab("consumption")}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  chartTab === "consumption"
                    ? "bg-white dark:bg-gray-900 text-brand-600 dark:text-blue-light-400 shadow-xs"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Refill Usage
              </button>
              <button
                type="button"
                onClick={() => setChartTab("dispenser")}
                className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  chartTab === "dispenser"
                    ? "bg-white dark:bg-gray-900 text-brand-600 dark:text-blue-light-400 shadow-xs"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Dispenser Plan
              </button>
            </div>

            <span className="text-xs text-gray-500 dark:text-gray-400">
              {chartTab === "consumption" ? "Avg 8.6 btls/mo" : `${gaugePercent}% paid`}
            </span>
          </div>

          <div className="pt-3">
            {chartTab === "consumption" ? (
              <Chart options={barOptions} series={barSeries} type="bar" height={200} />
            ) : (
              <div className="flex flex-col items-center">
                <Chart options={radialOptions} series={radialSeries} type="radialBar" height={220} />
                <div className="w-full pt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800">
                  <span>Paid: GH₵ {(paidMonths * 200).toFixed(2)}</span>
                  <span>Remaining: GH₵ {((totalMonths - paidMonths) * 200).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity List (Mobile Friendly & Clean) */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-theme-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Recent Refills
            </h3>
            <span className="text-xs text-gray-400">Past 30 days</span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {RECENT_ORDERS.map((ord) => (
              <div key={ord.id} className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-blue-light-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {ord.title}
                      </span>
                      <span className="font-mono text-[10px] text-gray-400">
                        {ord.id}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                      {ord.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 text-right">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                    {ord.amount}
                  </span>
                  {getStatusBadge(ord.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referral Reward Modal */}
        <Modal
          isOpen={isReferralModalOpen}
          onClose={() => setIsReferralModalOpen(false)}
          title="Refer Friends & Earn Free Refills"
        >
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Earn 1 free 19L refill credit for every 5 friends who complete their first refill order with your code.
            </p>

            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                  Your Referral Code
                </span>
                <div className="text-base font-mono font-bold text-brand-600 dark:text-blue-light-400 tracking-wider">
                  {profile?.referralCode || "FNW-AMA01"}
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white transition shadow-theme-xs cursor-pointer"
              >
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-400">Next Free Refill</span>
                <span className="font-semibold text-brand-600 dark:text-blue-light-400">
                  {referralsTowardsNext} / 5 completed
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-500 h-2 rounded-full transition-all"
                  style={{ width: `${(referralsTowardsNext / 5) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsReferralModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}