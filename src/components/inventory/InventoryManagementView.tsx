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
import { Modal } from "@/components/ui/Modal";
import BottleDistributionChart from "@/components/inventory/BottleDistributionChart";
import BottleCirculationGauge from "@/components/inventory/BottleCirculationGauge";
import { SkeletonMetrics, SkeletonTable } from "@/components/ui/skeleton";
import { SearchIcon } from "@/components/common/header/icons";
import {
  BottleInventoryData,
  DispenserItem,
  InventoryAuditLog,
  LowStockAlert,
  InventoryItemType,
  StockAction,
  DispenserStatusType,
} from "@/lib/inventory-store";
import {
  Package,
  Droplets,
  RotateCcw,
  Users,
  Cpu,
  Plus,
  AlertTriangle,
  Check,
  X,
} from "lucide-react";

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

  const homeHref = role === "ADMIN" ? "/admin" : "/manager";

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
              <div
                key={al.id}
                className={`flex items-center gap-2.5 rounded-xl border p-4 text-xs font-semibold ${
                  al.severity === "CRITICAL"
                    ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                    : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
                }`}
              >
                <AlertTriangle className="size-4 shrink-0" />
                <span>
                  <strong>{al.item}:</strong> {al.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <Check className="size-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-text-tertiary hover:text-text-primary cursor-pointer p-0.5"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Breadcrumbs & Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Inventory &amp; Stock Tracking
              </h1>
              <Badge color="primary" size="sm">
                Operations
              </Badge>
            </div>
            <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
              Track warehouse bottles, dispenser assets, circulation rates, and stock audits across Ghana.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: homeHref },
                { label: "Inventory" },
              ]}
            />
            <Button
              size="sm"
              onClick={() => {
                setFormError("");
                setIsAdjustModalOpen(true);
              }}
              className="gap-2 text-xs font-semibold"
            >
              <Plus className="size-3.5" />
              <span>Adjust Stock</span>
            </Button>
          </div>
        </div>

        {/* 4 KPI Metric Cards (NextAdmin Pro Style) */}
        {isLoading ? (
          <SkeletonMetrics count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
            {/* Card 1: Filled Warehouse Bottles */}
            <Card beamIndex={0}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-text-secondary">
                    Filled in Warehouse
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-text-primary sm:text-2xl lg:text-3xl">
                    {bottles?.filledWarehouse ?? 520}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-blue-light-100 text-primary dark:bg-blue-light-950/60 dark:text-blue-light-400">
                  <Droplets className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">18.9L bottles ready for delivery</p>
            </Card>

            {/* Card 2: Empties in Warehouse */}
            <Card beamIndex={5}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-text-secondary">
                    Empties in Warehouse
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-text-primary sm:text-2xl lg:text-3xl">
                    {bottles?.emptyWarehouse ?? 280}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
                  <RotateCcw className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">Awaiting sanitation &amp; refill</p>
            </Card>

            {/* Card 3: With Customers */}
            <Card beamIndex={1}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-text-secondary">
                    With Customers
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400 sm:text-2xl lg:text-3xl">
                    {bottles?.withCustomers ?? 1200}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Users className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">Circulating with active customers</p>
            </Card>

            {/* Card 4: Available Dispensers */}
            <Card beamIndex={2}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-text-secondary">
                    Available Dispensers
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-text-primary sm:text-2xl lg:text-3xl">
                    {availableDispensersCount} Units
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <Cpu className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">
                {onPlanDispensersCount} deployed on rent-to-own
              </p>
            </Card>
          </div>
        )}

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
        <Card className="p-3">
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("bottles")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "bottles"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-secondary hover:bg-background-gray-secondary hover:text-text-primary"
              }`}
            >
              Bottle Inventory Breakdown
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dispensers")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "dispensers"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-secondary hover:bg-background-gray-secondary hover:text-text-primary"
              }`}
            >
              Dispensers Fleet ({dispensers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ledger")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                activeTab === "ledger"
                  ? "bg-primary text-white shadow-xs"
                  : "text-text-secondary hover:bg-background-gray-secondary hover:text-text-primary"
              }`}
            >
              Stock Audit Ledger ({auditLogs.length})
            </button>
          </div>
        </Card>

        {/* TAB 1: BOTTLE INVENTORY DETAILS */}
        {activeTab === "bottles" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="p-6 space-y-4">
              <h4 className="text-sm font-bold text-text-primary">
                Warehouse Stock Breakdown
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-card-border">
                  <span className="text-text-tertiary">Filled Ready for Dispatch</span>
                  <span className="font-bold text-text-primary">{bottles?.filledWarehouse ?? 520}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-card-border">
                  <span className="text-text-tertiary">Empty Returned from Delivery</span>
                  <span className="font-bold text-text-primary">{bottles?.emptyWarehouse ?? 280}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-text-tertiary">Total in Warehouse</span>
                  <span className="font-bold text-primary">
                    {(bottles?.filledWarehouse ?? 520) + (bottles?.emptyWarehouse ?? 280)}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h4 className="text-sm font-bold text-text-primary">
                Field Circulation &amp; Customers
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-card-border">
                  <span className="text-text-tertiary">Bottles with Customers</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {bottles?.withCustomers ?? 1200}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-card-border">
                  <span className="text-text-tertiary">Estimated Turnover Period</span>
                  <span className="font-bold text-text-primary">4.2 Days</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-text-tertiary">Deposit Protected</span>
                  <span className="font-bold text-text-primary">100% (GH₵ 80 / bottle)</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h4 className="text-sm font-bold text-text-primary">
                Exceptions &amp; Loss Prevention
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-card-border">
                  <span className="text-text-tertiary">Damaged Bottles</span>
                  <span className="font-bold text-amber-600">{bottles?.damaged ?? 18}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-card-border">
                  <span className="text-text-tertiary">Lost / Missing</span>
                  <span className="font-bold text-rose-600">{bottles?.lost ?? 6}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-text-tertiary">Total Decommissioned</span>
                  <span className="font-bold text-text-primary">
                    {(bottles?.damaged ?? 18) + (bottles?.lost ?? 6)} (1.2% of Fleet)
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: SMART DISPENSERS FLEET */}
        {activeTab === "dispensers" && (
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
                      value={dispenserSearch}
                      onChange={(e) => setDispenserSearch(e.target.value)}
                      className="text-xs"
                    />
                  </InputGroup>
                </div>

                <div className="w-full sm:w-60">
                  <select
                    value={dispenserFilter}
                    onChange={(e) => setDispenserFilter(e.target.value)}
                    aria-label="Filter by status"
                    className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="INSTALLED_ON_PLAN">On Rent-to-Own Plan</option>
                    <option value="INSTALLED_OWNED">Customer Owned</option>
                    <option value="FAULTY">Faulty</option>
                    <option value="MAINTENANCE">Maintenance</option>
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
                          Status
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                          Deployment / Location
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                          Sensors
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase text-right">
                          Actions
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
                            {disp.status === "AVAILABLE" && <Badge color="success" size="sm">Available</Badge>}
                            {disp.status === "INSTALLED_ON_PLAN" && <Badge color="cyan" size="sm">Rent-to-Own</Badge>}
                            {disp.status === "INSTALLED_OWNED" && <Badge color="primary" size="sm">Customer Owned</Badge>}
                            {disp.status === "FAULTY" && <Badge color="error" size="sm">Faulty</Badge>}
                            {disp.status === "MAINTENANCE" && <Badge color="warning" size="sm">In Maintenance</Badge>}
                          </TableCell>

                          <TableCell className="px-5 py-4">
                            {disp.customerName ? (
                              <div>
                                <span className="font-semibold text-xs text-text-primary block">
                                  {disp.customerName}
                                </span>
                                <span className="text-[11px] text-text-tertiary">{disp.location}</span>
                              </div>
                            ) : (
                              <span className="text-text-tertiary text-xs italic">{disp.location || "Central Warehouse"}</span>
                            )}
                          </TableCell>

                          <TableCell className="px-5 py-4">
                            <div className="flex items-center gap-3 text-xs">
                              <span>Water: {disp.waterLevelPercent}%</span>
                              <span>Battery: {disp.batteryPercent}%</span>
                              <span className={`size-2 rounded-full ${disp.isOnline ? "bg-emerald-500" : "bg-card-border"}`} />
                            </div>
                          </TableCell>

                          <TableCell className="px-5 py-4 text-right">
                            <Button
                              appearance="outline"
                              size="sm"
                              onClick={() => openDispenserModal(disp)}
                              className="text-xs font-semibold"
                            >
                              Update Status
                            </Button>
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

        {/* TAB 3: STOCK AUDIT LEDGER */}
        {activeTab === "ledger" && (
          <div className="space-y-4">
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div className="w-72">
                  <InputGroup>
                    <InputGroupAddon className="text-icon-secondary">
                      <SearchIcon />
                    </InputGroupAddon>
                    <InputGroupInput
                      type="text"
                      placeholder="Search audit ledger by reason, staff, or item..."
                      value={ledgerSearch}
                      onChange={(e) => setLedgerSearch(e.target.value)}
                      className="text-xs"
                    />
                  </InputGroup>
                </div>
                <span className="text-xs text-text-tertiary">
                  {filteredLogs.length} audit records logged
                </span>
              </div>
            </Card>

            {isLoading ? (
              <SkeletonTable rows={5} columns={6} />
            ) : (
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <TableRoot>
                    <TableHeader>
                      <TableRow className="border-b border-card-border bg-background-gray-secondary/50">
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                          Date &amp; Time
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                          Staff Member
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                          Action
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                          Item Type
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                          Change
                        </TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                          Reason / Notes
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-card-border">
                      {filteredLogs.map((log) => (
                        <TableRow
                          key={log.id}
                          className="hover:bg-background-gray-secondary/30 transition"
                        >
                          <TableCell className="px-5 py-4 font-mono text-xs text-text-tertiary">
                            {new Date(log.timestamp).toLocaleString("en-GB", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </TableCell>

                          <TableCell className="px-5 py-4">
                            <span className="font-semibold text-xs text-text-primary block">
                              {log.userName}
                            </span>
                            <span className="text-[10px] text-text-tertiary">{log.userEmail}</span>
                          </TableCell>

                          <TableCell className="px-5 py-4">
                            <Badge
                              color={log.action === "ADD" ? "success" : "neutral"}
                              size="sm"
                            >
                              {log.action}
                            </Badge>
                          </TableCell>

                          <TableCell className="px-5 py-4 font-medium text-xs text-text-primary">
                            {log.itemType.replace("_", " ")}
                          </TableCell>

                          <TableCell className="px-5 py-4 font-mono font-bold text-xs">
                            {log.delta !== 0 ? (
                              <span
                                className={
                                  log.delta > 0
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-rose-600 dark:text-rose-400"
                                }
                              >
                                {log.delta > 0 ? `+${log.delta}` : log.delta}
                              </span>
                            ) : (
                              <span className="text-text-tertiary">0</span>
                            )}
                          </TableCell>

                          <TableCell className="px-5 py-4 text-xs text-text-secondary max-w-xs truncate">
                            {log.reason}
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

        {/* MODAL: Adjust Stock */}
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title="Manual Stock Adjustment"
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                {formError}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Item to Adjust
              </label>
              <select
                value={adjustItemType}
                onChange={(e) => setAdjustItemType(e.target.value as InventoryItemType)}
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
              >
                <option value="FILLED_BOTTLES">Filled 18.9L Bottles (Warehouse)</option>
                <option value="EMPTY_BOTTLES">Empty 18.9L Bottles (Warehouse)</option>
                <option value="DAMAGED_BOTTLES">Damaged Bottles</option>
                <option value="LOST_BOTTLES">Lost / Missing Bottles</option>
                <option value="DISPENSERS">Smart Dispensers (Units)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-text-primary">
                  Action
                </label>
                <select
                  value={adjustAction}
                  onChange={(e) => setAdjustAction(e.target.value as StockAction)}
                  className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
                >
                  <option value="ADD">Stock In (Add Stock)</option>
                  <option value="DEDUCT">Stock Out (Deduct Stock)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-text-primary">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  placeholder="e.g. 50"
                  required
                  className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Primary Reason
              </label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
              >
                <option value="Factory bottling line production run">Factory bottling line production run</option>
                <option value="Physical stocktake audit reconciliation">Physical stocktake audit reconciliation</option>
                <option value="Supplier shipment of new bottles received">Supplier shipment of new bottles received</option>
                <option value="Bottles broken / cracked during transit">Bottles broken / cracked during transit</option>
                <option value="Customer account reconciliation">Customer account reconciliation</option>
                <option value="Scrapped obsolete units">Scrapped obsolete units</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Additional Notes / Batch ID
              </label>
              <textarea
                rows={2}
                value={adjustNotes}
                onChange={(e) => setAdjustNotes(e.target.value)}
                placeholder="Optional batch number, invoice reference, or incident notes..."
                className="w-full rounded-lg border border-card-border bg-card-background p-2.5 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-card-border">
              <Button
                type="button"
                appearance="outline"
                size="sm"
                onClick={() => setIsAdjustModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting ? "Adjusting..." : "Confirm Stock Adjustment"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* MODAL: Update Dispenser Status */}
        <Modal
          isOpen={isDispenserModalOpen}
          onClose={() => setIsDispenserModalOpen(false)}
          title={`Update Dispenser: ${selectedDispenser?.serialNumber}`}
        >
          {selectedDispenser && (
            <form onSubmit={handleDispenserSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-text-primary">
                  Dispenser Status
                </label>
                <select
                  value={dispenserNewStatus}
                  onChange={(e) => setDispenserNewStatus(e.target.value as DispenserStatusType)}
                  className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
                >
                  <option value="AVAILABLE">Available in Warehouse</option>
                  <option value="INSTALLED_ON_PLAN">Installed on Rent-to-Own Plan</option>
                  <option value="INSTALLED_OWNED">Customer Owned (Transferred)</option>
                  <option value="FAULTY">Faulty / Under Inspection</option>
                  <option value="MAINTENANCE">Scheduled Maintenance</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-text-primary">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={dispenserNotes}
                  onChange={(e) => setDispenserNotes(e.target.value)}
                  placeholder="Maintenance details, customer delivery area..."
                  className="w-full rounded-lg border border-card-border bg-card-background p-2.5 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-card-border">
                <Button
                  type="button"
                  appearance="outline"
                  size="sm"
                  onClick={() => setIsDispenserModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="sm"
                >
                  {isSubmitting ? "Saving..." : "Save Status"}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}
