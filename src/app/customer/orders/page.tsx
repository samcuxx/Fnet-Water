"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import OrderReceipt from "@/components/invoice/OrderReceipt";
import { SkeletonFeed } from "@/components/ui/skeleton";
import { staggerContainer, fadeInUp, cardHoverMotion } from "@/lib/animations";
import type { StoredOrder, OrderStatus } from "@/lib/order-store";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<StoredOrder | null>(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [receiptOrder, setReceiptOrder] = useState<StoredOrder | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to load customer orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.deliveryAddressText.toLowerCase().includes(q) ||
        o.deliveryDigitalAddress.toLowerCase().includes(q) ||
        o.items.some((it) => it.productName.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === "ALL" || o.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return <Badge color="success" size="sm">Delivered</Badge>;
      case "OUT_FOR_DELIVERY":
        return <Badge color="info" size="sm">Out for Delivery</Badge>;
      case "ASSIGNED":
        return <Badge color="primary" size="sm">Driver Assigned</Badge>;
      case "PENDING":
        return <Badge color="warning" size="sm">Order Placed</Badge>;
      case "CANCELLED":
        return <Badge color="dark" size="sm">Cancelled</Badge>;
    }
  };

  const openTracking = (order: StoredOrder) => {
    setSelectedOrder(order);
    setIsTrackingModalOpen(true);
  };

  return (
    <AppLayout role="CUSTOMER">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              My Orders &amp; Deliveries
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Track active water deliveries and view refill receipts across Ghana.
            </p>
          </div>

          <Link
            href="/customer/order"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            <span>+ Order Refill</span>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <input
              type="text"
              placeholder="Search by order number (FNW-...), area, or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition shadow-2xs"
            />
            <svg
              className="size-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none"
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
              aria-label="Filter by order status"
              className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Order Placed</option>
              <option value="ASSIGNED">Driver Assigned</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <SkeletonFeed count={4} />
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-gray-900/70 rounded-[28px] border border-gray-100 dark:border-gray-800/80 shadow-xs">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              No orders found matching your search.
            </p>
            <Link
              href="/customer/order"
              className="mt-3.5 inline-block px-5 py-2.5 rounded-2xl text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white transition shadow-xs"
            >
              Place Your First Refill Order
            </Link>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-4"
          >
            {filteredOrders.map((ord) => (
              <motion.div
                key={ord.id}
                variants={fadeInUp}
                whileHover={cardHoverMotion.whileHover}
                transition={cardHoverMotion.transition}
                className="p-5 sm:p-6 rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs space-y-3.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                      {ord.orderNumber}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(ord.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    {getStatusBadge(ord.status)}
                    <span className="text-sm font-black text-gray-900 dark:text-white">
                      GH₵ {ord.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items & Address Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Ordered Products
                    </span>
                    <div className="space-y-1">
                      {ord.items.map((it) => (
                        <div key={it.id} className="text-gray-800 dark:text-gray-200 font-semibold">
                          {it.productName} × {it.quantity}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Delivery Location &amp; Time
                    </span>
                    <div className="text-gray-800 dark:text-gray-200 font-medium">
                      {ord.deliveryAddressText}
                    </div>
                    <div className="font-mono text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      GPS: {ord.deliveryDigitalAddress} • {ord.deliverySlot}
                    </div>
                  </div>
                </div>

                {/* Tracking Action & Details */}
                <div className="pt-2 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                    {ord.hasEmptyBottleExchange ? "Empty Bottles Exchanged" : "Bottle Deposit Paid"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptOrder(ord);
                        setIsReceiptModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition cursor-pointer"
                    >
                      <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <span>Receipt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openTracking(ord)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-brand-600 dark:text-sky-400 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 transition cursor-pointer"
                    >
                      <span>Track Delivery</span>
                      <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Modal: Live Delivery Tracking Stepper */}
        <Modal
          isOpen={isTrackingModalOpen}
          onClose={() => setIsTrackingModalOpen(false)}
          title={`Delivery Tracking: ${selectedOrder?.orderNumber}`}
        >
          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                    Order Status
                  </span>
                  <div className="mt-0.5">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 block">
                    Total Paid
                  </span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    GH₵ {selectedOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Stepper */}
              <div className="relative pl-6 space-y-4 py-2 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-brand-500">
                {/* 1. Order Placed */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 size-3 rounded-full bg-brand-500 ring-4 ring-brand-100 dark:ring-brand-950" />
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    1. Order Placed
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Order confirmed and queued in dispatch system
                  </span>
                </div>

                {/* 2. Driver Assigned */}
                <div className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 size-3 rounded-full ${
                      selectedOrder.status === "ASSIGNED" ||
                      selectedOrder.status === "OUT_FOR_DELIVERY" ||
                      selectedOrder.status === "DELIVERED"
                        ? "bg-brand-500 ring-4 ring-brand-100 dark:ring-brand-950"
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  />
                  <span
                    className={`text-xs block ${
                      selectedOrder.status === "ASSIGNED" ||
                      selectedOrder.status === "OUT_FOR_DELIVERY" ||
                      selectedOrder.status === "DELIVERED"
                        ? "font-bold text-gray-900 dark:text-white"
                        : "font-medium text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    2. Driver Assigned
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {selectedOrder.assignedDriverName || "Allocated to fleet driver"}
                  </span>
                </div>

                {/* 3. Out for Delivery */}
                <div className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 size-3 rounded-full ${
                      selectedOrder.status === "OUT_FOR_DELIVERY" ||
                      selectedOrder.status === "DELIVERED"
                        ? "bg-brand-500 ring-4 ring-brand-100 dark:ring-brand-950"
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  />
                  <span
                    className={`text-xs block ${
                      selectedOrder.status === "OUT_FOR_DELIVERY" ||
                      selectedOrder.status === "DELIVERED"
                        ? "font-bold text-gray-900 dark:text-white"
                        : "font-medium text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    3. Out for Delivery
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Van en route to {selectedOrder.deliveryDigitalAddress}
                  </span>
                </div>

                {/* 4. Delivered */}
                <div className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 size-3 rounded-full ${
                      selectedOrder.status === "DELIVERED"
                        ? "bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950"
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  />
                  <span
                    className={`text-xs block ${
                      selectedOrder.status === "DELIVERED"
                        ? "font-bold text-emerald-600 dark:text-emerald-400"
                        : "font-medium text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    4. Delivered
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Water bottles delivered to destination
                  </span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-xs space-y-1">
                <div className="text-gray-700 dark:text-gray-300">
                  <strong>Destination:</strong> {selectedOrder.deliveryAddressText}
                </div>
                <div className="text-gray-500 dark:text-gray-400 font-mono">
                  <strong>GPS:</strong> {selectedOrder.deliveryDigitalAddress}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  <strong>Time Window:</strong> {selectedOrder.deliverySlot}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsTrackingModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal: Official Tax Invoice & Receipt */}
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          className="max-w-3xl"
        >
          {receiptOrder && (
            <OrderReceipt
              order={receiptOrder}
              onClose={() => setIsReceiptModalOpen(false)}
            />
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}
