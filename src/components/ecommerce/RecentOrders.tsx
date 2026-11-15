"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import Modal from "@/components/ui/Modal";
import type { StoredOrder, OrderStatus } from "@/lib/order-store";
import type { DriverProfile } from "@/lib/dispatch-store";

export default function RecentOrders() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);

  // Assign Driver Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<StoredOrder | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [dispatchNotes, setDispatchNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [ordersRes, driversRes] = await Promise.all([
        fetch("/api/orders"),
        fetch("/api/dispatch/drivers"),
      ]);

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      }

      if (driversRes.ok) {
        const driversData = await driversRes.json();
        if (driversData.success && driversData.drivers) {
          setDrivers(driversData.drivers);
          if (driversData.drivers.length > 0) {
            setSelectedDriverId(driversData.drivers[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load manager recent orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openAssignModal = (order: StoredOrder) => {
    setActiveOrder(order);
    setDispatchNotes(order.deliveryInstructions || "");
    setIsAssignModalOpen(true);
  };

  const handleAssignDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder || !selectedDriverId) return;

    setIsSubmitting(true);
    try {
      const driver = drivers.find((d) => d.id === selectedDriverId);
      const vanNumber = driver ? `${driver.vanNumber} (${driver.licensePlate})` : undefined;

      const res = await fetch("/api/dispatch/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: activeOrder.id,
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

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === activeOrder.id
            ? {
                ...o,
                status: "ASSIGNED",
                assignedDriverId: selectedDriverId,
                assignedDriverName: driver?.name || "Kwame Asante",
              }
            : o
        )
      );

      setIsAssignModalOpen(false);
      setFeedback({
        type: "success",
        text: `Order ${activeOrder.orderNumber} successfully assigned to ${driver?.name || "Kwame Asante"}.`,
      });
    } catch {
      setFeedback({ type: "error", text: "Network error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: OrderStatus, driverName?: string) => {
    switch (status) {
      case "DELIVERED":
        return <Badge color="success" size="sm">Delivered</Badge>;
      case "OUT_FOR_DELIVERY":
        return <Badge color="info" size="sm">Out for Delivery</Badge>;
      case "ASSIGNED":
        return (
          <Badge color="primary" size="sm">
            {driverName ? `Assigned: ${driverName.split(" ")[0]}` : "Assigned"}
          </Badge>
        );
      case "PENDING":
        return <Badge color="warning" size="sm">Awaiting Driver</Badge>;
      case "CANCELLED":
        return <Badge color="dark" size="sm">Cancelled</Badge>;
      default:
        return <Badge color="light" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="overflow-hidden rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 p-5 sm:p-7 shadow-xs">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`mb-4 p-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
            feedback.type === "success"
              ? "bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 text-green-700 dark:text-green-300"
              : "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300"
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 mb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Recent Delivery &amp; Refill Orders
            </h3>
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Real-time fulfillment queue across dispatch hubs
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition cursor-pointer disabled:opacity-50"
            title="Refresh Orders"
          >
            <svg
              className={`size-3.5 ${refreshing ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <Link
            href="/manager/deliveries"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl text-white bg-brand-500 hover:bg-brand-600 transition shadow-xs cursor-pointer"
          >
            <span>Dispatch Hub</span>
            <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500 dark:text-gray-400">
            Loading recent delivery orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500 dark:text-gray-400">
            No customer orders placed yet. Orders will appear here live when submitted.
          </div>
        ) : (
          <Table className="w-full text-left text-xs sm:text-sm">
            <TableHeader>
              <TableRow className="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-semibold">
                <TableCell isHeader className="py-3 px-3">
                  Order &amp; Items
                </TableCell>
                <TableCell isHeader className="py-3 px-3">
                  Customer &amp; Location
                </TableCell>
                <TableCell isHeader className="py-3 px-3">
                  Amount &amp; Method
                </TableCell>
                <TableCell isHeader className="py-3 px-3">
                  Status
                </TableCell>
                <TableCell isHeader className="py-3 px-3 text-right">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {orders.slice(0, 8).map((ord) => {
                const itemsSummary = ord.items
                  .map((it) => `${it.productName} (${it.quantity})`)
                  .join(", ") || "18.9L Water Refill";

                return (
                  <TableRow
                    key={ord.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                  >
                    <TableCell className="py-3.5 px-3">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {ord.orderNumber}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1" title={itemsSummary}>
                        {itemsSummary}
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-3">
                      <div className="text-gray-800 dark:text-gray-200 font-medium">
                        {ord.customerName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {ord.deliveryAddressText} {ord.deliveryDigitalAddress ? `(${ord.deliveryDigitalAddress})` : ""}
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-3">
                      <div className="font-bold text-gray-900 dark:text-white">
                        GH₵ {ord.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        {ord.paymentMethod === "MOBILE_MONEY" ? "Mobile Money" : ord.paymentMethod === "CASH_ON_DELIVERY" ? "Cash on Delivery" : ord.paymentMethod} •{" "}
                        <span className={ord.paymentStatus === "PAID" ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-amber-600 dark:text-amber-400"}>
                          {ord.paymentStatus}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-3">
                      {getStatusBadge(ord.status, ord.assignedDriverName)}
                    </TableCell>

                    <TableCell className="py-3.5 px-3 text-right">
                      {ord.status === "PENDING" ? (
                        <button
                          type="button"
                          onClick={() => openAssignModal(ord)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-xs cursor-pointer"
                        >
                          <span>Assign Driver</span>
                          <svg className="size-3" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                          </svg>
                        </button>
                      ) : (
                        <Link
                          href="/manager/deliveries"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-sky-400 hover:underline"
                        >
                          <span>Track Van</span>
                          <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Quick Assign Driver Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Driver to ${activeOrder?.orderNumber || "Order"}`}
      >
        {activeOrder && (
          <form onSubmit={handleAssignDriver} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 text-xs space-y-1.5">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Customer:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{activeOrder.customerName}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Address:</span>
                <span className="font-semibold text-gray-900 dark:text-white text-right">{activeOrder.deliveryAddressText}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Total Amount:</span>
                <span className="font-bold text-gray-900 dark:text-white">GH₵ {activeOrder.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Time Slot:</span>
                <span className="font-semibold text-brand-600 dark:text-sky-400">{activeOrder.deliverySlot}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Select Fleet Driver &amp; Delivery Van
              </label>
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs sm:text-sm font-medium text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                required
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.vanNumber} ({d.licensePlate}) • {d.activeStopsCount} Active Runs
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Driver Instructions / Route Notes (Optional)
              </label>
              <textarea
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Call gate phone upon arrival, customer exchanging 2 empty bottles."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Assigning..." : "Confirm Driver Assignment"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}