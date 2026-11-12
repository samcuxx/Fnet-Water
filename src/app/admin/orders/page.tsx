"use client";

import OrderReceipt from "@/components/invoice/OrderReceipt";
import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/tailgrids/core/badge";
import Breadcrumbs from "@/components/tailgrids/core/breadcrumbs";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/tailgrids/core/input-group";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { Modal } from "@/components/ui/Modal";
import { SkeletonMetrics, SkeletonTable } from "@/components/ui/skeleton";
import { cardHoverMotion, fadeInUp, staggerContainer } from "@/lib/animations";
import type { OrderStatus, StoredOrder } from "@/lib/order-store";
import { cn } from "@/utils/cn";
import { SearchIcon } from "@/components/common/header/icons";
import { TaskIcon, TableIcon, Widget4Icon, InvoiceIcon } from "@/components/common/sidebar/icon";
import { ArrowDownIcon, ArrowUpIcon, DownloadIcon, FilterIcon, MenuDotsIcon } from "@/utils/icon";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

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
        return <Badge color="primary" size="sm">Driver Assigned</Badge>;
      case "PENDING":
        return <Badge color="warning" size="sm">Pending</Badge>;
      case "CANCELLED":
        return <Badge color="error" size="sm">Cancelled</Badge>;
      default:
        return <Badge color="neutral" size="sm">{status}</Badge>;
    }
  };

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const inTransitCount = orders.filter(
    (o) => o.status === "OUT_FOR_DELIVERY" || o.status === "ASSIGNED"
  ).length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;

  return (
    <AppLayout role="ADMIN">
      <div className="mt-4 space-y-6 px-2 lg:px-4">
        {/* NextAdmin Page Header */}
        <div>
          <div className="mb-2">
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: "/admin" },
                { label: "Operations", href: "/admin/orders" },
                { label: "Orders" },
              ]}
            />
          </div>
          <h1 className="mb-1 text-[28px] leading-8 font-semibold text-text-primary tracking-tight">
            Customer Water Orders
          </h1>
          <p className="text-sm leading-5 text-text-tertiary">
            Real-time fulfillment tracking, bottle returns, and dispatch status across Greater Accra.
          </p>
        </div>

        {/* 4-Card NextAdmin Pro Overview Stats */}
        {isLoading ? (
          <SkeletonMetrics count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            <Card beamIndex={0}>
              <CardHeader className="justify-between">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-light-50 text-primary dark:bg-blue-light-950">
                  <TaskIcon />
                </div>
              </CardHeader>
              <CardContent className="mt-3.5 sm:mt-5 p-0">
                <div className="text-lg leading-6 font-bold text-text-primary sm:text-xl md:text-2xl">
                  {orders.length}
                </div>
              </CardContent>
              <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
                <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Total Orders</span>
                <span className="text-[11px] leading-4 sm:text-xs font-semibold text-primary">All submissions</span>
              </CardFooter>
            </Card>

            <Card beamIndex={3}>
              <CardHeader className="justify-between">
                <div className="flex size-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500 dark:bg-orange-950">
                  <TableIcon />
                </div>
              </CardHeader>
              <CardContent className="mt-3.5 sm:mt-5 p-0">
                <div className="text-lg leading-6 font-bold text-orange-600 dark:text-orange-400 sm:text-xl md:text-2xl">
                  {pendingCount}
                </div>
              </CardContent>
              <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
                <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Awaiting Driver</span>
                <span className="text-[11px] leading-4 sm:text-xs font-semibold text-orange-500">Unassigned</span>
              </CardFooter>
            </Card>

            <Card beamIndex={5}>
              <CardHeader className="justify-between">
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-primary dark:bg-brand-950">
                  <Widget4Icon />
                </div>
              </CardHeader>
              <CardContent className="mt-3.5 sm:mt-5 p-0">
                <div className="text-lg leading-6 font-bold text-primary sm:text-xl md:text-2xl">
                  {inTransitCount}
                </div>
              </CardContent>
              <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
                <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">In Transit</span>
                <span className="text-[11px] leading-4 sm:text-xs font-semibold text-primary">On delivery van</span>
              </CardFooter>
            </Card>

            <Card beamIndex={1}>
              <CardHeader className="justify-between">
                <div className="flex size-8 items-center justify-center rounded-lg bg-success-50 text-green-600 dark:bg-success-950">
                  <InvoiceIcon />
                </div>
              </CardHeader>
              <CardContent className="mt-3.5 sm:mt-5 p-0">
                <div className="text-lg leading-6 font-bold text-green-600 sm:text-xl md:text-2xl">
                  {deliveredCount}
                </div>
              </CardContent>
              <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
                <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Delivered</span>
                <span className="text-[11px] leading-4 sm:text-xs font-semibold text-green-600">Empties collected</span>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Main Orders Table Card */}
        <Card className="p-0 overflow-hidden">
          <CardHeader className="p-5 pb-4">
            <div>
              <CardTitle>Fulfillment Register</CardTitle>
              <p className="mt-0.5 text-xs text-text-tertiary">
                Showing {filteredOrders.length} of {orders.length} orders
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <InputGroup className="h-9 w-52 sm:w-64">
                <InputGroupAddon align="inline-start" className="pr-0 text-icon-tertiary">
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search orders, customers..."
                  className="pl-2 text-xs"
                />
              </InputGroup>

              {/* Status Filter buttons */}
              <div className="flex items-center gap-1 rounded-lg border border-card-border bg-background-gray-primary p-0.5">
                {(["ALL", "PENDING", "ASSIGNED", "DELIVERED"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer",
                      statusFilter === st
                        ? "bg-card-background text-text-primary font-semibold shadow-xs"
                        : "text-text-tertiary hover:text-text-primary"
                    )}
                  >
                    {st === "ALL" ? "All" : st.charAt(0) + st.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          {/* Table */}
          {isLoading ? (
            <div className="p-5">
              <SkeletonTable rows={6} columns={7} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <TableRoot className="w-full rounded-none border-none">
                <TableHeader>
                  <TableRow className="border-t border-b border-border-primary bg-background-gray-primary/40">
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Order ID
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Customer
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Delivery Location
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Items
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Total
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Status
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-xs font-semibold text-text-secondary">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-xs text-text-tertiary">
                        No orders match the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((ord) => (
                      <TableRow key={ord.id} className="hover:bg-background-gray-primary/50 transition-colors">
                        <TableCell className="px-5 py-3 font-mono text-xs font-bold text-text-primary whitespace-nowrap">
                          {ord.orderNumber}
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <span className="font-medium text-xs text-text-primary block">
                            {ord.customerName}
                          </span>
                          <span className="text-[11px] text-text-tertiary">{ord.customerPhone}</span>
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          <span className="block text-xs text-text-secondary truncate max-w-xs">
                            {ord.deliveryAddressText}
                          </span>
                          <span className="text-[10px] font-mono text-text-tertiary">
                            {ord.deliveryDigitalAddress}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-3 text-xs text-text-secondary">
                          {ord.items.map((it) => `${it.productName} (${it.quantity})`).join(", ")}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-xs font-bold text-text-primary whitespace-nowrap">
                          GH₵ {ord.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell className="px-5 py-3">
                          {getStatusBadge(ord.status)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => setSelectedOrder(ord)}
                            className="text-primary hover:text-brand-600 hover:bg-brand-50 font-semibold cursor-pointer"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableRoot>
            </div>
          )}
        </Card>

        {/* Order Details Modal */}
        <Modal
          isOpen={selectedOrder !== null}
          onClose={() => setSelectedOrder(null)}
          title={`Order Details: ${selectedOrder?.orderNumber}`}
        >
          {selectedOrder && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-background-gray-primary border border-card-border space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Customer:</span>
                  <span className="font-bold text-text-primary">
                    {selectedOrder.customerName} ({selectedOrder.customerPhone})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Delivery Address:</span>
                  <span className="font-medium text-text-secondary">
                    {selectedOrder.deliveryAddressText} ({selectedOrder.deliveryDigitalAddress})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Delivery Slot:</span>
                  <span className="font-medium text-text-secondary">
                    {selectedOrder.deliverySlot}
                  </span>
                </div>
                {selectedOrder.assignedDriverName && (
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Assigned Driver:</span>
                    <span className="font-bold text-primary">
                      {selectedOrder.assignedDriverName}
                    </span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                  Ordered Products
                </span>
                <div className="border border-card-border rounded-xl overflow-hidden divide-y divide-card-border">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-2.5 flex justify-between items-center bg-card-background">
                      <div>
                        <span className="font-semibold text-text-primary block">
                          {it.productName}
                        </span>
                        <span className="text-[11px] text-text-tertiary">
                          Qty: {it.quantity} × GH₵ {it.unitPrice.toFixed(2)}
                        </span>
                      </div>
                      <span className="font-bold text-text-primary">
                        GH₵ {it.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-3.5 rounded-xl bg-background-gray-primary border border-card-border space-y-1">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal:</span>
                  <span>GH₵ {selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrder.depositFee > 0 && (
                  <div className="flex justify-between text-text-secondary">
                    <span>Bottle Deposit:</span>
                    <span>GH₵ {selectedOrder.depositFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-secondary">
                  <span>Delivery Fee:</span>
                  <span>{selectedOrder.deliveryFee === 0 ? "FREE" : `GH₵ ${selectedOrder.deliveryFee.toFixed(2)}`}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Reward Discount:</span>
                    <span>-GH₵ {selectedOrder.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-text-primary pt-1.5 border-t border-card-border">
                  <span>Total Amount:</span>
                  <span>GH₵ {selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInvoiceOrder(selectedOrder);
                    setIsInvoiceModalOpen(true);
                  }}
                  className="gap-1.5"
                >
                  <FileText className="size-3.5" />
                  <span>Tax Invoice</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
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
