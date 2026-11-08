"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/badge/Badge";
import Alert from "@/components/ui/alert/Alert";
import { Modal } from "@/components/ui/Modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import BottleDistributionChart from "@/components/inventory/BottleDistributionChart";
import BottleCirculationGauge from "@/components/inventory/BottleCirculationGauge";
import {
  BottleInventoryData,
  DispenserItem,
  InventoryAuditLog,
  LowStockAlert,
  InventoryItemType,
  StockAction,
  DispenserStatusType,
} from "@/lib/inventory-store";

export default function InventoryManagementView({
  role = "MANAGER",
}: {
  role?: "ADMIN" | "MANAGER";
}) {
  const [activeTab, setActiveTab] = useState<"bottles" | "dispensers" | "ledger">("bottles");
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [bottles, setBottles] = useState<BottleInventoryData | null>(null);
  const [dispensers, setDispensers] = useState<DispenserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<InventoryAuditLog[]>([]);
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);

  // Search & Filters
  const [dispenserSearch, setDispenserSearch] = useState("");
  const [dispenserFilter, setDispenserFilter] = useState("ALL");
  const [ledgerSearch, setLedgerSearch] = useState("");

  // Modals
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isDispenserModalOpen, setIsDispenserModalOpen] = useState(false);
  const [selectedDispenser, setSelectedDispenser] = useState<DispenserItem | null>(null);

  // Adjust Form State
  const [adjustItemType, setAdjustItemType] = useState<InventoryItemType>("FILLED_BOTTLES");
  const [adjustAction, setAdjustAction] = useState<StockAction>("ADD");
  const [adjustQuantity, setAdjustQuantity] = useState("50");
  const [adjustReason, setAdjustReason] = useState("Factory bottling line production run");
  const [adjustNotes, setAdjustNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Dispenser Form State
  const [dispenserNewStatus, setDispenserNewStatus] = useState<DispenserStatusType>("AVAILABLE");
  const [dispenserNotes, setDispenserNotes] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resBottles, resDispensers, resLogs] = await Promise.all([
        fetch("/api/inventory/bottles"),
        fetch("/api/inventory/dispensers"),
        fetch("/api/inventory/audit-logs"),
      ]);

      if (resBottles.ok) {
        const data = await resBottles.json();
        setBottles(data.data);
        setAlerts(data.alerts || []);
      }
      if (resDispensers.ok) {
        const data = await resDispensers.json();
        setDispensers(data.data || []);
      }
      if (resLogs.ok) {
        const data = await resLogs.json();
        setAuditLogs(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch inventory data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Adjust Stock Submit
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const qty = parseInt(adjustQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setFormError("Quantity must be a positive whole number.");
      return;
    }
    const combinedReason = adjustNotes ? `${adjustReason}: ${adjustNotes}` : adjustReason;
    if (combinedReason.trim().length < 5) {
      setFormError("A clear reason is required for audit tracking.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: adjustItemType,
          action: adjustAction,
          quantity: qty,
          reason: combinedReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to adjust stock.");
      }

      setSuccessMessage(data.message || "Stock adjusted successfully.");
      setIsAdjustModalOpen(false);
      setAdjustNotes("");
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error adjusting stock.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Dispenser Status Submit
  const handleDispenserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDispenser) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/inventory/dispensers/${selectedDispenser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: dispenserNewStatus,
          notes: dispenserNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update dispenser.");
      }

      setSuccessMessage(`Dispenser ${selectedDispenser.serialNumber} updated.`);
      setIsDispenserModalOpen(false);
      setSelectedDispenser(null);
      setDispenserNotes("");
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error updating dispenser.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDispenserModal = (d: DispenserItem) => {
    setSelectedDispenser(d);
    setDispenserNewStatus(d.status);
    setDispenserNotes(d.notes || "");
    setIsDispenserModalOpen(true);
  };

  // Filtered Dispensers
  const filteredDispensers = dispensers.filter((d) => {
    const matchesSearch =
      d.serialNumber.toLowerCase().includes(dispenserSearch.toLowerCase()) ||
      d.modelName.toLowerCase().includes(dispenserSearch.toLowerCase()) ||
      (d.customerName && d.customerName.toLowerCase().includes(dispenserSearch.toLowerCase()));
    const matchesFilter = dispenserFilter === "ALL" || d.status === dispenserFilter;
    return matchesSearch && matchesFilter;
  });

  // Filtered Audit Logs
  const filteredLogs = auditLogs.filter((log) => {
    return (
      log.reason.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      log.userName.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      log.itemType.toLowerCase().includes(ledgerSearch.toLowerCase())
    );
  });

  const availableDispensersCount = dispensers.filter((d) => d.status === "AVAILABLE").length;
  const onPlanDispensersCount = dispensers.filter((d) => d.status === "INSTALLED_ON_PLAN").length;

  return (
    <AppLayout role={role}>
      <div className="space-y-6">
        {/* Alerts Banner */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((al) => (
              <Alert
                key={al.id}
                variant={al.severity === "CRITICAL" ? "error" : "warning"}
                title={al.item}
                message={al.message}
              />
            ))}
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-emerald-600 hover:text-emerald-800 font-bold ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Inventory &amp; Stock Tracking
              </h1>
              <Badge color="info" size="sm">
                Operations
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Track warehouse bottles, dispenser assets, circulation rates, and stock audits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setFormError("");
                setIsAdjustModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Adjust Stock</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Filled Warehouse Bottles */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-600 dark:text-blue-light-400 font-medium block">
                Filled in Warehouse
              </span>
              {(bottles?.filledWarehouse || 0) < 150 ? (
                <Badge color="warning" size="sm">Low Stock</Badge>
              ) : (
                <Badge color="success" size="sm">Ready</Badge>
              )}
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {bottles?.filledWarehouse ?? 520}
            </div>
            <span className="text-[11px] text-gray-400">18.9L bottles ready for delivery</span>
          </div>

          {/* Card 2: Empty Warehouse Bottles */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium block">
                Empties in Warehouse
              </span>
              <Badge color="info" size="sm">Awaiting Wash</Badge>
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {bottles?.emptyWarehouse ?? 280}
            </div>
            <span className="text-[11px] text-gray-400">Awaiting sanitation &amp; refill</span>
          </div>

          {/* Card 3: Bottles with Customers */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block">
                With Customers
              </span>
              <Badge color="success" size="sm">In Field</Badge>
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {bottles?.withCustomers ?? 1200}
            </div>
            <span className="text-[11px] text-gray-400">Circulating across Accra</span>
          </div>

          {/* Card 4: Available Dispensers */}
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium block">
                Available Dispensers
              </span>
              {availableDispensersCount < 5 ? (
                <Badge color="warning" size="sm">Restock Soon</Badge>
              ) : (
                <Badge color="info" size="sm">Warehouse</Badge>
              )}
            </div>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {availableDispensersCount} Units
            </div>
            <span className="text-[11px] text-gray-400">
              {onPlanDispensersCount} installed on plans
            </span>
          </div>
        </div>

        {/* Charts Grid: 7 / 5 Column Split */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 lg:col-span-7">
            <BottleDistributionChart
              filledWarehouse={bottles?.filledWarehouse ?? 520}
              emptyWarehouse={bottles?.emptyWarehouse ?? 280}
              withCustomers={bottles?.withCustomers ?? 1200}
              damaged={bottles?.damaged ?? 18}
              lost={bottles?.lost ?? 6}
            />
          </div>
          <div className="col-span-12 lg:col-span-5">
            <BottleCirculationGauge
              ratePercent={bottles?.circulationRatePercent ?? 89.0}
              totalFleet={bottles?.totalFleet ?? 2024}
              withCustomers={bottles?.withCustomers ?? 1200}
              inWarehouse={(bottles?.filledWarehouse ?? 520) + (bottles?.emptyWarehouse ?? 280)}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={() => setActiveTab("bottles")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === "bottles"
                ? "border-brand-500 text-brand-600 dark:text-blue-light-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            Bottle Inventory Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("dispensers")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === "dispensers"
                ? "border-brand-500 text-brand-600 dark:text-blue-light-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            Smart Dispensers Fleet ({dispensers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ledger")}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === "ledger"
                ? "border-brand-500 text-brand-600 dark:text-blue-light-400"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
            }`}
          >
            Stock Audit Ledger ({auditLogs.length})
          </button>
        </div>

        {/* TAB 1: BOTTLE INVENTORY DETAILS */}
        {activeTab === "bottles" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs space-y-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Warehouse Stock Breakdown
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Filled Ready for Dispatch:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{bottles?.filledWarehouse ?? 520}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Empty Returned from Delivery:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{bottles?.emptyWarehouse ?? 280}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Total in Warehouse:</span>
                  <span className="font-bold text-brand-600 dark:text-blue-light-400">
                    {(bottles?.filledWarehouse ?? 520) + (bottles?.emptyWarehouse ?? 280)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs space-y-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Field Circulation &amp; Customers
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Bottles with Customers:</span>
                  <span className="font-bold text-emerald-600">{bottles?.withCustomers ?? 1200}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Estimated Turnover Period:</span>
                  <span className="font-bold text-gray-900 dark:text-white">4.2 Days</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Deposit Protected:</span>
                  <span className="font-bold text-gray-900 dark:text-white">100% (GH₵ 80 / bottle)</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs space-y-3">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Exceptions &amp; Loss Prevention
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Damaged / Broken:</span>
                  <span className="font-bold text-amber-600">{bottles?.damaged ?? 18}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500">Lost / Missing:</span>
                  <span className="font-bold text-rose-600">{bottles?.lost ?? 6}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Total Decommissioned:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {(bottles?.damaged ?? 18) + (bottles?.lost ?? 6)} (1.2% of Fleet)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SMART DISPENSERS FLEET */}
        {activeTab === "dispensers" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Search serial, model, or customer..."
                  value={dispenserSearch}
                  onChange={(e) => setDispenserSearch(e.target.value)}
                  className="w-64 text-xs"
                />
                <Select
                  options={[
                    { value: "ALL", label: "All Statuses" },
                    { value: "AVAILABLE", label: "Available" },
                    { value: "INSTALLED_ON_PLAN", label: "On Rent-to-Own Plan" },
                    { value: "INSTALLED_OWNED", label: "Customer Owned" },
                    { value: "FAULTY", label: "Faulty" },
                    { value: "MAINTENANCE", label: "Maintenance" },
                  ]}
                  value={dispenserFilter}
                  onChange={(val) => setDispenserFilter(val)}
                  className="w-48 text-xs"
                />
              </div>
              <span className="text-xs text-gray-500">
                Showing {filteredDispensers.length} of {dispensers.length} units
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 font-semibold bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="py-3 px-4">Serial &amp; Model</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Deployment / Location</th>
                    <th className="py-3 px-4">Sensors</th>
                    <th className="py-3 px-4 text-right">Actions</th>
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
                        {disp.status === "AVAILABLE" && <Badge color="success" size="sm">Available</Badge>}
                        {disp.status === "INSTALLED_ON_PLAN" && <Badge color="info" size="sm">Rent-to-Own</Badge>}
                        {disp.status === "INSTALLED_OWNED" && <Badge color="primary" size="sm">Customer Owned</Badge>}
                        {disp.status === "FAULTY" && <Badge color="error" size="sm">Faulty</Badge>}
                        {disp.status === "MAINTENANCE" && <Badge color="warning" size="sm">In Maintenance</Badge>}
                      </td>
                      <td className="py-3 px-4">
                        {disp.customerName ? (
                          <div>
                            <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                              {disp.customerName}
                            </span>
                            <span className="text-gray-400 text-[11px]">{disp.location}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">{disp.location || "Central Warehouse"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 text-[11px]">
                          <span>Water: {disp.waterLevelPercent}%</span>
                          <span>Battery: {disp.batteryPercent}%</span>
                          <span className={`size-2 rounded-full ${disp.isOnline ? "bg-emerald-500" : "bg-gray-400"}`} />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openDispenserModal(disp)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg text-brand-600 dark:text-blue-light-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition cursor-pointer"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: STOCK AUDIT LEDGER */}
        {activeTab === "ledger" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Input
                type="text"
                placeholder="Search audit ledger by reason, staff, or item..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                className="w-72 text-xs"
              />
              <span className="text-xs text-gray-500">
                {filteredLogs.length} audit records logged
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 font-semibold bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Item Type</th>
                    <th className="py-3 px-4">Change Delta</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                      <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                          {log.userName}
                        </span>
                        <span className="text-[10px] text-gray-400">{log.userEmail}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {log.itemType.replace("_", " ")}
                      </td>
                      <td className="py-3 px-4">
                        {log.delta !== 0 ? (
                          <span
                            className={`font-bold font-mono ${
                              log.delta > 0
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {log.delta > 0 ? `+${log.delta}` : log.delta}
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                        {log.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: Adjust Stock */}
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title="Manual Stock Adjustment"
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300">
                {formError}
              </div>
            )}

            <div>
              <Label htmlFor="adjust-item-type">Item to Adjust</Label>
              <Select
                id="adjust-item-type"
                options={[
                  { value: "FILLED_BOTTLES", label: "Filled 18.9L Bottles (Warehouse)" },
                  { value: "EMPTY_BOTTLES", label: "Empty 18.9L Bottles (Warehouse)" },
                  { value: "DAMAGED_BOTTLES", label: "Damaged / Broken Bottles" },
                  { value: "LOST_BOTTLES", label: "Lost / Missing Bottles" },
                  { value: "DISPENSERS", label: "Smart Dispensers (Units)" },
                ]}
                value={adjustItemType}
                onChange={(val) => setAdjustItemType(val as InventoryItemType)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="adjust-action">Action</Label>
                <Select
                  id="adjust-action"
                  options={[
                    { value: "ADD", label: "Stock In (Add Stock)" },
                    { value: "DEDUCT", label: "Stock Out (Deduct Stock)" },
                  ]}
                  value={adjustAction}
                  onChange={(val) => setAdjustAction(val as StockAction)}
                />
              </div>

              <div>
                <Label htmlFor="adjust-quantity">Quantity</Label>
                <Input
                  id="adjust-quantity"
                  type="number"
                  min="1"
                  max="1000"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  placeholder="e.g. 50"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="adjust-reason">Primary Reason</Label>
              <Select
                id="adjust-reason"
                options={[
                  { value: "Factory bottling line production run", label: "Factory bottling line production run" },
                  { value: "Physical stocktake audit reconciliation", label: "Physical stocktake audit reconciliation" },
                  { value: "Supplier shipment of new bottles received", label: "Supplier shipment of new bottles received" },
                  { value: "Bottles broken / cracked during transit", label: "Bottles broken / cracked during transit" },
                  { value: "Customer account reconciliation", label: "Customer account reconciliation" },
                  { value: "Scrapped obsolete units", label: "Scrapped obsolete units" },
                ]}
                value={adjustReason}
                onChange={(val) => setAdjustReason(val)}
              />
            </div>

            <div>
              <Label htmlFor="adjust-notes">Additional Details / Reference</Label>
              <TextArea
                id="adjust-notes"
                placeholder="Batch number, delivery receipt, or inspection notes..."
                value={adjustNotes}
                onChange={(e) => setAdjustNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-brand-500 hover:bg-brand-600 transition shadow-theme-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Recording..." : "Save Stock Adjustment"}
              </button>
            </div>
          </form>
        </Modal>

        {/* MODAL: Update Dispenser Status */}
        <Modal
          isOpen={isDispenserModalOpen}
          onClose={() => setIsDispenserModalOpen(false)}
          title={`Update Dispenser: ${selectedDispenser?.serialNumber}`}
        >
          <form onSubmit={handleDispenserSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300">
                {formError}
              </div>
            )}

            <div>
              <Label htmlFor="dispenser-status">Dispenser Status</Label>
              <Select
                id="dispenser-status"
                options={[
                  { value: "AVAILABLE", label: "Available in Warehouse" },
                  { value: "INSTALLED_ON_PLAN", label: "Installed on Rent-to-Own Plan" },
                  { value: "INSTALLED_OWNED", label: "Customer Owned" },
                  { value: "FAULTY", label: "Faulty / Needs Repair" },
                  { value: "MAINTENANCE", label: "In Maintenance Workshop" },
                ]}
                value={dispenserNewStatus}
                onChange={(val) => setDispenserNewStatus(val as DispenserStatusType)}
              />
            </div>

            <div>
              <Label htmlFor="dispenser-notes">Maintenance &amp; Location Notes</Label>
              <TextArea
                id="dispenser-notes"
                placeholder="Diagnostic details, repair work done, or storage rack..."
                value={dispenserNotes}
                onChange={(e) => setDispenserNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsDispenserModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-brand-500 hover:bg-brand-600 transition shadow-theme-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Updating..." : "Save Status"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}