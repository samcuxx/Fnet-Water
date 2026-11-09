"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import type { DeliveryStop } from "@/lib/dispatch-store";

export default function DriverDashboardPage() {
  const [stops, setStops] = useState<DeliveryStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Point-of-Delivery Exchange Modal State
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [activeStop, setActiveStop] = useState<DeliveryStop | null>(null);
  const [filledDelivered, setFilledDelivered] = useState(4);
  const [emptyCollected, setEmptyCollected] = useState(4);
  const [damagedCount, setDamagedCount] = useState(0);
  const [cashCollected, setCashCollected] = useState(0);
  const [customerNotes, setCustomerNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load driver stops
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

  // Action: Start Delivery (mark Out for Delivery)
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

  // Open Handover / Bottle Exchange Modal
  const openExchangeModal = (stop: DeliveryStop) => {
    setActiveStop(stop);
    setFilledDelivered(stop.bottlesDelivering);
    setEmptyCollected(stop.expectedEmpty);
    setDamagedCount(0);
    setCashCollected(stop.paymentMethod === "CASH_ON_DELIVERY" ? stop.amount : 0);
    setCustomerNotes("Handed to customer in person");
    setIsExchangeModalOpen(true);
  };

  // Submit Point-of-Delivery Handover
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

  // Metrics
  const activeStops = stops.filter((s) => s.status !== "DELIVERED");
  const completedStops = stops.filter((s) => s.status === "DELIVERED");
  const totalBottlesSwapped = completedStops.reduce((acc, s) => acc + s.bottlesDelivering, 0);
  const totalCashCollected = completedStops
    .filter((s) => s.paymentMethod === "CASH_ON_DELIVERY")
    .reduce((acc, s) => acc + s.amount, 0);

  return (
    <AppLayout role="DRIVER">
      <div className="space-y-4 max-w-2xl mx-auto pb-12">
        {/* Toast alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-all ${
              feedback.type === "success"
                ? "bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 text-green-700 dark:text-green-300"
                : "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300"
            }`}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-0.5"
              aria-label="Dismiss feedback"
            >
              <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Mobile Header: Driver Profile & Vehicle info with Van Visual */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative size-12 rounded-xl overflow-hidden bg-sky-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800 shrink-0">
              <Image
                src="/images/logistics/delivery-van.jpg"
                alt="Assigned Delivery Van"
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-gray-900 dark:text-white">
                  Kwame Asante
                </h1>
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Van 01 (GT-4421-23) • Assigned Route
              </p>
            </div>
          </div>

          <Badge color="success" size="sm">
            On Duty
          </Badge>
        </div>

        {/* 4-Stat Metric Strip */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs text-center">
            <span className="text-[10px] text-gray-400 block truncate">Pending</span>
            <div className="text-base font-bold text-amber-600 dark:text-amber-400">
              {activeStops.length}
            </div>
          </div>

          <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs text-center">
            <span className="text-[10px] text-gray-400 block truncate">Completed</span>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {completedStops.length}
            </div>
          </div>

          <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs text-center">
            <span className="text-[10px] text-gray-400 block truncate">Exchanged</span>
            <div className="text-base font-bold text-brand-600 dark:text-blue-light-400">
              {totalBottlesSwapped}
            </div>
          </div>

          <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs text-center">
            <span className="text-[10px] text-gray-400 block truncate">Cash to Collect</span>
            <div className="text-base font-bold text-gray-900 dark:text-white truncate">
              GH₵ {totalCashCollected.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">
            Today&apos;s Delivery Stops ({stops.length})
          </h2>
          <span className="text-xs text-gray-400">
            {activeStops.length} pending
          </span>
        </div>

        {/* Delivery Stops List */}
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading delivery stops...</div>
        ) : stops.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            No delivery stops assigned to your van today.
          </div>
        ) : (
          <div className="space-y-3">
            {stops.map((stop) => {
              const isDelivered = stop.status === "DELIVERED";
              const isEnRoute = stop.status === "OUT_FOR_DELIVERY";

              return (
                <div
                  key={stop.orderId}
                  className={`p-4 rounded-2xl border transition shadow-theme-xs bg-white dark:bg-gray-900 space-y-3 ${
                    isEnRoute
                      ? "border-blue-light-500 ring-2 ring-blue-light-500/20"
                      : isDelivered
                      ? "border-gray-200 dark:border-gray-800 opacity-80"
                      : "border-gray-200 dark:border-gray-800"
                  }`}
                >
                  {/* Top: Order & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                        {stop.orderNumber}
                      </span>
                      <span className="text-gray-300 dark:text-gray-700">•</span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {stop.deliverySlot}
                      </span>
                    </div>

                    {isDelivered ? (
                      <Badge color="success" size="sm">Delivered</Badge>
                    ) : isEnRoute ? (
                      <Badge color="info" size="sm">En Route</Badge>
                    ) : (
                      <Badge color="warning" size="sm">Assigned</Badge>
                    )}
                  </div>

                  {/* Customer & Location */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {stop.customerName}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                      {stop.deliveryAddress}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="font-mono font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-[11px]">
                        {stop.digitalAddress}
                      </span>
                      <span className="text-brand-600 dark:text-blue-light-400 font-medium">
                        {stop.bottlesDelivering} Bottles (19L)
                      </span>
                    </div>
                  </div>

                  {/* Special Notes if any */}
                  {stop.deliveryInstructions && (
                    <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400">
                      <strong>Note:</strong> {stop.deliveryInstructions}
                    </div>
                  )}

                  {/* Quick Mobile Action Links (Call & Navigate) */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
                    <a
                      href={`tel:${stop.customerPhone}`}
                      className="py-2 rounded-xl text-xs font-semibold text-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition flex items-center justify-center gap-1.5"
                    >
                      <svg className="size-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      Call ({stop.customerPhone})
                    </a>

                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(stop.deliveryAddress + " " + stop.digitalAddress + ", Ghana")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2 rounded-xl text-xs font-semibold text-center bg-blue-light-50 dark:bg-blue-light-950/60 hover:bg-blue-light-100 text-blue-light-600 dark:text-blue-light-400 transition flex items-center justify-center gap-1.5"
                    >
                      <svg className="size-3.5 fill-current" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Open Maps GPS
                    </a>
                  </div>

                  {/* Primary Progression Button */}
                  {!isDelivered && (
                    <div className="pt-1">
                      {!isEnRoute ? (
                        <button
                          type="button"
                          onClick={() => handleStartDelivery(stop)}
                          className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs cursor-pointer"
                        >
                          Start Delivery
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openExchangeModal(stop)}
                          className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition shadow-theme-xs cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          Complete Delivery
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL: Complete Delivery */}
        <Modal
          isOpen={isExchangeModalOpen}
          onClose={() => setIsExchangeModalOpen(false)}
          title={`Complete Delivery: ${activeStop?.orderNumber}`}
        >
          {activeStop && (
            <form onSubmit={handleSubmitExchange} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-xs space-y-1">
                <div>
                  <strong>Customer:</strong> {activeStop.customerName}
                </div>
                <div>
                  <strong>Address:</strong> {activeStop.deliveryAddress} ({activeStop.digitalAddress})
                </div>
                <div>
                  <strong>Order Total:</strong> GH₵ {activeStop.amount.toFixed(2)}{" "}
                  <span className="font-semibold text-brand-600 dark:text-blue-light-400">
                    ({activeStop.paymentMethod === "CASH_ON_DELIVERY" ? "Cash to Collect" : "Pre-paid Mobile Money"})
                  </span>
                </div>
              </div>

              {/* Counters */}
              <div className="grid grid-cols-2 gap-3">
                {/* Filled Delivered */}
                <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-2">
                    Bottles Delivered
                  </span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setFilledDelivered(Math.max(0, filledDelivered - 1))}
                      className="size-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-base font-bold text-brand-600 dark:text-blue-light-400">
                      {filledDelivered}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFilledDelivered(filledDelivered + 1)}
                      className="size-8 rounded-lg bg-brand-500 text-white font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Empty Collected */}
                <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-2">
                    Empty Bottles Collected
                  </span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setEmptyCollected(Math.max(0, emptyCollected - 1))}
                      className="size-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {emptyCollected}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEmptyCollected(emptyCollected + 1)}
                      className="size-8 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Damaged Bottles Counter */}
              <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    Damaged Bottles
                  </span>
                  <span className="text-[10px] text-gray-400">Bottles needing repair</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDamagedCount(Math.max(0, damagedCount - 1))}
                    className="size-7 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-5 text-center text-xs font-bold text-red-600">
                    {damagedCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDamagedCount(damagedCount + 1)}
                    className="size-7 rounded-lg bg-red-600 text-white font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Cash Collection Input if Cash on Delivery */}
              {activeStop.paymentMethod === "CASH_ON_DELIVERY" && (
                <div>
                  <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block mb-1">
                    Cash Collected (GH₵)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cashCollected}
                    onChange={(e) => setCashCollected(parseFloat(e.target.value) || 0)}
                    className="w-full h-9.5 px-3 text-xs font-mono font-bold rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                  />
                </div>
              )}

              {/* Customer Sign-off Notes */}
              <div>
                <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block mb-1">
                  Delivery Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Left with reception, handed to customer..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full h-9.5 px-3 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsExchangeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-theme-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Confirm Delivery"}
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}
