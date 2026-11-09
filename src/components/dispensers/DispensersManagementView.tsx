"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/badge/Badge";
import Alert from "@/components/ui/alert/Alert";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { StoredDispenserPlan, StoredDispenserFault } from "@/lib/dispenser-store";

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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Smart Dispenser Fleet &amp; IoT Telemetry
              </h1>
              <Badge color="info" size="sm">
                Operations
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Real-time telemetry, rent-to-own contracts, customer ownership transfer, and IoT simulation.
            </p>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-brand-600 dark:text-blue-light-400 font-medium block">
              Active Rent-to-Own
            </span>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {dispensers.filter((d) => !d.isFullyPaid).length} Units
            </div>
            <span className="text-[11px] text-gray-400">Monthly installments active</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block">
              Customer Owned
            </span>
            <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {dispensers.filter((d) => d.isFullyPaid).length} Units
            </div>
            <span className="text-[11px] text-gray-400">100% paid off and transferred</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium block">
              IoT Online Telemetry
            </span>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {dispensers.filter((d) => d.isOnline).length} / {dispensers.length}
            </div>
            <span className="text-[11px] text-gray-400">Active telemetry ping</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium block">
              Open Service Tickets
            </span>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {faults.filter((f) => f.status !== "RESOLVED").length} Tickets
            </div>
            <span className="text-[11px] text-gray-400">Service visits queued</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setActiveTab("fleet")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === "fleet"
                ? "border-brand-500 text-brand-600 dark:text-blue-light-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            Customer Fleet Directory ({dispensers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("iot")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === "iot"
                ? "border-brand-500 text-brand-600 dark:text-blue-light-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            IoT Telemetry Simulator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("faults")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === "faults"
                ? "border-brand-500 text-brand-600 dark:text-blue-light-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            Customer Service Requests ({faults.length})
          </button>
        </div>

        {/* TAB 1: FLEET DIRECTORY */}
        {activeTab === "fleet" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Search serial, model, or customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-64 text-xs"
                />
                <Select
                  options={[
                    { value: "ALL", label: "All Statuses" },
                    { value: "PLAN", label: "Active Rent-to-Own" },
                    { value: "OWNED", label: "Customer Owned" },
                  ]}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  className="w-48 text-xs"
                />
              </div>
              <span className="text-xs text-gray-500">
                Showing {filteredDispensers.length} units
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="py-3 px-4">Serial &amp; Model</th>
                    <th className="py-3 px-4">Customer &amp; Phone</th>
                    <th className="py-3 px-4">Contract Status</th>
                    <th className="py-3 px-4">Financial Progress</th>
                    <th className="py-3 px-4">Live IoT Telemetry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredDispensers.map((disp) => (
                    <tr key={disp.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-gray-900 dark:text-white block">
                          {disp.serialNumber}
                        </span>
                        <span className="text-gray-500 text-[11px]">{disp.modelName}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                          {disp.customerName}
                        </span>
                        <span className="text-gray-400 text-[11px] font-mono">{disp.customerPhone}</span>
                      </td>

                      <td className="py-3 px-4">
                        {disp.isFullyPaid ? (
                          <Badge color="success" size="sm">
                            Customer Owned
                          </Badge>
                        ) : (
                          <Badge color="info" size="sm">
                            Rent-to-Own ({disp.installmentsPaidCount}/{disp.totalInstallmentsCount})
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-emerald-600 font-bold">GH₵ {disp.amountPaid.toFixed(2)}</span>
                            <span className="text-gray-400">/ GH₵ {disp.totalCost.toFixed(2)}</span>
                          </div>
                          <div className="w-28 bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${disp.isFullyPaid ? "bg-emerald-500" : "bg-brand-500"}`}
                              style={{ width: `${Math.min(100, (disp.amountPaid / disp.totalCost) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className={`size-2 rounded-full ${disp.isOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
                          <span className={disp.waterLevelPercent < 15 ? "text-amber-600 font-bold" : "text-gray-700 dark:text-gray-300"}>
                            Water: {disp.waterLevelPercent}%
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">Bat: {disp.batteryPercent}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE IOT TELEMETRY SIMULATOR */}
        {activeTab === "iot" && (
          <div className="space-y-6">
            {simMessage && (
              <div className="p-3 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 rounded-xl text-xs text-brand-800 dark:text-blue-light-400 flex items-center justify-between">
                <span>{simMessage}</span>
                <button
                  onClick={() => setSimMessage("")}
                  className="font-bold text-brand-600 hover:text-brand-800 ml-2 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Simulator Controls Card */}
              <div className="md:col-span-5 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs space-y-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    IoT Telemetry Controls
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Trigger simulated field events to test automated alerts and customer notifications.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1.5">
                    Target Smart Dispenser
                  </label>
                  <Select
                    options={dispensers.map((d) => ({
                      value: d.userId,
                      label: `${d.serialNumber}: ${d.customerName} (${d.modelName})`,
                    }))}
                    value={simulatorUser}
                    onChange={(val) => setSimulatorUser(val)}
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">
                    Trigger Simulated Event
                  </span>

                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => triggerSimulation("LOW_WATER")}
                    className="w-full text-left p-3 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-100/50 dark:bg-amber-950/20 dark:border-amber-800 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
                        Simulate Low Water (Under 15%)
                      </span>
                      <span className="text-[10px] text-amber-600 font-semibold">12% Remaining</span>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                      Triggers customer in-app alert and doorstep refill prompt.
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => triggerSimulation("TAMPER")}
                    className="w-full text-left p-3 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-100/50 dark:bg-rose-950/20 dark:border-rose-800 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                        Simulate Tamper / Tilt Alert
                      </span>
                      <span className="text-[10px] text-rose-600 font-semibold">Sensor Tripped</span>
                    </div>
                    <p className="text-[11px] text-rose-700 dark:text-rose-400 mt-0.5">
                      Triggers tilt alert banner and security inspection warning.
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => triggerSimulation("OFFLINE")}
                    className="w-full text-left p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/40 dark:border-gray-700 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        Simulate Device Offline
                      </span>
                      <span className="text-[10px] text-gray-500 font-semibold">Ping Failed</span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">
                      Marks unit as offline due to power disconnection or network drop.
                    </p>
                  </button>

                  <button
                    type="button"
                    disabled={isSimulating}
                    onClick={() => triggerSimulation("RESET")}
                    className="w-full text-center py-2 px-3 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition cursor-pointer mt-1"
                  >
                    Reset Telemetry to Normal (85% Water, Online, Secure)
                  </button>
                </div>
              </div>

              {/* Telemetry Live Feed Card */}
              {selectedDispenser && (
                <div className="md:col-span-7 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-xs font-mono text-brand-600 dark:text-blue-light-400 font-bold block">
                        LIVE FEED: {selectedDispenser.serialNumber}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedDispenser.modelName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        Installed at {selectedDispenser.customerName} ({selectedDispenser.locationName})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`size-3 rounded-full ${selectedDispenser.isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {selectedDispenser.isOnline ? "Live Connected" : "Connection Lost"}
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Sensor Panels */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-500 block">Water Level in Bottle</span>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className={`text-3xl font-bold ${selectedDispenser.waterLevelPercent < 15 ? "text-amber-600" : "text-brand-600 dark:text-blue-light-400"}`}>
                          {selectedDispenser.waterLevelPercent}%
                        </span>
                        <span className="text-xs text-gray-400">
                          (~{((selectedDispenser.waterLevelPercent / 100) * 18.9).toFixed(1)}L)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${selectedDispenser.waterLevelPercent < 15 ? "bg-amber-500" : "bg-brand-500"}`}
                          style={{ width: `${selectedDispenser.waterLevelPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-500 block">Backup Battery Sensor</span>
                      <div className="mt-1 text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {selectedDispenser.batteryPercent}%
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-500 transition-all duration-500"
                          style={{ width: `${selectedDispenser.batteryPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sensor State Tags */}
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Tamper Sensor State:</span>
                      {selectedDispenser.tamperAlert ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400">
                          ALERT: Movement Detected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                          Secure / Nominal
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Estimated Bottle Depletion:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedDispenser.waterLevelPercent < 15 ? "Today (< 6 hours)" : "In ~3.4 days"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Last Telemetry Ping:</span>
                      <span className="font-mono text-gray-500 text-[11px]">
                        {new Date(selectedDispenser.lastPingAt).toLocaleTimeString("en-GB")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER SERVICE & FAULT REQUESTS */}
        {activeTab === "faults" && (
          <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Dispenser &amp; Customer</th>
                  <th className="py-3 px-4">Issue Reported</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {faults.map((flt) => (
                  <tr key={flt.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(flt.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-gray-900 dark:text-white block">
                        {flt.serialNumber}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {flt.customerName} ({flt.customerPhone})
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                        {flt.issueType.replace("_", " ")}
                      </span>
                      <p className="text-[11px] text-gray-500 max-w-sm truncate">
                        {flt.description}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      {flt.urgency === "HIGH" && <Badge color="error" size="sm">High</Badge>}
                      {flt.urgency === "NORMAL" && <Badge color="warning" size="sm">Normal</Badge>}
                      {flt.urgency === "LOW" && <Badge color="info" size="sm">Low</Badge>}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {flt.status === "RESOLVED" ? (
                        <span className="text-emerald-600 font-semibold">Resolved</span>
                      ) : (
                        <Badge color="warning" size="sm">
                          {flt.status === "IN_PROGRESS" ? "In Progress" : "Open"}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}