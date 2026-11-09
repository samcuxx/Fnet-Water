"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import type { StoredProduct } from "@/lib/product-store";
import type { StoredAddress, StoredCustomerProfile } from "@/lib/customer-store";
import type { PaymentMethod } from "@/lib/order-store";

interface CartState {
  [productId: string]: number;
}

export default function OrderWaterPage() {
  const router = useRouter();

  // Data
  const [products, setProducts] = useState<StoredProduct[]>([]);
  const [addresses, setAddresses] = useState<StoredAddress[]>([]);
  const [profile, setProfile] = useState<StoredCustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Cart & Order Options
  const [cart, setCart] = useState<CartState>({ prod_001: 2 }); // Default 2 refill bottles
  const [hasEmptyBottleExchange, setHasEmptyBottleExchange] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [deliverySlot, setDeliverySlot] = useState<"Morning (8am - 12pm)" | "Afternoon (12pm - 4pm)" | "Evening (4pm - 7pm)">("Morning (8am - 12pm)");
  const [deliveryDate, setDeliveryDate] = useState<string>("Today");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MOBILE_MONEY");

  // Submission & Confirmed Order
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      const [prodRes, addrRes, profRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/customer/addresses"),
        fetch("/api/customer/profile"),
      ]);

      const prodData = await prodRes.json();
      if (prodData.success && prodData.products) {
        setProducts(prodData.products);
      }

      const addrData = await addrRes.json();
      if (addrData.success && addrData.addresses) {
        setAddresses(addrData.addresses);
        const def = addrData.addresses.find((a: StoredAddress) => a.isDefault);
        if (def) setSelectedAddressId(def.id);
        else if (addrData.addresses.length > 0) setSelectedAddressId(addrData.addresses[0].id);
      }

      const profData = await profRes.json();
      if (profData.success && profData.customer) {
        setProfile(profData.customer);
      }
    } catch (err) {
      console.error("Failed to load ordering data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Adjust quantity
  const handleQuantityChange = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  // Pricing calculations
  const totalItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const refillBottlesCount = cart["prod_001"] || 0;

  const subtotal = Object.entries(cart).reduce((sum, [pId, qty]) => {
    const prod = products.find((p) => p.id === pId);
    return sum + (prod ? prod.price * qty : 0);
  }, 0);

  const depositFee = !hasEmptyBottleExchange && refillBottlesCount > 0
    ? refillBottlesCount * 80.0
    : 0.0;

  const deliveryFee = subtotal >= 100 || refillBottlesCount >= 3 || totalItemsCount === 0 ? 0.0 : 10.0;
  const totalAmount = Math.max(0, subtotal + depositFee + deliveryFee);

  // Place Order
  const handlePlaceOrder = async () => {
    if (totalItemsCount === 0) {
      setErrorMessage("Please select at least one bottle to order.");
      return;
    }

    if (!selectedAddressId && addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
    }

    setErrorMessage(null);
    setIsSubmitting(true);
    setSubmittingStatus("Creating your order...");

    try {
      const orderItems = Object.entries(cart).map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: orderItems,
          deliveryAddressId: selectedAddressId || (addresses[0]?.id ?? ""),
          deliverySlot,
          deliveryDate: deliveryDate === "Today" ? new Date().toISOString() : new Date(Date.now() + 86400000).toISOString(),
          deliveryInstructions,
          hasEmptyBottleExchange,
          redeemFreeRefill: false,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to place order.");
        setIsSubmitting(false);
        return;
      }

      // If Cash on Delivery: show instant confirmation
      if (paymentMethod === "CASH_ON_DELIVERY" || totalAmount === 0) {
        setConfirmedOrder(data.order);
        setIsSubmitting(false);
        return;
      }

      // Online Payment: Initialize gateway
      setSubmittingStatus("Redirecting to secure payment...");
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const initRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          type: "WATER_ORDER",
          orderId: data.order.id,
          orderNumber: data.order.orderNumber,
          callbackUrl: `${origin}/customer/payment-callback`,
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok || !initData.success || !initData.authorizationUrl) {
        setErrorMessage(
          initData.error || "Could not connect to payment provider. Please try again."
        );
        setIsSubmitting(false);
        return;
      }

      // Redirect to secure payment gateway
      window.location.href = initData.authorizationUrl;
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  return (
    <AppLayout role="CUSTOMER">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="pb-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Order Water Delivery
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Select your refill bottles and schedule delivery to your door.
            </p>
          </div>
          <Link
            href="/customer/orders"
            className="text-xs font-semibold text-brand-600 dark:text-blue-light-400 hover:underline"
          >
            Past Orders
          </Link>
        </div>

        {/* FEEDBACK ALERT */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300">
            {errorMessage}
          </div>
        )}

        {/* CONFIRMATION VIEW (When Cash on Delivery order is placed) */}
        {confirmedOrder ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-10 border border-gray-200 dark:border-gray-800 shadow-sm text-center max-w-lg mx-auto space-y-5">
            <div className="size-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <svg className="size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
                Order Confirmed
              </span>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                {confirmedOrder.orderNumber}
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Scheduled for {confirmedOrder.deliverySlot}.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Address:</span>
                <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]">
                  {confirmedOrder.deliveryAddressText || selectedAddress?.areaName || "Saved Address"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Cash on Delivery (GH₵ {confirmedOrder.totalAmount?.toFixed(2) || totalAmount.toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bottle Exchange:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {hasEmptyBottleExchange ? "Returning empties (No deposit fee)" : "Deposit included"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/customer/orders"
                className="w-full py-3 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition shadow-sm text-center"
              >
                Track My Delivery
              </Link>
              <button
                type="button"
                onClick={() => {
                  setConfirmedOrder(null);
                  setCart({ prod_001: 2 });
                }}
                className="w-full py-3 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition text-center"
              >
                Order More
              </button>
            </div>
          </div>
        ) : (
          /* ONE-PAGE CHECKOUT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Products, Address, Payment */}
            <div className="lg:col-span-7 space-y-5">
              {/* 1. Products Selection */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-theme-xs space-y-4">
                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block">
                  1. Select Bottles
                </span>

                {loading ? (
                  <div className="py-8 text-center text-xs text-gray-400">Loading products...</div>
                ) : (
                  <div className="space-y-3">
                    {products.slice(0, 2).map((prod) => {
                      const qty = cart[prod.id] || 0;
                      const is19L = prod.type === "REFILLABLE_BOTTLE";

                      return (
                        <div
                          key={prod.id}
                          className={`p-3.5 rounded-2xl border transition ${
                            qty > 0
                              ? "border-brand-500 bg-brand-50/15 dark:bg-brand-950/20"
                              : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            {prod.image && (
                              <div className="relative size-16 rounded-xl overflow-hidden bg-sky-50 dark:bg-gray-800 shrink-0 border border-gray-100 dark:border-gray-800">
                                <Image
                                  src={prod.image}
                                  alt={prod.name}
                                  fill
                                  sizes="64px"
                                  className="object-contain p-1"
                                />
                              </div>
                            )}

                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                {prod.name}
                              </h3>
                              <div className="text-xs font-bold text-brand-600 dark:text-blue-light-400 mt-0.5">
                                GH₵ {prod.price.toFixed(2)}{" "}
                                <span className="text-[11px] font-normal text-gray-400">/ {prod.unit}</span>
                              </div>
                            </div>

                            {/* Quantity Buttons */}
                            <div className="flex items-center gap-2 shrink-0 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(prod.id, -1)}
                                disabled={qty === 0}
                                aria-label={`Decrease ${prod.name}`}
                                className="size-7 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white font-bold flex items-center justify-center disabled:opacity-40 transition shadow-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                              >
                                <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
                                </svg>
                              </button>
                              <span className="w-5 text-center text-xs font-bold text-gray-900 dark:text-white">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(prod.id, 1)}
                                aria-label={`Increase ${prod.name}`}
                                className="size-7 rounded-lg bg-brand-500 text-white font-bold flex items-center justify-center hover:bg-brand-600 transition shadow-xs cursor-pointer"
                              >
                                <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Empty Bottle Return Checkbox for 19L */}
                          {is19L && qty > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800">
                              <label className="flex items-center gap-2 cursor-pointer text-xs">
                                <input
                                  type="checkbox"
                                  checked={hasEmptyBottleExchange}
                                  onChange={(e) => setHasEmptyBottleExchange(e.target.checked)}
                                  className="size-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                                />
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                  Returning empty bottles on delivery (No deposit fee)
                                </span>
                              </label>
                              {!hasEmptyBottleExchange && (
                                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 pl-6">
                                  +GH₵ {(qty * 80).toFixed(2)} container deposit will be added.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Delivery Address & Time */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-theme-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block">
                    2. Delivery Location &amp; Time
                  </span>
                  <Link
                    href="/customer/addresses"
                    className="text-xs text-brand-600 dark:text-blue-light-400 font-medium hover:underline"
                  >
                    Manage Addresses
                  </Link>
                </div>

                {/* Address Selector */}
                {addresses.length === 0 ? (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                    <span>No saved delivery address found.</span>
                    <Link
                      href="/customer/addresses"
                      className="font-bold underline ml-2"
                    >
                      Add Address
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      aria-label="Select Delivery Address"
                      className="w-full h-10 px-3 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                    >
                      {addresses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.areaName} ({a.digitalAddress}) {a.isDefault ? "• Default" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Delivery Slot Pills */}
                <div>
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 block mb-1.5">
                    Preferred Time Slot
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        "Morning (8am - 12pm)",
                        "Afternoon (12pm - 4pm)",
                        "Evening (4pm - 7pm)",
                      ] as const
                    ).map((slot) => {
                      const isSelected = deliverySlot === slot;
                      const shortLabel = slot.split(" ")[0];
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setDeliverySlot(slot)}
                          className={`py-2 px-2 text-center rounded-xl text-xs font-semibold border transition cursor-pointer ${
                            isSelected
                              ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-blue-light-400"
                              : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                          }`}
                        >
                          {shortLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Notes */}
                <div>
                  <input
                    type="text"
                    placeholder="Delivery instructions (e.g. Call at gate, leave with reception)"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    className="w-full h-9.5 px-3 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:border-brand-500"
                  />
                </div>
              </div>

              {/* 3. Payment Method */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-theme-xs space-y-3">
                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block">
                  3. Payment Method
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option A: Pay Online */}
                  <div
                    onClick={() => setPaymentMethod("MOBILE_MONEY")}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 ${
                      paymentMethod !== "CASH_ON_DELIVERY"
                        ? "border-brand-500 bg-brand-50/20 dark:bg-brand-950/20"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 bg-white dark:bg-gray-900"
                    }`}
                  >
                    <div
                      className={`mt-0.5 size-4 rounded-full border flex items-center justify-center shrink-0 ${
                        paymentMethod !== "CASH_ON_DELIVERY"
                          ? "border-brand-500 bg-brand-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {paymentMethod !== "CASH_ON_DELIVERY" && (
                        <div className="size-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        Pay Online
                      </span>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Mobile Money (MTN, Telecel, AT) or Card
                      </p>
                    </div>
                  </div>

                  {/* Option B: Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                    className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 ${
                      paymentMethod === "CASH_ON_DELIVERY"
                        ? "border-brand-500 bg-brand-50/20 dark:bg-brand-950/20"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-300 bg-white dark:bg-gray-900"
                    }`}
                  >
                    <div
                      className={`mt-0.5 size-4 rounded-full border flex items-center justify-center shrink-0 ${
                        paymentMethod === "CASH_ON_DELIVERY"
                          ? "border-brand-500 bg-brand-500"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {paymentMethod === "CASH_ON_DELIVERY" && (
                        <div className="size-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">
                        Cash on Delivery
                      </span>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Pay cash directly to driver at doorstep
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary */}
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-theme-xs space-y-4">
                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block">
                  Order Summary
                </span>

                <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {Object.entries(cart).map(([pId, qty]) => {
                    const prod = products.find((p) => p.id === pId);
                    if (!prod) return null;
                    return (
                      <div key={pId} className="py-2.5 flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">
                          {prod.name} × {qty}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          GH₵ {(prod.price * qty).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}

                  {depositFee > 0 && (
                    <div className="py-2.5 flex items-center justify-between text-amber-600 dark:text-amber-400">
                      <span>Bottle Deposit ({refillBottlesCount} bottles)</span>
                      <span className="font-semibold">+GH₵ {depositFee.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Delivery Fee</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">FREE</span>
                      ) : (
                        `GH₵ ${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-xl font-black text-brand-600 dark:text-blue-light-400">
                      GH₵ {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Primary Order Action Button */}
                <button
                  type="button"
                  disabled={isSubmitting || totalItemsCount === 0}
                  onClick={handlePlaceOrder}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>{submittingStatus || "Processing..."}</span>
                  ) : paymentMethod !== "CASH_ON_DELIVERY" ? (
                    <span>Proceed to Online Payment • GH₵ {totalAmount.toFixed(2)}</span>
                  ) : (
                    <span>Confirm Order • GH₵ {totalAmount.toFixed(2)}</span>
                  )}
                </button>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-center">
                  <span className="text-[11px] text-gray-400">
                    Sealed hygienic bottles • Fast doorstep delivery
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
