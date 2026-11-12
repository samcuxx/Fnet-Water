"use client";

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
import Modal from "@/components/ui/Modal";
import type { AgentStats } from "@/lib/referral-store";
import { Gift, Plus, UserPlus, Users, MapPin, Phone, Search, Filter, Droplets, CheckCircle2 } from "lucide-react";
import { InvoiceIcon, TableIcon, TaskIcon, UserGroupIcon } from "@/components/common/sidebar/icon";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/utils/cn";

const ACCRA_ZONES = [
  "All Zones",
  "East Legon & Adjiringanor",
  "Airport, Cantonments & Osu",
  "Spintex Road & Sakumono",
  "Tema Central & Communities",
  "Madina, Adenta & Abokobi",
  "Dansoman & Korle Bu",
  "Dzorwulu & Roman Ridge",
];

export default function AgentDashboardPage() {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedZone, setSelectedZone] = useState("All Zones");
  const [searchQuery, setSearchQuery] = useState("");

  // Onboard modal state
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custArea, setCustArea] = useState(ACCRA_ZONES[1]);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardError, setOnboardError] = useState<string | null>(null);
  const [onboardSuccess, setOnboardSuccess] = useState<string | null>(null);

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
          deliveryArea: custArea,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setOnboardError(data.error || "Failed to onboard customer.");
        setIsOnboarding(false);
        return;
      }

      setOnboardSuccess(`Customer ${custName} registered successfully under ${custArea}!`);
      setIsOnboardModalOpen(false);
      setCustName("");
      setCustPhone("");
      setCustEmail("");
      setCustArea(ACCRA_ZONES[1]);
      await loadStats();
    } catch {
      setOnboardError("Network error occurred.");
    } finally {
      setIsOnboarding(false);
    }
  };

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
    referees: [
      {
        id: "ref_1",
        customerName: "Emmanuel Quaye",
        phone: "0243001001",
        onboardedDate: "2026-02-12",
        refillsCount: 16,
        commissionGHS: 80.0,
        lastOrderDate: "2 days ago",
        zone: "East Legon & Adjiringanor",
        status: "ACTIVE" as const,
      },
      {
        id: "ref_2",
        customerName: "Akua Konadu Law Chambers",
        phone: "0243001002",
        onboardedDate: "2026-02-16",
        refillsCount: 28,
        commissionGHS: 140.0,
        lastOrderDate: "Yesterday",
        zone: "Airport, Cantonments & Osu",
        status: "ACTIVE" as const,
      },
      {
        id: "ref_3",
        customerName: "Samuel Danquah",
        phone: "0243001003",
        onboardedDate: "2026-02-22",
        refillsCount: 8,
        commissionGHS: 40.0,
        lastOrderDate: "Last week",
        zone: "Spintex Road & Sakumono",
        status: "ACTIVE" as const,
      },
      {
        id: "ref_4",
        customerName: "Grace Ansah",
        phone: "0244112299",
        onboardedDate: "2026-03-01",
        refillsCount: 12,
        commissionGHS: 60.0,
        lastOrderDate: "3 days ago",
        zone: "Tema Central & Communities",
        status: "ACTIVE" as const,
      },
    ],
    zonesSummary: [
      { name: "East Legon & Adjiringanor", customersCount: 12, refillsCount: 68 },
      { name: "Airport, Cantonments & Osu", customersCount: 8, refillsCount: 44 },
      { name: "Spintex Road & Sakumono", customersCount: 5, refillsCount: 22 },
      { name: "Tema Central & Communities", customersCount: 3, refillsCount: 11 },
    ],
  };

  // Filter customers by selected Zone and Search Query
  const filteredReferees = useMemo(() => {
    return s.referees.filter((r) => {
      const matchesZone =
        selectedZone === "All Zones" || (r.zone && r.zone.toLowerCase().includes(selectedZone.toLowerCase()));
      const matchesSearch =
        searchQuery === "" ||
        r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phone.includes(searchQuery) ||
        (r.zone && r.zone.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesZone && matchesSearch;
    });
  }, [s.referees, selectedZone, searchQuery]);

  return (
    <AppLayout role="AGENT">
      <div className="mt-4 space-y-6 px-2 lg:px-4">
        {/* Success Alert */}
        {onboardSuccess && (
          <div className="p-3.5 bg-success-50 text-green-700 border border-success-200 dark:bg-success-950/40 dark:text-green-300 rounded-xl text-xs flex items-center justify-between">
            <span>{onboardSuccess}</span>
            <button
              onClick={() => setOnboardSuccess(null)}
              className="font-bold text-green-600 hover:text-green-800 ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* NextAdmin Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="mb-2">
              <Breadcrumbs
                dividerType="chevron"
                items={[
                  { label: "Home", href: "/agent" },
                  { label: "Portals", href: "/agent" },
                  { label: "Field Agents & Supervisors" },
                ]}
              />
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[28px] leading-8 font-semibold text-text-primary tracking-tight">
                Field Agents &amp; Supervisors Portal
              </h1>
              <Badge color="primary" size="sm">
                Zone Management
              </Badge>
            </div>
            <p className="mt-1 text-sm leading-5 text-text-tertiary">
              Manage registered customers across Greater Accra zones, oversee bottle refills, and track commissions.
            </p>
          </div>

          <Button
            size="md"
            onClick={() => {
              setOnboardError(null);
              setIsOnboardModalOpen(true);
            }}
            className="gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
          >
            <UserPlus className="size-4" />
            <span>Register Customer</span>
          </Button>
        </div>

        {/* Agent Share Link Banner Card */}
        <Card className="p-5 sm:p-6 bg-gradient-to-r from-brand-600 via-primary to-brand-700 text-white border-none shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100 block">
                Supervisor / Agent Code
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-wider">
                {s.agentCode}
              </div>
              <p className="text-xs text-blue-100 max-w-lg">
                Earn GH₵ 5.00 cash commission on every refill bottle ordered by your registered zone accounts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={s.referralLink}
                className="w-56 sm:w-64 h-10 px-3 text-xs font-mono rounded-lg bg-white/15 border border-white/20 text-white placeholder-white/50 focus:outline-none"
              />
              <Button
                appearance="outline"
                size="sm"
                onClick={handleCopy}
                className="bg-white text-primary border-transparent hover:bg-white/90 font-bold cursor-pointer"
              >
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
        </Card>

        {/* 4 Agent KPI Metric Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          <Card beamIndex={0}>
            <CardHeader className="justify-between">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-light-50 text-primary dark:bg-blue-light-950">
                <UserGroupIcon />
              </div>
            </CardHeader>
            <CardContent className="mt-3.5 sm:mt-5 p-0">
              <div className="text-lg leading-6 font-bold text-text-primary sm:text-xl md:text-2xl tracking-tight">
                {s.totalOnboarded}
              </div>
            </CardContent>
            <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
              <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Customers in Zones</span>
              <span className="text-[11px] leading-4 sm:text-xs font-semibold text-primary">Managed by you</span>
            </CardFooter>
          </Card>

          <Card beamIndex={1}>
            <CardHeader className="justify-between">
              <div className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-950">
                <TaskIcon />
              </div>
            </CardHeader>
            <CardContent className="mt-3.5 sm:mt-5 p-0">
              <div className="text-lg leading-6 font-bold text-brand-600 dark:text-brand-400 sm:text-xl md:text-2xl tracking-tight">
                {s.totalRefillsOrdered}
              </div>
            </CardContent>
            <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
              <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Refill Orders</span>
              <span className="text-[11px] leading-4 sm:text-xs font-semibold text-brand-600">18.9L bottles</span>
            </CardFooter>
          </Card>

          <Card beamIndex={2}>
            <CardHeader className="justify-between">
              <div className="flex size-8 items-center justify-center rounded-lg bg-success-50 text-green-600 dark:bg-success-950">
                <Gift className="size-4.5" />
              </div>
            </CardHeader>
            <CardContent className="mt-3.5 sm:mt-5 p-0">
              <div className="text-lg leading-6 font-bold text-green-600 sm:text-xl md:text-2xl tracking-tight">
                {s.freeBottlesEarned}
              </div>
            </CardContent>
            <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
              <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Free Bottles Earned</span>
              <span className="text-[11px] leading-4 sm:text-xs font-semibold text-green-600">Reward balance</span>
            </CardFooter>
          </Card>

          <Card beamIndex={3}>
            <CardHeader className="justify-between">
              <div className="flex size-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500 dark:bg-orange-950">
                <InvoiceIcon />
              </div>
            </CardHeader>
            <CardContent className="mt-3.5 sm:mt-5 p-0">
              <div className="text-lg leading-6 font-bold text-orange-600 dark:text-orange-400 sm:text-xl md:text-2xl tracking-tight">
                GH₵ {s.totalCommissionGHS.toFixed(2)}
              </div>
            </CardContent>
            <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
              <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Supervisor Commission</span>
              <span className="text-[11px] leading-4 sm:text-xs font-semibold text-orange-500">GH₵ 5.00/refill</span>
            </CardFooter>
          </Card>
        </div>

        {/* Zone Supervision Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(s.zonesSummary || []).map((z, idx) => (
            <div
              key={z.name}
              onClick={() => setSelectedZone(selectedZone === z.name ? "All Zones" : z.name)}
              className={cn(
                "p-3 rounded-xl border transition cursor-pointer",
                selectedZone === z.name
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-card-border bg-card-surface-area hover:border-border-secondary"
              )}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="size-3.5 text-primary shrink-0" />
                <span className="text-xs font-bold text-text-primary truncate">{z.name}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-text-tertiary">
                <span>{z.customersCount} accounts</span>
                <span className="font-semibold text-primary">{z.refillsCount} refills</span>
              </div>
            </div>
          ))}
        </div>

        {/* Zone Filter & Customers Management Table Card */}
        <Card id="customers" className="p-0 overflow-hidden">
          <CardHeader className="p-5 pb-4 border-b border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Customers Under Supervision</CardTitle>
              <p className="mt-0.5 text-xs text-text-tertiary">
                Showing {filteredReferees.length} accounts in{" "}
                <span className="font-semibold text-primary">{selectedZone}</span>
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Zone Select Dropdown */}
              <div className="flex items-center gap-1.5">
                <Filter className="size-3.5 text-text-tertiary" />
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="h-8 px-2.5 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary"
                >
                  {ACCRA_ZONES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="size-3.5 text-text-tertiary absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer, phone, zone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 pr-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary w-44 sm:w-56"
                />
              </div>
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <TableRoot className="w-full rounded-none border-none">
              <TableHeader>
                <TableRow className="border-t border-b border-border-primary bg-background-gray-primary/40">
                  <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                    Customer Name
                  </TableHead>
                  <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                    Delivery Zone
                  </TableHead>
                  <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                    Contact Phone
                  </TableHead>
                  <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                    Refill Volume
                  </TableHead>
                  <TableHead className="px-5 py-3 text-right text-xs font-semibold text-text-secondary">
                    Commission Earned
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredReferees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-xs text-text-tertiary">
                      No customer accounts found for the selected zone filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReferees.map((r) => (
                    <TableRow key={r.id} className="hover:bg-background-gray-primary/50 transition-colors">
                      <TableCell className="px-5 py-3 text-xs font-semibold text-text-primary">
                        <div>
                          <div>{r.customerName}</div>
                          <div className="text-[10px] text-text-tertiary font-normal">
                            Onboarded: {r.onboardedDate ? new Date(r.onboardedDate).toLocaleDateString() : "Recent"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-3 text-xs">
                        <Badge color="primary" size="sm" className="text-[10px]">
                          {r.zone || "Accra Zone"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-3 font-mono text-xs text-text-secondary">
                        <a
                          href={`tel:${r.phone}`}
                          className="inline-flex items-center gap-1.5 text-primary hover:underline font-mono"
                        >
                          <Phone className="size-3" />
                          <span>{r.phone}</span>
                        </a>
                      </TableCell>
                      <TableCell className="px-5 py-3 text-xs font-bold text-text-primary">
                        {r.refillsCount} refills
                      </TableCell>
                      <TableCell className="px-5 py-3 text-right text-xs font-bold text-green-600">
                        GH₵ {r.commissionGHS.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </TableRoot>
          </div>
        </Card>

        {/* Modal: Onboard Customer On Ground */}
        <Modal
          isOpen={isOnboardModalOpen}
          onClose={() => setIsOnboardModalOpen(false)}
          title="Register Customer Under Zone"
        >
          <form onSubmit={handleOnboardSubmit} className="space-y-4">
            {onboardError && (
              <div className="p-3 rounded-lg bg-error-50 border border-error-200 text-red-600 text-xs">
                {onboardError}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-primary">Customer Full Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Kweku Baah"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-primary">Phone Number</label>
                <input
                  required
                  type="tel"
                  placeholder="024 XXX XXXX"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-primary">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="kweku@example.com"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-primary">Delivery Zone</label>
              <select
                value={custArea}
                onChange={(e) => setCustArea(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {ACCRA_ZONES.filter((z) => z !== "All Zones").map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
              <Button variant="ghost" size="sm" onClick={() => setIsOnboardModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={isOnboarding}>
                {isOnboarding ? "Registering..." : "Register Customer"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
