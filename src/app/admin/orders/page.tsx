"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { Modal } from "@/components/ui/Modal";
import OrderReceipt from "@/components/invoice/OrderReceipt";
import { SkeletonMetrics, SkeletonTable } from "@/components/ui/skeleton";
import { staggerContainer, fadeInUp, cardHoverMotion } from "@/lib/animations";
import type { StoredOrder, OrderStatus } from "@/lib/order-store";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrder, setSelectedOrder] = useState<StoredOrder | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<StoredOrder | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Failed to load admin orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.deliveryAddressText.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return <Badge color="success" size="sm">Delivered</Badge>;
      case "OUT_FOR_DELIVERY":
        return <Badge color="warning" size="sm">Out for Delivery</Badge>;
      case "ASSIGNED":
        return <Badge color="info" size="sm">Driver Assigned</Badge>;
      case "PENDING":
        return <Badge color="warning" size="sm">Pending</Badge>;
      case "CANCELLED":
        return <Badge color="error" size="sm">Cancelled</Badge>;
      default:
        return <Badge color="light" size="sm">{status}</Badge>;
    }
  };

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const inTransitCount = orders.filter((o) => o.status === "OUT_FOR_DELIVERY" || o.status === "ASSIGNED").length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <AppLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                Customer Water Orders
              </h1>
              <Badge color="primary" size="sm">
                Executive
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Overview of all customer refill and dispenser orders across Ghana.
            </p>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        {isLoading ? (
          <SkeletonMetrics count={4} />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            <motion.div
              variants={fadeInUp}
              {...cardHoverMotion}
              className="p-5 rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs cursor-pointer"
            >
              <span className="text-xs text-gray-500 font-medium block">Total Orders</span>
              <div className="mt-1 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                {orders.length}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">All customer submissions</span>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              {...cardHoverMotion}
              className="p-5 rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs cursor-pointer"
            >
              <span className="text-xs text-amber-600 font-medium block">Awaiting Dispatch</span>
              <div className="mt-1 text-2xl sm:text-3xl font-black text-amber-600">
                {pendingCount}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">Ready for driver assignment</span>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              {...cardHoverMotion}
              className="p-5 rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs cursor-pointer"
            >
              <span className="text-xs text-brand-600 font-medium block">In Transit</span>
              <div className="mt-1 text-2xl sm:text-3xl font-black text-brand-600 dark:text-sky-400">
                {inTransitCount}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">En route to customers</span>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              {...cardHoverMotion}
              className="p-5 rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs cursor-pointer"
            >
              <span className="text-xs text-emerald-600 font-medium block">Completed</span>
              <div className="mt-1 text-2xl sm:text-3xl font-black text-emerald-600">
                {deliveredCount}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">Delivered and fulfilled</span>
            </motion.div>
          </motion.div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Search order number, customer, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-72 text-xs"
            />
            <Select
              options={[
                { value: "ALL", label: "All Statuses" },
                { value: "PENDING", label: "Pending" },
                { value: "ASSIGNED", label: "Driver Assigned" },
                { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
                { value: "DELIVERED", label: "Delivered" },
              ]}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              className="w-44 text-xs"
            />
          </div>
          <span className="text-xs text-gray-500">
            Showing {filteredOrders.length} of {orders.length} orders
          </span>
        </div>

        {/* Orders Table */}
        {isLoading ? (
          <SkeletonTable rows={6} columns={7} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs"
          >
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 font-semibold bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Delivery Location</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                        {ord.customerName}
                      </span>
                      <span className="text-[11px] text-gray-400">{ord.customerPhone}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="block text-gray-800 dark:text-gray-200 truncate max-w-xs">
                        {ord.deliveryAddressText}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">
                        {ord.deliveryDigitalAddress}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {ord.items.map((it) => `${it.productName} (${it.quantity})`).join(", ")}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                      GH₵ {ord.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(ord.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-2xl text-brand-600 dark:text-sky-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Order Details Modal */}
        <Modal
          isOpen={selectedOrder !== null}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details: ${selectedOrder?.orderNumber}`}
        >
          {selectedOrder && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {selectedOrder.customerName} ({selectedOrder.customerPhone})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Address:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {selectedOrder.deliveryAddressText} ({selectedOrder.deliveryDigitalAddress})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Slot:</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {selectedOrder.deliverySlot}
                  </span>
                </div>
                {selectedOrder.assignedDriverName && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assigned Driver:</span>
                    <span className="font-bold text-brand-600 dark:text-blue-light-400">
                      {selectedOrder.assignedDriverName}
                    </span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Ordered Products
                </span>
                <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-2.5 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white block">
                          {it.productName}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          Qty: {it.quantity} × GH₵ {it.unitPrice.toFixed(2)}
                        </span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">
                        GH₵ {it.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 space-y-1">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal:</span>
                  <span>GH₵ {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.depositFee > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Bottle Deposit:</span>
                    <span>GH₵ {selectedOrder.depositFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Delivery Fee:</span>
                  <span>{selectedOrder.deliveryFee === 0 ? "FREE" : `GH₵ ${selectedOrder.deliveryFee.toFixed(2)}`}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Reward Discount:</span>
                    <span>-GH₵ {selectedOrder.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white pt-1.5 border-t border-gray-200 dark:border-gray-700">
                  <span>Total Amount:</span>
                  <span>GH₵ {selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setInvoiceOrder(selectedOrder);
                    setIsInvoiceModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                >
                  <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span>Tax Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg text-white bg-brand-500 hover:bg-brand-600 transition shadow-theme-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal: Official Tax Invoice */}
        <Modal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          className="max-w-3xl"
        >
          {invoiceOrder && (
            <OrderReceipt
              order={invoiceOrder}
              onClose={() => setIsInvoiceModalOpen(false)}
            />
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}
