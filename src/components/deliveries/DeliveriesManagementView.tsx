"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import Modal from "@/components/ui/Modal";
import { SkeletonMetrics, SkeletonTable } from "@/components/ui/skeleton";
import { SearchIcon } from "@/components/common/header/icons";
import type { DeliveryStop, DriverProfile } from "@/lib/dispatch-store";
import type { OrderStatus } from "@/lib/order-store";
import {
  AlertCircle,
  Truck,
  CheckCircle2,
  Clock,
  Check,
  X,
  MapPin,
  User,
} from "lucide-react";

export default function DeliveriesManagementView({
  role = "MANAGER",
}: {
  role?: "ADMIN" | "MANAGER";
}) {
  const [stops, setStops] = useState<DeliveryStop[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Assign Driver Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeStop, setActiveStop] = useState<DeliveryStop | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const homeHref = role === "ADMIN" ? "/admin" : "/manager";

  // Load data
  const loadData = useCallback(async () => {
    try {
      const [stopsRes, driversRes] = await Promise.all([
        fetch("/api/dispatch/orders"),
        fetch("/api/dispatch/drivers"),
      ]);

      const stopsData = await stopsRes.json();
      if (stopsData.success && stopsData.stops) {
        setStops(stopsData.stops);
      }

      const driversData = await driversRes.json();
      if (driversData.success && driversData.drivers) {
        setDrivers(driversData.drivers);
        if (driversData.drivers.length > 0) {
          setSelectedDriverId(driversData.drivers[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load dispatch data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Client-side filtering
  const filteredStops = useMemo(() => {
    const q = search.toLowerCase().trim();
    return stops.filter((s) => {
      const matchesSearch =
        !q ||
        s.orderNumber.toLowerCase().includes(q) ||
        s.customerName.toLowerCase().includes(q) ||
        s.deliveryAddress.toLowerCase().includes(q) ||
        s.digitalAddress.toLowerCase().includes(q) ||
        (s.driverName && s.driverName.toLowerCase().includes(q));

      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [stops, search, statusFilter]);

  // Open assign modal
  const openAssignModal = (stop: DeliveryStop) => {
    setActiveStop(stop);
    setDispatchNotes(stop.deliveryInstructions || "");
    setIsAssignModalOpen(true);
  };

  // Submit driver assignment
  const handleAssignDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStop || !selectedDriverId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/dispatch/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: activeStop.orderId,
          driverId: selectedDriverId,
          deliveryInstructions: dispatchNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({
          type: "success",
          text: `Order ${activeStop.orderNumber} successfully assigned to ${data.assignment?.driverName || "driver"}.`,
        });
        setIsAssignModalOpen(false);
        await loadData();
      } else {
        setFeedback({
          type: "error",
          text: data.error || "Driver assignment failed. Please retry.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        text: "Network error occurred during driver assignment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return <Badge color="success" size="sm">Delivered</Badge>;
      case "OUT_FOR_DELIVERY":
        return <Badge color="cyan" size="sm">En Route</Badge>;
      case "ASSIGNED":
        return <Badge color="primary" size="sm">Driver Assigned</Badge>;
      case "PENDING":
        return <Badge color="warning" size="sm">Awaiting Driver</Badge>;
      default:
        return <Badge color="neutral" size="sm">Cancelled</Badge>;
    }
  };

  // Dispatch metrics
  const pendingCount = stops.filter((s) => s.status === "PENDING").length;
  const assignedCount = stops.filter((s) => s.status === "ASSIGNED").length;
  const enRouteCount = stops.filter((s) => s.status === "OUT_FOR_DELIVERY").length;
  const deliveredCount = stops.filter((s) => s.status === "DELIVERED").length;

  return (
    <AppLayout role={role}>
      <div className="space-y-6">
        {/* Feedback alert */}
        {feedback && (
          <div
            className={`flex items-center justify-between rounded-xl p-4 text-xs font-semibold sm:text-sm ${
              feedback.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Check className="size-4 shrink-0" />
              <span>{feedback.text}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-text-tertiary hover:text-text-primary cursor-pointer p-0.5"
              aria-label="Dismiss feedback"
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
                Delivery Dispatch &amp; Queue
              </h1>
              <Badge color="primary" size="sm">
                Operations
              </Badge>
            </div>
            <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
              Assign delivery orders to drivers, track bottle returns, and monitor delivery routes across Ghana.
            </p>
          </div>
          <div>
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: homeHref },
                { label: "Delivery Dispatch" },
              ]}
            />
          </div>
        </div>

        {/* 4 Dispatch KPI Cards (NextAdmin Pro Style) */}
        {loading ? (
          <SkeletonMetrics count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
            {/* Card 1: Unassigned Orders */}
            <Card beamIndex={3}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Unassigned Orders
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-amber-600 dark:text-amber-400 sm:text-2xl lg:text-3xl">
                    {pendingCount}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <AlertCircle className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">Awaiting driver assignment</p>
            </Card>

            {/* Card 2: Assigned */}
            <Card beamIndex={0}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-text-secondary">
                    Assigned to Vans
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-text-primary sm:text-2xl lg:text-3xl">
                    {assignedCount}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-blue-light-100 text-primary dark:bg-blue-light-950/60 dark:text-blue-light-400">
                  <Truck className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">Queued for delivery run</p>
            </Card>

            {/* Card 3: En Route */}
            <Card beamIndex={5}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-text-secondary">
                    En Route (Live)
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-sky-600 dark:text-sky-400 sm:text-2xl lg:text-3xl">
                    {enRouteCount}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                  <Clock className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">Active van route stops</p>
            </Card>

            {/* Card 4: Delivered */}
            <Card beamIndex={1}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-text-secondary">
                    Delivered Today
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400 sm:text-2xl lg:text-3xl">
                    {deliveredCount}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <CheckCircle2 className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">Completed bottle exchanges</p>
            </Card>
          </div>
        )}

        {/* Filter & Search Bar */}
        <Card className="p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <InputGroup>
                <InputGroupAddon className="text-icon-secondary">
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  type="text"
                  placeholder="Search by order number (FNW-...), customer, location, or driver..."
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
                aria-label="Filter by delivery status"
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition cursor-pointer"
              >
                <option value="ALL">All Statuses ({stops.length})</option>
                <option value="PENDING">Awaiting Driver ({pendingCount})</option>
                <option value="ASSIGNED">Driver Assigned ({assignedCount})</option>
                <option value="OUT_FOR_DELIVERY">En Route ({enRouteCount})</option>
                <option value="DELIVERED">Delivered ({deliveredCount})</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Dispatch Orders Table (NextAdmin Pro TableRoot) */}
        {loading ? (
          <SkeletonTable rows={6} columns={7} />
        ) : (
          <Card className="overflow-hidden p-0">
            {filteredStops.length === 0 ? (
              <div className="p-12 text-center text-xs text-text-tertiary">
                No delivery orders match your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <TableRoot>
                  <TableHeader>
                    <TableRow className="border-b border-card-border bg-background-gray-secondary/50">
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                        Order #
                      </TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                        Customer &amp; Area
                      </TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                        Digital Address
                      </TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                        Volume
                      </TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                        Assigned Van
                      </TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                        Status
                      </TableHead>
                      <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-card-border">
                    {filteredStops.map((stop) => (
                      <TableRow
                        key={stop.orderId}
                        className="hover:bg-background-gray-secondary/30 transition"
                      >
                        <TableCell className="px-5 py-4 font-mono font-bold text-xs text-text-primary">
                          {stop.orderNumber}
                          <span className="block text-[11px] font-normal text-text-tertiary">
                            {stop.deliverySlot}
                          </span>
                        </TableCell>

                        <TableCell className="px-5 py-4">
                          <div className="font-semibold text-xs text-text-primary">
                            {stop.customerName}
                          </div>
                          <div className="text-xs text-text-tertiary truncate max-w-xs">
                            {stop.deliveryAddress}
                          </div>
                        </TableCell>

                        <TableCell className="px-5 py-4 font-mono text-xs text-text-secondary">
                          <span className="px-2 py-0.5 rounded bg-background-gray-secondary text-[11px]">
                            {stop.digitalAddress}
                          </span>
                        </TableCell>

                        <TableCell className="px-5 py-4">
                          <span className="font-semibold text-xs text-text-primary">
                            {stop.bottlesDelivering} Bottles (19L)
                          </span>
                          <span className="block text-[11px] text-text-tertiary">
                            {stop.hasEmptyBottleExchange ? "Bottle exchange" : "Deposit paid"}
                          </span>
                        </TableCell>

                        <TableCell className="px-5 py-4">
                          {stop.driverName ? (
                            <div>
                              <span className="font-semibold text-xs text-text-primary block">
                                {stop.driverName}
                              </span>
                              <span className="text-[11px] text-text-tertiary block">
                                {stop.vanNumber || "Van 01"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-text-tertiary text-xs italic">Unassigned</span>
                          )}
                        </TableCell>

                        <TableCell className="px-5 py-4">
                          {getStatusBadge(stop.status)}
                        </TableCell>

                        <TableCell className="px-5 py-4 text-right">
                          {stop.status === "DELIVERED" ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                              Completed
                            </span>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => openAssignModal(stop)}
                              className="text-xs font-semibold"
                            >
                              <span>{stop.driverId ? "Reassign" : "Assign Driver"}</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableRoot>
              </div>
            )}
          </Card>
        )}

        {/* MODAL: Assign Driver & Van */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Delivery Driver: ${activeStop?.orderNumber}`}
        >
          {activeStop && (
            <form onSubmit={handleAssignDriver} className="space-y-4">
              <div className="rounded-xl bg-background-gray-secondary p-4 text-xs space-y-1.5 border border-card-border">
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Customer:</span>
                  <span className="font-bold text-text-primary">{activeStop.customerName} ({activeStop.customerPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Address:</span>
                  <span className="font-medium text-text-primary">{activeStop.deliveryAddress} ({activeStop.digitalAddress})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Volume:</span>
                  <span className="font-bold text-primary">{activeStop.bottlesDelivering} Refill Bottles (19L)</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider block mb-2">
                  Select Fleet Driver &amp; Van
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {drivers.map((drv) => (
                    <label
                      key={drv.id}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        selectedDriverId === drv.id
                          ? "border-primary bg-blue-light-50/40 dark:bg-blue-light-950/20 ring-1 ring-primary"
                          : "border-card-border hover:bg-background-gray-secondary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="assignedDriver"
                          value={drv.id}
                          checked={selectedDriverId === drv.id}
                          onChange={(e) => setSelectedDriverId(e.target.value)}
                          className="text-primary"
                        />
                        <div>
                          <div className="text-xs font-bold text-text-primary">
                            {drv.name}
                          </div>
                          <div className="text-[11px] text-text-tertiary">
                            {drv.vanNumber || "Van 01"} • {drv.phone}
                          </div>
                        </div>
                      </div>
                      <Badge
                        color={drv.isAvailable ? "success" : "neutral"}
                        size="sm"
                      >
                        {drv.isAvailable ? "AVAILABLE" : "BUSY"}
                      </Badge>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-primary block mb-1">
                  Dispatch Notes / Directions
                </label>
                <textarea
                  rows={2}
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  placeholder="Gate code, landmarks, special customer instructions..."
                  className="w-full rounded-lg border border-card-border bg-card-background p-2.5 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-card-border">
                <Button
                  type="button"
                  appearance="outline"
                  size="sm"
                  onClick={() => setIsAssignModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedDriverId}
                  size="sm"
                >
                  {isSubmitting ? "Assigning..." : "Confirm Driver Assignment"}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}
