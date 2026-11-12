"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Card } from "@/components/tailgrids/core/card";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { SkeletonMetrics, SkeletonTable } from "@/components/ui/skeleton";
import { SearchIcon } from "@/components/common/header/icons";
import { StoredDispenserPlan, StoredDispenserFault } from "@/lib/dispenser-store";
import {
  Cpu,
  ShieldCheck,
  Radio,
  Wrench,
  Check,
  AlertTriangle,
  RotateCcw,
  Zap,
} from "lucide-react";

export default function DispensersManagementView({
  role = "MANAGER",
}: {
  role?: "ADMIN" | "MANAGER";
}) {
  const [activeTab, setActiveTab] = useState<"fleet" | "iot" | "faults">("fleet");
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [dispensers, setDispensers] = useState<StoredDispenserPlan[]>([]);
  const [faults, setFaults] = useState<StoredDispenserFault[]>([]);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // IoT Simulator state
  const [simulatorUser, setSimulatorUser] = useState("usr_customer_001");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simMessage, setSimMessage] = useState("");

  const homeHref = role === "ADMIN" ? "/admin" : "/manager";

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resIot, resFaults] = await Promise.all([
        fetch("/api/manager/dispensers/iot"),
        fetch("/api/manager/dispensers/faults"),
      ]);

      if (resIot.ok) {
        const d = await resIot.json();
        setDispensers(d.data || []);
      }
      if (resFaults.ok) {
        const f = await resFaults.json();
        setFaults(f.data || []);
      }
    } catch (err) {
      console.error("Failed to load dispensers data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Trigger Simulator Event
  const triggerSimulation = async (event: "LOW_WATER" | "TAMPER" | "OFFLINE" | "RESET") => {
    setIsSimulating(true);
    setSimMessage("");
    try {
      const res = await fetch("/api/manager/dispensers/iot/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: simulatorUser, event }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Simulation failed.");
      }
      setSimMessage(data.message);
      await loadData();
    } catch (err) {
      console.error("Simulation error:", err);
      setSimMessage(err instanceof Error ? err.message : "Error triggering event.");
    } finally {
      setIsSimulating(false);
    }
  };

  const selectedDispenser = dispensers.find((d) => d.userId === simulatorUser) || dispensers[0];

  const filteredDispensers = dispensers.filter((d) => {
    const matchesSearch =
      d.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.modelName.toLowerCase().includes(search.toLowerCase()) ||
      d.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "OWNED" && d.isFullyPaid) ||
      (statusFilter === "PLAN" && !d.isFullyPaid);
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout role={role}>
      <div className="space-y-6">
        {/* Breadcrumbs & Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Smart Dispenser Fleet &amp; IoT Telemetry
              </h1>
              <Badge color="primary" size="sm">
                Operations
              </Badge>
            </div>
            <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
              Real-time telemetry, rent-to-own contracts, customer ownership transfer, and IoT simulation.
            </p>
          </div>
          <div>
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: homeHref },
                { label: "Smart Dispensers" },
              ]}
            />
          </div>
        </div>

        {/* 4 KPI Metric Cards (NextAdmin Pro Style) */}
        {isLoading ? (
          <SkeletonMetrics count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
            {/* Card 1: Active Rent-to-Own */}
            <Card beamIndex={7}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-text-secondary">
                    Active Rent-to-Own
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-text-primary sm:text-2xl lg:text-3xl">
                    {dispensers.filter((d) => !d.isFullyPaid).length}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-blue-light-100 text-primary dark:bg-blue-light-950/60 dark:text-blue-light-400">
                  <Cpu className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">Monthly installment contracts active</p>
            </Card>

            {/* Card 2: Customer Owned */}
            <Card beamIndex={1}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-text-secondary">
                    Customer Owned
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400 sm:text-2xl lg:text-3xl">
                    {dispensers.filter((d) => d.isFullyPaid).length}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <ShieldCheck className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">100% paid off and ownership transferred</p>
            </Card>

            {/* Card 3: Online Telemetry */}
            <Card beamIndex={5}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-text-secondary">
                    IoT Online Ping
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-text-primary sm:text-2xl lg:text-3xl">
                    {dispensers.filter((d) => d.isOnline).length} / {dispensers.length}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <Radio className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">Active cellular/Wi-Fi heartbeat</p>
            </Card>

            {/* Card 4: Service Tickets */}
            <Card beamIndex={4}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                    Open Service Tickets
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-rose-600 dark:text-rose-400 sm:text-2xl lg:text-3xl">
                    {faults.filter((f) => f.status !== "RESOLVED").length}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                  <Wrench className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">Service maintenance visits queued</p>
            </Card>
          </div>
        )}

        {/* Tab Filter Bar */}
        <Card className="p-3">
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("fleet")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "fleet"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-secondary hover:bg-background-gray-secondary hover:text-text-primary"
              }`}
            >
              Fleet Directory ({dispensers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("iot")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "iot"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-secondary hover:bg-background-gray-secondary hover:text-text-primary"
              }`}
            >
              IoT Telemetry Simulator
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("faults")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "faults"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-secondary hover:bg-background-gray-secondary hover:text-text-primary"
              }`}
            >
              Service Tickets ({faults.length})
            </button>
          </div>
        </Card>

        {/* TAB 1: FLEET DIRECTORY */}
        {activeTab === "fleet" && (
          <div className="space-y-4">
            <Card className="p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 max-w-md">
                  <InputGroup>
                    <InputGroupAddon className="text-icon-secondary">
                      <SearchIcon />
                    </InputGroupAddon>
                    <InputGroupInput
                      type="text"
                      placeholder="Search serial, model, or customer..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="text-xs"
                    />
                  </InputGroup>
                </div>

                <div className="w-full sm:w-60">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter by plan status"
                    className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition cursor-pointer"
                  >
                    <option value="ALL">All Statuses ({dispensers.length})</option>
                    <option value="PLAN">Active Rent-to-Own</option>
                    <option value="OWNED">Customer Owned</option>
                  </select>
                </div>
              </div>
            </Card>

            {isLoading ? (
              <SkeletonTable rows={5} columns={5} />
            ) : (
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <TableRoot>
                    <TableHeader>
                      <TableRow className="border-b border-card-border bg-background-gray-secondary/50">
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                          Serial &amp; Model
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                          Customer
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                          Contract Status
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                          Financial Progress
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                          Live Telemetry
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-card-border">
                      {filteredDispensers.map((disp) => (
                        <TableRow
                          key={disp.id}
                          className="hover:bg-background-gray-secondary/30 transition"
                        >
                          <TableCell className="px-5 py-4">
                            <span className="font-mono font-bold text-xs text-text-primary block">
                              {disp.serialNumber}
                            </span>
                            <span className="text-[11px] text-text-tertiary">{disp.modelName}</span>
                          </TableCell>

                          <TableCell className="px-5 py-4">
                            <span className="font-semibold text-xs text-text-primary block">
                              {disp.customerName}
                            </span>
                            <span className="text-[11px] font-mono text-text-tertiary">{disp.customerPhone}</span>
                          </TableCell>

                          <TableCell className="px-5 py-4">
                            {disp.isFullyPaid ? (
                              <Badge color="success" size="sm">
                                Customer Owned
                              </Badge>
                            ) : (
                              <Badge color="cyan" size="sm">
                                Rent-to-Own ({disp.installmentsPaidCount}/{disp.totalInstallmentsCount})
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="px-5 py-4">
                            <div className="space-y-1.5 w-36">
                              <div className="flex justify-between text-[11px]">
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  GH₵ {disp.amountPaid.toFixed(2)}
                                </span>
                                <span className="text-text-tertiary">
                                  / GH₵ {disp.totalCost.toFixed(2)}
                                </span>
                              </div>
                              <div className="h-1.5 w-full rounded-full bg-background-gray-secondary overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${disp.isFullyPaid ? "bg-emerald-500" : "bg-primary"}`}
                                  style={{ width: `${Math.min(100, (disp.amountPaid / disp.totalCost) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="px-5 py-4">
                            <div className="flex items-center gap-2 text-xs">
                              <span className={`size-2 rounded-full ${disp.isOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
                              <span className={disp.waterLevelPercent < 15 ? "text-amber-600 font-bold" : "text-text-primary"}>
                                Water: {disp.waterLevelPercent}%
                              </span>
                              <span className="text-text-tertiary">•</span>
                              <span className="text-text-secondary">Bat: {disp.batteryPercent}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableRoot>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TAB 2: INTERACTIVE IOT TELEMETRY SIMULATOR */}
        {activeTab === "iot" && (
          <div className="space-y-6">
            {simMessage && (
              <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-blue-light-50/40 p-4 text-xs font-semibold text-primary dark:bg-blue-light-950/20">
                <span>{simMessage}</span>
                <button
                  onClick={() => setSimMessage("")}
                  className="font-bold hover:underline cursor-pointer ml-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Simulator Controls Card */}
              <Card className="lg:col-span-5 p-6 space-y-5">
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    IoT Telemetry Controls
                  </h3>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    Trigger simulated field events to test automated alerts and customer notifications.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1.5">
                    Target Smart Dispenser
                  </label>
                  <select
                    value={simulatorUser}
                    onChange={(e) => setSimulatorUser(e.target.value)}
                    className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition cursor-pointer"
                  >
                    {dispensers.map((d) => (
                      <option key={d.userId} value={d.userId}>
                        {d.serialNumber}: {d.customerName} ({d.modelName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-card-border">
                  <span className="text-xs font-semibold text-text-primary block">
                    Trigger Field Event
                  </span>

                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => triggerSimulation("LOW_WATER")}
                    className="w-full text-left p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 dark:bg-amber-950/20 dark:border-amber-800 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                        Simulate Low Water (&lt; 15%)
                      </span>
                      <span className="text-[10px] text-amber-600 font-semibold">12% Left</span>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                      Triggers customer in-app alert and doorstep refill prompt.
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => triggerSimulation("TAMPER")}
                    className="w-full text-left p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 dark:bg-rose-950/20 dark:border-rose-800 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                        Simulate Tamper / Tilt Alert
                      </span>
                      <span className="text-[10px] text-rose-600 font-semibold">Sensor Tripped</span>
                    </div>
                    <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-1">
                      Triggers tilt alert banner and security inspection warning.
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => triggerSimulation("OFFLINE")}
                    className="w-full text-left p-3.5 rounded-xl border border-card-border bg-background-gray-secondary/50 hover:bg-background-gray-secondary transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-text-primary">
                        Simulate Device Offline
                      </span>
                      <span className="text-[10px] text-text-tertiary font-semibold">Ping Dropped</span>
                    </div>
                    <p className="text-[11px] text-text-secondary mt-1">
                      Marks unit as offline due to power disconnection or network drop.
                    </p>
                  </button>

                  <Button
                    type="button"
                    appearance="outline"
                    disabled={isSimulating}
                    onClick={() => triggerSimulation("RESET")}
                    className="w-full justify-center text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800"
                  >
                    Reset Telemetry to Nominal (85% Water, Online)
                  </Button>
                </div>
              </Card>

              {/* Telemetry Live Feed Card */}
              {selectedDispenser && (
                <Card className="lg:col-span-7 p-6 space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-card-border">
                    <div>
                      <span className="text-xs font-mono text-primary font-bold block">
                        LIVE TELEMETRY: {selectedDispenser.serialNumber}
                      </span>
                      <h3 className="text-lg font-bold text-text-primary">
                        {selectedDispenser.modelName}
                      </h3>
                      <span className="text-xs text-text-tertiary">
                        Installed at {selectedDispenser.customerName} ({selectedDispenser.locationName})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`size-3 rounded-full ${selectedDispenser.isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                      <span className="text-xs font-semibold text-text-secondary">
                        {selectedDispenser.isOnline ? "Connected" : "Offline"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-background-gray-secondary p-4 border border-card-border">
                      <span className="text-xs text-text-tertiary block">Water Level in Bottle</span>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className={`text-3xl font-bold ${selectedDispenser.waterLevelPercent < 15 ? "text-amber-600" : "text-primary"}`}>
                          {selectedDispenser.waterLevelPercent}%
                        </span>
                        <span className="text-xs text-text-tertiary">
                          (~{((selectedDispenser.waterLevelPercent / 100) * 18.9).toFixed(1)}L)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-card-background mt-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${selectedDispenser.waterLevelPercent < 15 ? "bg-amber-500" : "bg-primary"}`}
                          style={{ width: `${selectedDispenser.waterLevelPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="rounded-xl bg-background-gray-secondary p-4 border border-card-border">
                      <span className="text-xs text-text-tertiary block">Backup Battery Sensor</span>
                      <div className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {selectedDispenser.batteryPercent}%
                      </div>
                      <div className="h-2 w-full rounded-full bg-card-background mt-3 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-500 transition-all duration-500"
                          style={{ width: `${selectedDispenser.batteryPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-background-gray-secondary p-4 text-xs space-y-2.5 border border-card-border">
                    <div className="flex justify-between items-center">
                      <span className="text-text-tertiary">Tamper Sensor State:</span>
                      {selectedDispenser.tamperAlert ? (
                        <Badge color="error" size="sm">
                          ALERT: Movement Detected
                        </Badge>
                      ) : (
                        <Badge color="success" size="sm">
                          Secure / Nominal
                        </Badge>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-text-tertiary">Estimated Bottle Depletion:</span>
                      <span className="font-semibold text-text-primary">
                        {selectedDispenser.waterLevelPercent < 15 ? "Today (< 6 hours)" : "In ~3.4 days"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-text-tertiary">Last Telemetry Ping:</span>
                      <span className="font-mono text-text-secondary text-[11px]">
                        {new Date(selectedDispenser.lastPingAt).toLocaleTimeString("en-GB")}
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER SERVICE & FAULT REQUESTS */}
        {activeTab === "faults" && (
          isLoading ? (
            <SkeletonTable rows={4} columns={5} />
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <TableRoot>
                  <TableHeader>
                    <TableRow className="border-b border-card-border bg-background-gray-secondary/50">
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                        Date
                      </TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                        Dispenser &amp; Customer
                      </TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                        Issue Reported
                      </TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                        Urgency
                      </TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase text-right">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-card-border">
                    {faults.map((flt) => (
                      <TableRow
                        key={flt.id}
                        className="hover:bg-background-gray-secondary/30 transition"
                      >
                        <TableCell className="px-5 py-4 text-xs text-text-tertiary">
                          {new Date(flt.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>

                        <TableCell className="px-5 py-4">
                          <span className="font-mono font-bold text-xs text-text-primary block">
                            {flt.serialNumber}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {flt.customerName} ({flt.customerPhone})
                          </span>
                        </TableCell>

                        <TableCell className="px-5 py-4">
                          <span className="font-semibold text-xs text-text-primary block">
                            {flt.issueType.replace("_", " ")}
                          </span>
                          <p className="text-xs text-text-tertiary max-w-sm truncate">
                            {flt.description}
                          </p>
                        </TableCell>

                        <TableCell className="px-5 py-4">
                          {flt.urgency === "HIGH" && <Badge color="error" size="sm">High</Badge>}
                          {flt.urgency === "NORMAL" && <Badge color="warning" size="sm">Normal</Badge>}
                          {flt.urgency === "LOW" && <Badge color="cyan" size="sm">Low</Badge>}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-right">
                          {flt.status === "RESOLVED" ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                              Resolved
                            </span>
                          ) : (
                            <Badge color="warning" size="sm">
                              {flt.status === "IN_PROGRESS" ? "In Progress" : "Open"}
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableRoot>
              </div>
            </Card>
          )
        )}
      </div>
    </AppLayout>
  );
}
