"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import type { DeliveryStop, DriverProfile } from "@/lib/dispatch-store";
import type { OrderStatus } from "@/lib/order-store";

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
      const driver = drivers.find((d) => d.id === selectedDriverId);
      const vanNumber = driver ? `${driver.vanNumber} (${driver.licensePlate})` : undefined;

      const res = await fetch("/api/dispatch/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: activeStop.orderId,
          driverId: selectedDriverId,
          vanNumber,
          notes: dispatchNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: "error", text: data.message || "Failed to assign driver." });
        setIsSubmitting(false);
        return;
      }

      setStops((prev) =>
        prev.map((s) => (s.orderId === activeStop.orderId ? data.stop : s))
      );

      setIsAssignModalOpen(false);
      setFeedback({
        type: "success",
        text: `Order ${activeStop.orderNumber} assigned to ${driver?.name || "Driver"}.`,
      });
    } catch {
      setFeedback({ type: "error", text: "Network error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return <Badge color="success" size="sm">Delivered</Badge>;
      case "OUT_FOR_DELIVERY":
        return <Badge color="info" size="sm">Out for Delivery</Badge>;
      case "ASSIGNED":
        return <Badge color="primary" size="sm">Driver Assigned</Badge>;
      case "PENDING":
        return <Badge color="warning" size="sm">Awaiting Driver</Badge>;
      case "CANCELLED":
        return <Badge color="dark" size="sm">Cancelled</Badge>;
    }
  };

  // Dispatch metrics
  const pendingCount = stops.filter((s) => s.status === "PENDING").length;
  const assignedCount = stops.filter((s) => s.status === "ASSIGNED").length;
  const enRouteCount = stops.filter((s) => s.status === "OUT_FOR_DELIVERY").length;
  const deliveredCount = stops.filter((s) => s.status === "DELIVERED").length;

  return (
    <AppLayout role={role}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Feedback alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-all ${
              feedback.type === "success"
                ? "bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 text-green-700 dark:text-green-300"
                : "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300"
            }`}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-0.5 rounded-lg"
              aria-label="Dismiss feedback"
            >
              <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Delivery Dispatch &amp; Queue
              </h1>
              <Badge color="info" size="sm">
                Operations
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Assign delivery orders to drivers, track bottle returns, and monitor delivery routes.
            </p>
          </div>
        </div>

        {/* 4 Dispatch KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium block">
              Unassigned Orders
            </span>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {pendingCount} Orders
            </div>
            <span className="text-[11px] text-gray-400">Awaiting driver assignment</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-brand-600 dark:text-blue-light-400 font-medium block">
              Assigned to Vans
            </span>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {assignedCount} Orders
            </div>
            <span className="text-[11px] text-gray-400">Queued for run</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-blue-light-600 dark:text-blue-light-400 font-medium block">
              En Route (Live)
            </span>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {enRouteCount} Vans
            </div>
            <span className="text-[11px] text-gray-400">On doorstep delivery</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block">
              Delivered Today
            </span>
            <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {deliveredCount} Stops
            </div>
            <span className="text-[11px] text-gray-400">Bottles exchanged</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2 relative">
            <input
              type="text"
              placeholder="Search by order number (FNW-...), customer, location, or driver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9.5 pl-8.5 pr-3 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
            />
            <svg
              className="size-3.5 text-gray-400 absolute left-3 top-3 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition cursor-pointer"
            >
              <option value="ALL">All Statuses ({stops.length})</option>
              <option value="PENDING">Awaiting Driver ({pendingCount})</option>
              <option value="ASSIGNED">Driver Assigned ({assignedCount})</option>
              <option value="OUT_FOR_DELIVERY">En Route ({enRouteCount})</option>
              <option value="DELIVERED">Delivered ({deliveredCount})</option>
            </select>
          </div>
        </div>

        {/* Dispatch Orders Table */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading dispatch queue...</div>
          ) : filteredStops.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No delivery orders match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer &amp; Area</th>
                    <th className="px-4 py-3">Digital Address</th>
                    <th className="px-4 py-3">Refill Volume</th>
                    <th className="px-4 py-3">Assigned Van</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredStops.map((stop) => (
                    <tr key={stop.orderId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900 dark:text-white">
                        {stop.orderNumber}
                        <span className="block text-[10px] font-normal text-gray-400">
                          {stop.deliverySlot}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {stop.customerName}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {stop.deliveryAddress}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[11px]">
                          {stop.digitalAddress}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {stop.bottlesDelivering} Bottles (19L)
                        </span>
                        <span className="block text-[10px] text-gray-400">
                          {stop.hasEmptyBottleExchange ? "Bottle Returned" : "Deposit Paid"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {stop.driverName ? (
                          <div>
                            <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                              {stop.driverName}
                            </span>
                            <span className="text-[10px] text-gray-400 block">
                              {stop.vanNumber || "Van 01"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="px-4 py-3">{getStatusBadge(stop.status)}</td>

                      <td className="px-4 py-3 text-right">
                        {stop.status === "DELIVERED" ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                            Completed
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openAssignModal(stop)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition shadow-xs cursor-pointer"
                          >
                            <span>{stop.driverId ? "Reassign" : "Assign Driver"}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL: Assign Driver & Van */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Delivery Driver: ${activeStop?.orderNumber}`}
        >
          {activeStop && (
            <form onSubmit={handleAssignDriver} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs space-y-1">
                <div>
                  <strong>Customer:</strong> {activeStop.customerName} ({activeStop.customerPhone})
                </div>
                <div>
                  <strong>Address:</strong> {activeStop.deliveryAddress} ({activeStop.digitalAddress})
                </div>
                <div>
                  <strong>Delivery Volume:</strong> {activeStop.bottlesDelivering} Refill Bottles (19L)
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block mb-1.5">
                  Select Fleet Driver &amp; Van
                </label>
                <div className="space-y-2">
                  {drivers.map((drv) => (
                    <label
                      key={drv.id}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        selectedDriverId === drv.id
                          ? "border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 ring-1 ring-brand-500/30"
                          : "border-gray-200 dark:border-gray-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="assignedDriver"
                          value={drv.id}
                          checked={selectedDriverId === drv.id}
                          onChange={(e) => setSelectedDriverId(e.target.value)}
                          className="text-brand-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">
                            {drv.name}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">
                            {drv.vanNumber} • {drv.licensePlate} • {drv.phone}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge color={drv.activeStopsCount > 4 ? "warning" : "primary"} size="sm">
                          {drv.activeStopsCount} Active Stops
                        </Badge>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block mb-1">
                  Dispatch Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call before arrival, gate code..."
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  className="w-full h-9.5 px-3 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-brand-500 hover:bg-brand-600 transition shadow-theme-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Dispatching..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}