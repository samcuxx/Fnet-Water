"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
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
import Modal from "@/components/ui/Modal";
import OrderReceipt from "@/components/invoice/OrderReceipt";
import { SkeletonFeed } from "@/components/ui/skeleton";
import { SearchIcon } from "@/components/common/header/icons";
import type { StoredOrder, OrderStatus } from "@/lib/order-store";
import { Droplet, FileText, ArrowRight, CheckCircle2 } from "lucide-react";

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
        return <Badge color="cyan" size="sm">Out for Delivery</Badge>;
      case "ASSIGNED":
        return <Badge color="primary" size="sm">Driver Assigned</Badge>;
      case "PENDING":
        return <Badge color="warning" size="sm">Order Placed</Badge>;
      case "CANCELLED":
        return <Badge color="neutral" size="sm">Cancelled</Badge>;
    }
  };

  const openTracking = (order: StoredOrder) => {
    setSelectedOrder(order);
    setIsTrackingModalOpen(true);
  };

  return (
    <AppLayout role="CUSTOMER">
      <div className="space-y-6">
        {/* Breadcrumbs & Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              My Orders &amp; Deliveries
            </h1>
            <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
              Track active water deliveries and view refill receipts across Ghana.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: "/customer" },
                { label: "My Orders" },
              ]}
            />
            <Button asChild size="sm" className="gap-2">
              <Link href="/customer/order">
                <Droplet className="size-3.5" />
                <span>Order Refill</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <InputGroup>
                <InputGroupAddon className="text-icon-secondary">
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  type="text"
                  placeholder="Search by order number (FNW-...), area, or product..."
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
                aria-label="Filter by order status"
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition cursor-pointer"
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
        </Card>

        {/* Orders List */}
        {loading ? (
          <SkeletonFeed count={4} />
        ) : filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-xs text-text-tertiary sm:text-sm">
              No orders found matching your search.
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link href="/customer/order">
                Place Your First Refill Order
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((ord) => (
              <Card key={ord.id} className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-card-border pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm font-bold text-text-primary">
                      {ord.orderNumber}
                    </span>
                    <span className="text-xs text-text-tertiary">•</span>
                    <span className="text-xs text-text-secondary">
                      {new Date(ord.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(ord.status)}
                    <span className="text-sm font-bold text-text-primary font-mono">
                      GH₵ {ord.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider block mb-1">
                      Ordered Products
                    </span>
                    <div className="space-y-1">
                      {ord.items.map((it) => (
                        <div key={it.id} className="text-text-primary font-semibold">
                          {it.productName} × {it.quantity}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider block mb-1">
                      Delivery Location &amp; Time
                    </span>
                    <div className="text-text-primary font-medium">
                      {ord.deliveryAddressText}
                    </div>
                    <div className="font-mono text-[11px] text-text-tertiary mt-0.5">
                      GPS: {ord.deliveryDigitalAddress} • {ord.deliverySlot}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-card-border pt-3">
                  <span className="text-[11px] font-medium text-text-tertiary">
                    {ord.hasEmptyBottleExchange ? "Bottle exchange completed" : "Bottle deposit paid"}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      appearance="outline"
                      size="sm"
                      onClick={() => {
                        setReceiptOrder(ord);
                        setIsReceiptModalOpen(true);
                      }}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <FileText className="size-3.5" />
                      <span>Receipt</span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => openTracking(ord)}
                      className="gap-1.5 text-xs font-semibold"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal: Live Delivery Tracking */}
        <Modal
          isOpen={isTrackingModalOpen}
          onClose={() => setIsTrackingModalOpen(false)}
          title={`Delivery Tracking: ${selectedOrder?.orderNumber}`}
        >
          {selectedOrder && (
            <div className="space-y-4">
              <div className="rounded-xl bg-background-gray-secondary p-4 flex items-center justify-between border border-card-border">
                <div>
                  <span className="text-[11px] text-text-tertiary block">
                    Order Status
                  </span>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-text-tertiary block">
                    Total Amount
                  </span>
                  <span className="text-sm font-bold text-text-primary font-mono">
                    GH₵ {selectedOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Stepper */}
              <div className="relative pl-6 space-y-4 py-2 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-primary">
                {/* 1. Order Placed */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 size-3 rounded-full bg-primary ring-4 ring-primary/20" />
                  <span className="text-xs font-bold text-text-primary block">
                    1. Order Placed
                  </span>
                  <span className="text-[11px] text-text-tertiary">
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
                        ? "bg-primary ring-4 ring-primary/20"
                        : "bg-card-border"
                    }`}
                  />
                  <span
                    className={`text-xs block ${
                      selectedOrder.status === "ASSIGNED" ||
                      selectedOrder.status === "OUT_FOR_DELIVERY" ||
                      selectedOrder.status === "DELIVERED"
                        ? "font-bold text-text-primary"
                        : "font-medium text-text-tertiary"
                    }`}
                  >
                    2. Driver Assigned
                  </span>
                  <span className="text-[11px] text-text-tertiary">
                    {selectedOrder.assignedDriverName || "Awaiting driver assignment"}
                  </span>
                </div>

                {/* 3. Out for Delivery */}
                <div className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 size-3 rounded-full ${
                      selectedOrder.status === "OUT_FOR_DELIVERY" ||
                      selectedOrder.status === "DELIVERED"
                        ? "bg-primary ring-4 ring-primary/20"
                        : "bg-card-border"
                    }`}
                  />
                  <span
                    className={`text-xs block ${
                      selectedOrder.status === "OUT_FOR_DELIVERY" ||
                      selectedOrder.status === "DELIVERED"
                        ? "font-bold text-text-primary"
                        : "font-medium text-text-tertiary"
                    }`}
                  >
                    3. Out for Delivery
                  </span>
                  <span className="text-[11px] text-text-tertiary">
                    Van en route to destination
                  </span>
                </div>

                {/* 4. Delivered */}
                <div className="relative">
                  <div
                    className={`absolute -left-6 top-0.5 size-3 rounded-full ${
                      selectedOrder.status === "DELIVERED"
                        ? "bg-emerald-500 ring-4 ring-emerald-500/20"
                        : "bg-card-border"
                    }`}
                  />
                  <span
                    className={`text-xs block ${
                      selectedOrder.status === "DELIVERED"
                        ? "font-bold text-emerald-600 dark:text-emerald-400"
                        : "font-medium text-text-tertiary"
                    }`}
                  >
                    4. Complete Delivery
                  </span>
                  <span className="text-[11px] text-text-tertiary">
                    Bottles delivered to doorstep
                  </span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="pt-3 border-t border-card-border text-xs space-y-1">
                <div className="text-text-primary">
                  <strong>Destination:</strong> {selectedOrder.deliveryAddressText}
                </div>
                <div className="text-text-tertiary font-mono">
                  <strong>GPS:</strong> {selectedOrder.deliveryDigitalAddress}
                </div>
                <div className="text-text-tertiary">
                  <strong>Time Window:</strong> {selectedOrder.deliverySlot}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-card-border">
                <Button
                  appearance="outline"
                  size="sm"
                  onClick={() => setIsTrackingModalOpen(false)}
                >
                  Close
                </Button>
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
