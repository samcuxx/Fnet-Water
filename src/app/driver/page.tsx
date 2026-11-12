"use client";

import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/tailgrids/core/badge";
import Breadcrumbs from "@/components/tailgrids/core/breadcrumbs";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import Modal from "@/components/ui/Modal";
import { SkeletonFeed } from "@/components/ui/skeleton";
import type { DeliveryStop } from "@/lib/dispatch-store";
import { cn } from "@/utils/cn";
import { MapPin, Minus, Phone, Plus, X } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";

export default function DriverDashboardPage() {
  const [stops, setStops] = useState<DeliveryStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Delivery Modal State
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [activeStop, setActiveStop] = useState<DeliveryStop | null>(null);
  const [filledDelivered, setFilledDelivered] = useState(4);
  const [emptyCollected, setEmptyCollected] = useState(4);
  const [damagedCount, setDamagedCount] = useState(0);
  const [cashCollected, setCashCollected] = useState(0);
  const [customerNotes, setCustomerNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDriverStops = useCallback(async () => {
    try {
      const res = await fetch("/api/driver/stops");
      const data = await res.json();
      if (data.success && data.stops) {
        setStops(data.stops);
      }
    } catch (err) {
      console.error("Failed to load driver stops:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDriverStops();
  }, [loadDriverStops]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleStartDelivery = async (stop: DeliveryStop) => {
    try {
      const res = await fetch("/api/driver/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: stop.orderId }),
      });

      const data = await res.json();
      if (data.success) {
        setStops((prev) =>
          prev.map((s) => (s.orderId === stop.orderId ? { ...s, status: "OUT_FOR_DELIVERY" } : s))
        );
        setFeedback({
          type: "success",
          text: `En route to ${stop.customerName} (${stop.digitalAddress}).`,
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error occurred." });
    }
  };

  const openExchangeModal = (stop: DeliveryStop) => {
    setActiveStop(stop);
    setFilledDelivered(stop.bottlesDelivering);
    setEmptyCollected(stop.expectedEmpty);
    setDamagedCount(0);
    setCashCollected(stop.paymentMethod === "CASH_ON_DELIVERY" ? stop.amount : 0);
    setCustomerNotes("Handed to customer in person");
    setIsExchangeModalOpen(true);
  };

  const handleSubmitExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStop) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/driver/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: activeStop.orderId,
          filledDelivered,
          emptyCollected,
          damagedCount,
          cashCollected,
          customerNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({ type: "error", text: data.message || "Failed to complete delivery." });
        setIsSubmitting(false);
        return;
      }

      setStops((prev) =>
        prev.map((s) => (s.orderId === activeStop.orderId ? data.stop : s))
      );

      setIsExchangeModalOpen(false);
      setFeedback({
        type: "success",
        text: `Stop completed! ${filledDelivered} bottles delivered, ${emptyCollected} empty collected.`,
      });
    } catch {
      setFeedback({ type: "error", text: "Network error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStops = stops.filter((s) => s.status !== "DELIVERED");
  const completedStops = stops.filter((s) => s.status === "DELIVERED");
  const totalBottlesSwapped = completedStops.reduce((acc, s) => acc + s.bottlesDelivering, 0);
  const totalCashCollected = completedStops
    .filter((s) => s.paymentMethod === "CASH_ON_DELIVERY")
    .reduce((acc, s) => acc + s.amount, 0);

  return (
    <AppLayout role="DRIVER">
      <div className="mt-4 space-y-5 max-w-2xl mx-auto pb-12 px-2 lg:px-4">
        {/* Toast Feedback Banner */}
        {feedback && (
          <div
            className={cn(
              "p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-all",
              feedback.type === "success"
                ? "bg-success-50 text-green-700 border border-success-200 dark:bg-success-950/40 dark:text-green-300"
                : "bg-error-50 text-red-700 border border-error-200 dark:bg-error-950/40 dark:text-red-300"
            )}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* NextAdmin Page Header */}
        <div>
          <div className="mb-2">
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: "/driver" },
                { label: "Portals", href: "/driver" },
                { label: "Driver Dispatch Run" },
              ]}
            />
          </div>
          <h1 className="mb-1 text-[28px] leading-8 font-semibold text-text-primary tracking-tight">
            Driver Dispatch Run
          </h1>
          <p className="text-sm leading-5 text-text-tertiary">
            Assigned delivery stops, real-time bottle exchange, and point-of-delivery reconciliation.
          </p>
        </div>

        {/* Assigned Vehicle Header Card */}
        <Card className="flex items-center justify-between gap-3 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="relative size-12 rounded-xl overflow-hidden bg-background-gray-primary border border-card-border shrink-0">
              <Image
                src="/images/logistics/delivery-van.jpg"
                alt="Delivery Van"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-text-primary">Kwame Asante</span>
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-text-tertiary">
                Van 01 (GT-4421-23) • Greater Accra Metro
              </p>
            </div>
          </div>

          <Badge color="success" size="sm">
            On Duty
          </Badge>
        </Card>

        {/* 4-Stat Metric Strip */}
        <div className="grid grid-cols-4 gap-2.5">
          <Card className="p-3 text-center">
            <span className="text-[10px] text-text-tertiary block font-medium">Pending</span>
            <div className="text-base font-bold text-orange-600">
              {activeStops.length}
            </div>
          </Card>

          <Card className="p-3 text-center">
            <span className="text-[10px] text-text-tertiary block font-medium">Completed</span>
            <div className="text-base font-bold text-green-600">
              {completedStops.length}
            </div>
          </Card>

          <Card className="p-3 text-center">
            <span className="text-[10px] text-text-tertiary block font-medium">Delivered</span>
            <div className="text-base font-bold text-primary">
              {totalBottlesSwapped}
            </div>
          </Card>

          <Card className="p-3 text-center">
            <span className="text-[10px] text-text-tertiary block font-medium">Cash to Collect</span>
            <div className="text-base font-bold text-text-primary truncate">
              GH₵ {totalCashCollected.toFixed(0)}
            </div>
          </Card>
        </div>

        {/* Stops Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pt-1">
            <h2 className="text-sm font-bold text-text-primary">
              Delivery Stops ({stops.length})
            </h2>
            <span className="text-xs text-text-tertiary">{activeStops.length} pending</span>
          </div>

          {loading ? (
            <SkeletonFeed count={3} />
          ) : stops.length === 0 ? (
            <Card className="p-8 text-center text-xs text-text-tertiary">
              No delivery stops assigned to your van today.
            </Card>
          ) : (
            stops.map((stop, idx) => (
              <Card key={stop.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-border-primary pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">{stop.customerName}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-text-tertiary mt-0.5">
                        <MapPin className="size-3 text-primary" />
                        <span>{stop.deliveryAddress}</span>
                      </div>
                    </div>
                  </div>

                  <Badge
                    color={
                      stop.status === "DELIVERED"
                        ? "success"
                        : stop.status === "OUT_FOR_DELIVERY"
                        ? "warning"
                        : "primary"
                    }
                    size="sm"
                  >
                    {stop.status === "DELIVERED"
                      ? "Delivered"
                      : stop.status === "OUT_FOR_DELIVERY"
                      ? "En Route"
                      : "Assigned"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs py-1">
                  <div>
                    <span className="text-text-tertiary text-[11px] block">Bottles Delivering</span>
                    <span className="font-bold text-text-primary">{stop.bottlesDelivering} × 19L</span>
                  </div>
                  <div>
                    <span className="text-text-tertiary text-[11px] block">Empties Expected</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">{stop.expectedEmpty} bottles</span>
                  </div>
                  <div>
                    <span className="text-text-tertiary text-[11px] block">Amount to Collect</span>
                    <span className="font-bold text-text-primary">
                      {stop.paymentMethod === "CASH_ON_DELIVERY"
                        ? `GH₵ ${stop.amount.toFixed(2)} (Cash)`
                        : "Paid via Mobile Money"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-primary">
                  <a
                    href={`tel:${stop.customerPhone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-card-border bg-card-background hover:bg-background-gray-primary text-text-secondary"
                  >
                    <Phone className="size-3 text-icon-tertiary" />
                    <span>Call</span>
                  </a>

                  {stop.status === "ASSIGNED" && (
                    <Button
                      size="sm"
                      onClick={() => handleStartDelivery(stop)}
                    >
                      Start Delivery
                    </Button>
                  )}

                  {stop.status === "OUT_FOR_DELIVERY" && (
                    <Button
                      size="sm"
                      onClick={() => openExchangeModal(stop)}
                    >
                      Complete Delivery
                    </Button>
                  )}

                  {stop.status === "DELIVERED" && (
                    <span className="text-xs font-semibold text-green-600">
                      ✓ Delivered
                    </span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Modal: Complete Delivery & Bottle Return */}
        <Modal
          isOpen={isExchangeModalOpen}
          onClose={() => setIsExchangeModalOpen(false)}
          title={`Complete Delivery: ${activeStop?.orderNumber}`}
        >
          <form onSubmit={handleSubmitExchange} className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-background-gray-primary border border-card-border space-y-1">
              <span className="font-bold text-text-primary block text-sm">{activeStop?.customerName}</span>
              <p className="text-text-secondary">{activeStop?.deliveryAddress}</p>
            </div>

            {/* Filled Delivered Adjuster */}
            <div className="flex items-center justify-between py-2 border-b border-border-primary">
              <div>
                <span className="font-semibold text-text-primary block">Bottles Delivered</span>
                <span className="text-[11px] text-text-tertiary">Sealed 19L pure water</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFilledDelivered((p) => Math.max(0, p - 1))}
                  className="size-8 rounded-lg border border-card-border bg-card-background flex items-center justify-center text-text-primary hover:bg-background-gray-primary cursor-pointer"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="font-bold text-base w-6 text-center text-text-primary">{filledDelivered}</span>
                <button
                  type="button"
                  onClick={() => setFilledDelivered((p) => p + 1)}
                  className="size-8 rounded-lg border border-card-border bg-card-background flex items-center justify-center text-text-primary hover:bg-background-gray-primary cursor-pointer"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Empty Collected Adjuster */}
            <div className="flex items-center justify-between py-2 border-b border-border-primary">
              <div>
                <span className="font-semibold text-text-primary block">Empty Bottles Collected</span>
                <span className="text-[11px] text-text-tertiary">Returning empties (No deposit fee)</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEmptyCollected((p) => Math.max(0, p - 1))}
                  className="size-8 rounded-lg border border-card-border bg-card-background flex items-center justify-center text-text-primary hover:bg-background-gray-primary cursor-pointer"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="font-bold text-base w-6 text-center text-text-primary">{emptyCollected}</span>
                <button
                  type="button"
                  onClick={() => setEmptyCollected((p) => p + 1)}
                  className="size-8 rounded-lg border border-card-border bg-card-background flex items-center justify-center text-text-primary hover:bg-background-gray-primary cursor-pointer"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Damaged Count Adjuster */}
            <div className="flex items-center justify-between py-2 border-b border-border-primary">
              <div>
                <span className="font-semibold text-text-primary block">Damaged Bottles</span>
                <span className="text-[11px] text-text-tertiary">Cracked or defective</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDamagedCount((p) => Math.max(0, p - 1))}
                  className="size-8 rounded-lg border border-card-border bg-card-background flex items-center justify-center text-text-primary hover:bg-background-gray-primary cursor-pointer"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="font-bold text-base w-6 text-center text-orange-600">{damagedCount}</span>
                <button
                  type="button"
                  onClick={() => setDamagedCount((p) => p + 1)}
                  className="size-8 rounded-lg border border-card-border bg-card-background flex items-center justify-center text-text-primary hover:bg-background-gray-primary cursor-pointer"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Cash Collected input if applicable */}
            {activeStop?.paymentMethod === "CASH_ON_DELIVERY" && (
              <div className="space-y-1">
                <label className="font-semibold text-text-primary block">Cash Collected (GH₵)</label>
                <input
                  type="number"
                  step="0.5"
                  value={cashCollected}
                  onChange={(e) => setCashCollected(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 font-bold"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-text-primary block">Delivery Notes</label>
              <input
                type="text"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="e.g. Handed to security at gate"
                className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
              <Button variant="ghost" size="sm" onClick={() => setIsExchangeModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Completing..." : "Complete Delivery"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
