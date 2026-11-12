"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import type { ApexOptions } from "apexcharts";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import type { AgentStats } from "@/lib/referral-store";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export interface ZoneCustomer {
  id: string;
  customerName: string;
  customerCode: string;
  phone: string;
  zone: string;
  deliveryArea: string;
  bottlesHeld: number;
  dispenserStatus: "Smart Rent-to-Own" | "Customer Owned" | "None (Refill Only)";
  status: "ACTIVE" | "NEEDS_REFILL" | "PENDING";
  refillsCount: number;
  lastOrderDate: string;
}

const OPERATIONAL_ZONES = [
  "All Zones",
  "East Legon & Adjiringanor",
  "Spintex Road & Sakumono",
  "Osu, Cantonments & Ridge",
  "Airport Residential & Dzorwulu",
  "Tema & Ashaiman",
] as const;

const INITIAL_ZONE_CUSTOMERS: ZoneCustomer[] = [
  {
    id: "zc_001",
    customerName: "Ama Osei",
    customerCode: "CUST-2041",
    phone: "0241000005",
    zone: "East Legon & Adjiringanor",
    deliveryArea: "House 14, Boundary Road",
    bottlesHeld: 4,
    dispenserStatus: "Smart Rent-to-Own",
    status: "ACTIVE",
    refillsCount: 16,
    lastOrderDate: "Today",
  },
  {
    id: "zc_002",
    customerName: "Kwabena Appiah",
    customerCode: "CUST-4119",
    phone: "0241000008",
    zone: "Osu, Cantonments & Ridge",
    deliveryArea: "Embassy Gardens, Cantonments",
    bottlesHeld: 2,
    dispenserStatus: "Customer Owned",
    status: "NEEDS_REFILL",
    refillsCount: 24,
    lastOrderDate: "2 days ago",
  },
  {
    id: "zc_003",
    customerName: "Nana Yeboah",
    customerCode: "CUST-6892",
    phone: "0241000009",
    zone: "Airport Residential & Dzorwulu",
    deliveryArea: "Villaggio Vista, Airport",
    bottlesHeld: 5,
    dispenserStatus: "Smart Rent-to-Own",
    status: "ACTIVE",
    refillsCount: 38,
    lastOrderDate: "Yesterday",
  },
  {
    id: "zc_004",
    customerName: "Esi Mensah",
    customerCode: "CUST-3310",
    phone: "0242111001",
    zone: "Spintex Road & Sakumono",
    deliveryArea: "Near Shell Station, Spintex",
    bottlesHeld: 3,
    dispenserStatus: "None (Refill Only)",
    status: "ACTIVE",
    refillsCount: 12,
    lastOrderDate: "Nov 8, 2026",
  },
  {
    id: "zc_005",
    customerName: "Kofi Owusu",
    customerCode: "CUST-5519",
    phone: "0242111004",
    zone: "Tema & Ashaiman",
    deliveryArea: "Community 25 Estate, Tema",
    bottlesHeld: 1,
    dispenserStatus: "Smart Rent-to-Own",
    status: "NEEDS_REFILL",
    refillsCount: 9,
    lastOrderDate: "Nov 5, 2026",
  },
  {
    id: "zc_006",
    customerName: "Abena Serwaa",
    customerCode: "CUST-7721",
    phone: "0242111002",
    zone: "East Legon & Adjiringanor",
    deliveryArea: "Adjiringanor Road, Near Galaxy",
    bottlesHeld: 4,
    dispenserStatus: "Smart Rent-to-Own",
    status: "ACTIVE",
    refillsCount: 29,
    lastOrderDate: "Today",
  },
  {
    id: "zc_007",
    customerName: "Samuel Quaye",
    customerCode: "CUST-9012",
    phone: "0242111007",
    zone: "Osu, Cantonments & Ridge",
    deliveryArea: "Ringway Estate, Osu",
    bottlesHeld: 2,
    dispenserStatus: "None (Refill Only)",
    status: "PENDING",
    refillsCount: 3,
    lastOrderDate: "Pending First Order",
  },
];

export default function AgentDashboardPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Zone Management State
  const [selectedZone, setSelectedZone] = useState<string>("All Zones");
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<ZoneCustomer[]>(INITIAL_ZONE_CUSTOMERS);

  // Register Customer Modal State
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custZone, setCustZone] = useState<string>("East Legon & Adjiringanor");
  const [custArea, setCustArea] = useState("");
  const [custDispenser, setCustDispenser] = useState<string>("Smart Rent-to-Own");
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardError, setOnboardError] = useState<string | null>(null);
  const [onboardSuccess, setOnboardSuccess] = useState<string | null>(null);

  // Quick Refill Modal
  const [orderModalCustomer, setOrderModalCustomer] = useState<ZoneCustomer | null>(null);
  const [quickRefillQty, setQuickRefillQty] = useState(2);
  const [isOrderingQuick, setIsOrderingQuick] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/agent/stats");
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load agent stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleCopy = () => {
    if (!stats) return;
    navigator.clipboard.writeText(stats.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Onboard customer under zone
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardError(null);
    setIsOnboarding(true);

    try {
      const res = await fetch("/api/agent/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: custName,
          phone: custPhone,
          email: custEmail,
          deliveryArea: `${custZone} • ${custArea}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setOnboardError(data.error || "Failed to onboard customer.");
        setIsOnboarding(false);
        return;
      }

      // Add to local zone customer directory
      const newCustomer: ZoneCustomer = {
        id: `zc_${Date.now()}`,
        customerName: custName,
        customerCode: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
        phone: custPhone,
        zone: custZone,
        deliveryArea: custArea,
        bottlesHeld: 2,
        dispenserStatus: custDispenser as ZoneCustomer["dispenserStatus"],
        status: "ACTIVE",
        refillsCount: 0,
        lastOrderDate: "Just Registered",
      };

      setCustomers((prev) => [newCustomer, ...prev]);
      setOnboardSuccess(`Customer ${custName} registered successfully in ${custZone}!`);
      setIsOnboardModalOpen(false);
      setCustName("");
      setCustPhone("");
      setCustEmail("");
      setCustArea("");
      await loadStats();
    } catch {
      setOnboardError("Network error occurred.");
    } finally {
      setIsOnboarding(false);
    }
  };

  // Quick refill creation for zone customer
  const handleQuickOrder = (customer: ZoneCustomer) => {
    setOrderModalCustomer(customer);
    setQuickRefillQty(2);
  };

  const submitQuickOrder = () => {
    if (!orderModalCustomer) return;
    setIsOrderingQuick(true);
    setTimeout(() => {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === orderModalCustomer.id
            ? {
                ...c,
                refillsCount: c.refillsCount + quickRefillQty,
                lastOrderDate: "Today",
                status: "ACTIVE",
              }
            : c
        )
      );
      setOnboardSuccess(
        `Dispatched refill order of ${quickRefillQty} bottles for ${orderModalCustomer.customerName} in ${orderModalCustomer.zone}!`
      );
      setIsOrderingQuick(false);
      setOrderModalCustomer(null);
    }, 600);
  };

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return customers.filter((c) => {
      const matchesZone = selectedZone === "All Zones" || c.zone === selectedZone;
      const matchesQuery =
        !q ||
        c.customerName.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.customerCode.toLowerCase().includes(q) ||
        c.deliveryArea.toLowerCase().includes(q);
      return matchesZone && matchesQuery;
    });
  }, [customers, selectedZone, searchQuery]);

  // Zone specific metrics
  const zoneCustomerCount = filteredCustomers.length;
  const zoneTotalRefills = filteredCustomers.reduce((acc, c) => acc + c.refillsCount, 0);
  const zoneDispensersCount = filteredCustomers.filter(
    (c) => c.dispenserStatus === "Smart Rent-to-Own"
  ).length;
  const zoneCommissionGHS = zoneTotalRefills * 5.0;

  // Monthly Zone Volume ApexChart
  const barChartOptions: ApexOptions = {
    colors: ["#0057B8", "#0284C7"],
    chart: {
      type: "bar",
      height: 240,
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "40%",
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ["East Legon", "Spintex", "Osu / Ridge", "Airport", "Tema"],
      labels: {
        style: { colors: isDark ? "#9CA3AF" : "#64748B", fontSize: "11px" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { colors: isDark ? "#9CA3AF" : "#64748B", fontSize: "11px" },
        formatter: (val) => `${val}`,
      },
    },
    grid: {
      borderColor: isDark ? "#1E293B" : "#F1F5F9",
      strokeDashArray: 3,
    },
    tooltip: {
      y: { formatter: (val) => `${val} Refill Bottles Delivered` },
    },
  };

  const barChartSeries = [
    {
      name: "Monthly Refills",
      data: [84, 52, 68, 48, 32],
    },
  ];

  // Zone Customer Distribution Donut ApexChart
  const donutChartOptions: ApexOptions = {
    colors: ["#0057B8", "#0284C7", "#10B981", "#F59E0B", "#8B5CF6"],
    chart: {
      type: "donut",
      fontFamily: "Inter, sans-serif",
    },
    labels: [
      "East Legon",
      "Spintex",
      "Osu / Ridge",
      "Airport",
      "Tema",
    ],
    legend: {
      position: "bottom",
      labels: { colors: isDark ? "#9CA3AF" : "#64748B" },
      fontSize: "11px",
    },
    dataLabels: { enabled: false },
    stroke: { show: false },
  };

  const donutChartSeries = [28, 18, 22, 16, 12];

  if (loading) {
    return (
      <AppLayout role="AGENT">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="size-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
        </div>
      </AppLayout>
    );
  }

  const s = stats || {
    agentId: "usr_agent_001",
    agentName: "Kofi Mensah",
    agentCode: "FNW-AGENT-KOFI",
    referralLink: "http://localhost:3000/register?ref=FNW-AGENT-KOFI",
    totalOnboarded: 28,
    activeCustomers: 22,
    totalRefillsOrdered: 145,
    freeBottlesEarned: 6,
    totalCommissionGHS: 725.0,
    commissionBalanceGHS: 725.0,
    referees: [],
  };

  return (
    <AppLayout role="AGENT">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Success Alert */}
        {onboardSuccess && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <svg className="size-4 shrink-0 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">{onboardSuccess}</span>
            </div>
            <button
              onClick={() => setOnboardSuccess(null)}
              className="font-bold text-emerald-600 hover:text-emerald-800 ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Page Header: Role, Title & Onboard CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/80">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                Zone Supervisor &amp; Agent Hub
              </h1>
              <Badge color="primary" size="sm">
                Zone Supervisor
              </Badge>
              <Badge color="info" size="sm">
                Distribution Network
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Manage customers across delivery zones in Greater Accra, monitor bottle refills, and deploy dispensers.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => {
                setOnboardError(null);
                setIsOnboardModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-xs cursor-pointer"
            >
              <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              <span>Register Customer in Zone</span>
            </button>
          </div>
        </div>

        {/* Agent Code & Referral Share Banner */}
        <div className="p-5 sm:p-6 rounded-[28px] bg-gradient-to-r from-brand-700 via-brand-600 to-sky-600 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-200 block">
              Zone Supervisor &amp; Agent Code
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider">
              {s.agentCode}
            </div>
            <p className="text-xs text-blue-100 max-w-lg leading-relaxed">
              Earn GH₵ 5.00 cash commission on every 18.9L refill bottle delivered to your registered customers under your zone.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={s.referralLink}
              className="w-56 sm:w-64 h-10 px-3 text-xs font-mono rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-brand-700 hover:bg-blue-50 transition shadow-xs whitespace-nowrap cursor-pointer"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* ZONE SELECTOR: Horizontal Pills */}
        <div id="zones" className="bg-white dark:bg-gray-900/70 p-4 sm:p-5 rounded-[28px] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white block">
              Operational Delivery Zones
            </span>
            <span className="text-xs text-brand-600 dark:text-sky-400 font-bold">
              {filteredCustomers.length} Customers in View
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {OPERATIONAL_ZONES.map((zone) => {
              const isSelected = selectedZone === zone;
              return (
                <button
                  key={zone}
                  type="button"
                  onClick={() => setSelectedZone(zone)}
                  className={`py-2 px-3.5 rounded-2xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-brand-500 text-white shadow-xs"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {zone}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 ZONE OPERATIONAL METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
              Zone Customers
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {zoneCustomerCount}
            </div>
            <span className="text-[11px] text-gray-400 mt-0.5 block truncate">
              {selectedZone === "All Zones" ? "Across all territories" : `In ${selectedZone}`}
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs">
            <span className="text-xs text-brand-600 dark:text-sky-400 font-medium block">
              Zone Refill Volume
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-brand-600 dark:text-sky-400">
              {zoneTotalRefills}
            </div>
            <span className="text-[11px] text-gray-400 mt-0.5 block">18.9L bottles ordered</span>
          </div>

          <div className="p-4 sm:p-5 rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block">
              Active Dispensers
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {zoneDispensersCount}
            </div>
            <span className="text-[11px] text-gray-400 mt-0.5 block">Rent-to-own signed</span>
          </div>

          <div className="p-4 sm:p-5 rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold block">
              Supervisor Commission
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              GH₵ {zoneCommissionGHS.toFixed(2)}
            </div>
            <span className="text-[11px] text-gray-400 mt-0.5 block">GH₵ 5.00 / refill bottle</span>
          </div>
        </div>

        {/* 7/5 GRID SPLIT: ApexCharts Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-white dark:bg-gray-900/70 p-5 sm:p-6 rounded-[28px] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Monthly Refill Deliveries by Zone
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total 18.9L water bottles delivered to customer accounts
                </p>
              </div>
              <Badge color="primary" size="sm">
                Greater Accra
              </Badge>
            </div>
            <div className="pt-2">
              <Chart options={barChartOptions} series={barChartSeries} type="bar" height={220} />
            </div>
          </div>

          <div className="lg:col-span-5 bg-white dark:bg-gray-900/70 p-5 sm:p-6 rounded-[28px] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Zone Distribution
                </h3>
                <Badge color="info" size="sm">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Customer account concentration per delivery territory
              </p>
            </div>
            <div className="py-2 flex items-center justify-center">
              <Chart options={donutChartOptions} series={donutChartSeries} type="donut" height={220} />
            </div>
          </div>
        </div>

        {/* CUSTOMER DIRECTORY UNDER ZONES */}
        <div id="customers" className="bg-white dark:bg-gray-900/70 p-5 sm:p-6 rounded-[28px] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Customer Accounts Under Zones ({filteredCustomers.length})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage residential and business water accounts under your supervision
              </p>
            </div>

            {/* Search Box */}
            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search name, phone, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 px-3.5 text-xs rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 shadow-2xs"
              />
            </div>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No customers found in this zone. Click &ldquo;Register Customer in Zone&rdquo; to add one.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/70 dark:bg-gray-800/50 text-gray-500 font-semibold border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Phone Number</th>
                    <th className="py-3 px-4">Zone &amp; Area</th>
                    <th className="py-3 px-4">Bottles Held</th>
                    <th className="py-3 px-4">Dispenser</th>
                    <th className="py-3 px-4">Refills</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/30 transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 dark:text-white block">
                          {cust.customerName}
                        </span>
                        <span className="text-[11px] font-mono text-brand-600 dark:text-sky-400">
                          {cust.customerCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-300">
                        <a href={`tel:${cust.phone}`} className="hover:underline">
                          {cust.phone}
                        </a>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 block truncate max-w-[180px]">
                          {cust.zone}
                        </span>
                        <span className="text-[11px] text-gray-400 block truncate max-w-[180px]">
                          {cust.deliveryArea}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {cust.bottlesHeld} Bottles
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-gray-600 dark:text-gray-300">
                          {cust.dispenserStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-brand-600 dark:text-sky-400">
                          {cust.refillsCount} Refills
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleQuickOrder(cust)}
                          className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-600 dark:text-sky-400 font-bold text-xs transition cursor-pointer"
                        >
                          Order Refill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL: Register Customer In Zone */}
        <Modal
          isOpen={isOnboardModalOpen}
          onClose={() => setIsOnboardModalOpen(false)}
          title="Register Customer Under Zone"
        >
          {onboardError && (
            <div className="p-3 mb-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300">
              {onboardError}
            </div>
          )}

          <form onSubmit={handleOnboardSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Customer Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kwame Adjei"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0244123456"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. kwame@gmail.com"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Assigned Delivery Zone
                </label>
                <select
                  value={custZone}
                  onChange={(e) => setCustZone(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                >
                  {OPERATIONAL_ZONES.filter((z) => z !== "All Zones").map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Dispenser Requirement
                </label>
                <select
                  value={custDispenser}
                  onChange={(e) => setCustDispenser(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                >
                  <option value="Smart Rent-to-Own">Smart Rent-to-Own (GH₵ 120/mo)</option>
                  <option value="Customer Owned">Customer Owned</option>
                  <option value="None (Refill Only)">None (Refill Only)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Street Name, Landmark &amp; Digital Address
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Boundary Road, Near Shell, GA-492-1029"
                value={custArea}
                onChange={(e) => setCustArea(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/80 dark:border-brand-900/60 text-[11px] text-brand-800 dark:text-sky-300">
              This customer will be managed under <strong>{custZone}</strong> and tagged to your supervisor referral code (<strong>{s.agentCode}</strong>).
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsOnboardModalOpen(false)}
                className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isOnboarding}
                className="px-4 py-2 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isOnboarding ? "Registering..." : "Complete Registration"}
              </button>
            </div>
          </form>
        </Modal>

        {/* MODAL: Quick Order for Zone Customer */}
        <Modal
          isOpen={!!orderModalCustomer}
          onClose={() => setOrderModalCustomer(null)}
          title={`Order Refill for ${orderModalCustomer?.customerName || "Customer"}`}
        >
          {orderModalCustomer && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Zone:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {orderModalCustomer.zone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Address:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {orderModalCustomer.deliveryArea}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-mono text-brand-600 dark:text-sky-400">
                    {orderModalCustomer.phone}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  18.9L Refill Bottles Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuickRefillQty((prev) => Math.max(1, prev - 1))}
                    className="size-9 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white font-bold flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-gray-900 dark:text-white w-8 text-center">
                    {quickRefillQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuickRefillQty((prev) => prev + 1)}
                    className="size-9 rounded-xl bg-brand-500 text-white font-bold flex items-center justify-center hover:bg-brand-600 cursor-pointer"
                  >
                    +
                  </button>
                  <span className="text-xs text-gray-500 ml-2">
                    Total: GH₵ {(quickRefillQty * 25.0).toFixed(2)} (Cash on Delivery)
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setOrderModalCustomer(null)}
                  className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isOrderingQuick}
                  onClick={submitQuickOrder}
                  className="px-4 py-2 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isOrderingQuick ? "Dispatching..." : "Confirm & Dispatch"}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}
