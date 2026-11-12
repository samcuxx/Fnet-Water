"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { SkeletonCard } from "@/components/ui/skeleton";
import type { StoredProduct } from "@/lib/product-store";
import type { StoredAddress, StoredCustomerProfile, AddressCategory } from "@/lib/customer-store";
import type { PaymentMethod } from "@/lib/order-store";

interface CartState {
  [productId: string]: number;
}

function OrderWaterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderType = searchParams.get("type"); // "refill" | "non-refill"

  // Data
  const [products, setProducts] = useState<StoredProduct[]>([]);
  const [addresses, setAddresses] = useState<StoredAddress[]>([]);
  const [profile, setProfile] = useState<StoredCustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Cart & Order Options
  // Default based on query param: non-refill selects prod_005, refill selects prod_001
  const [cart, setCart] = useState<CartState>(
    orderType === "non-refill" ? { prod_005: 1 } : { prod_001: 2 }
  );
  const [hasEmptyBottleExchange, setHasEmptyBottleExchange] = useState(true);
  const [redeemFreeBottle, setRedeemFreeBottle] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [deliverySlot, setDeliverySlot] = useState<
    "Morning (8am - 12pm)" | "Afternoon (12pm - 4pm)" | "Evening (4pm - 7pm)"
  >("Morning (8am - 12pm)");
  const [deliveryDate, setDeliveryDate] = useState<string>("Today");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MOBILE_MONEY");

  // Inline Add Delivery Address Modal state
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [addressInputMode, setAddressInputMode] = useState<"gps" | "digital">("gps");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationDetectedText, setLocationDetectedText] = useState<string | null>(null);
  const [newAddressCategory, setNewAddressCategory] = useState<AddressCategory>("HOME");
  const [newAreaName, setNewAreaName] = useState("");
  const [newDigitalAddress, setNewDigitalAddress] = useState("");
  const [newDeliveryInstructions, setNewDeliveryInstructions] = useState("");
  const [newAddressError, setNewAddressError] = useState<string | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Submission & Confirmed Order
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  // Sync initial cart if orderType query param changes
  useEffect(() => {
    if (orderType === "non-refill") {
      setCart({ prod_005: 1 });
    } else if (orderType === "refill") {
      setCart({ prod_001: 2 });
    }
  }, [orderType]);

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
  const nonRefillBottlesCount = cart["prod_005"] || 0;

  const subtotal = Object.entries(cart).reduce((sum, [pId, qty]) => {
    const prod = products.find((p) => p.id === pId);
    return sum + (prod ? prod.price * qty : 0);
  }, 0);

  // Deposit fee only applies to refill bottles if customer is not returning an empty bottle
  const depositFee =
    !hasEmptyBottleExchange && refillBottlesCount > 0 ? refillBottlesCount * 80.0 : 0.0;

  const deliveryFee =
    subtotal >= 100 || refillBottlesCount + nonRefillBottlesCount >= 3 || totalItemsCount === 0
      ? 0.0
      : 10.0;
  const discountAmount =
    redeemFreeBottle && (profile?.freeBottleBalance ?? 0) > 0 && refillBottlesCount > 0 ? 25.0 : 0.0;
  const totalAmount = Math.max(0, subtotal + depositFee + deliveryFee - discountAmount);

  // Live GPS Detector for inline modal
  const handleDetectGPS = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setNewAddressError("Geolocation is not supported by your browser. Please type your digital address.");
      return;
    }

    setIsDetectingLocation(true);
    setNewAddressError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const latPart = Math.abs(Math.round(latitude * 100));
        const lngPart = Math.abs(Math.round(longitude * 1000)).toString().padStart(4, "0").slice(-4);
        const generatedCode = `GA-${latPart}-${lngPart}`;

        let detectedArea = "Current Live Location, Accra";
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3500);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            const a = data.address || {};
            const road = a.road || a.suburb || a.neighbourhood || a.quarter;
            const city = a.city || a.town || a.county || "Accra";
            if (road) {
              detectedArea = `${road}, ${city}`;
            }
          }
        } catch {
          detectedArea = `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)}), Accra`;
        }

        setNewDigitalAddress(generatedCode);
        if (!newAreaName) setNewAreaName(detectedArea);
        setLocationDetectedText(`Captured: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);
        setIsDetectingLocation(false);
      },
      (err) => {
        console.warn("Geolocation lookup error:", err);
        setNewAddressError("Could not retrieve current location. Please allow location permissions or type your digital address.");
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 9000 }
    );
  };

  // Save new address from modal
  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewAddressError(null);
    setIsSavingAddress(true);

    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newAddressCategory,
          areaName: newAreaName,
          digitalAddress: newDigitalAddress,
          deliveryInstructions: newDeliveryInstructions,
          isDefault: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setNewAddressError(data.message || "Failed to save location.");
        setIsSavingAddress(false);
        return;
      }

      const saved: StoredAddress = data.address;
      setAddresses((prev) => [saved, ...prev]);
      setSelectedAddressId(saved.id);
      setIsAddAddressModalOpen(false);
      setNewAreaName("");
      setNewDigitalAddress("");
      setNewDeliveryInstructions("");
      setLocationDetectedText(null);
    } catch {
      setNewAddressError("Network error occurred.");
    } finally {
      setIsSavingAddress(false);
    }
  };

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
          deliveryDate:
            deliveryDate === "Today"
              ? new Date().toISOString()
              : new Date(Date.now() + 86400000).toISOString(),
          deliveryInstructions,
          hasEmptyBottleExchange,
          redeemFreeRefill: redeemFreeBottle,
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

  // List of primary bottle products to feature in checkout
  const featuredProducts = products.filter(
    (p) => p.id === "prod_001" || p.id === "prod_005" || p.id === "prod_002"
  );
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 3);

  return (
    <AppLayout role="CUSTOMER">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Order Water Delivery
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Select your refill or non-refill bottles and schedule fast delivery to your door.
            </p>
          </div>
          <Link
            href="/customer/orders"
            className="text-xs font-bold text-brand-600 dark:text-sky-400 hover:underline"
          >
            Past Orders →
          </Link>
        </div>

        {/* FEEDBACK ALERT */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-medium text-rose-700 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* CONFIRMATION VIEW (When Cash on Delivery order is placed) */}
        {confirmedOrder ? (
          <div className="bg-white dark:bg-gray-900/70 rounded-[28px] p-6 sm:p-10 border border-gray-100 dark:border-gray-800/80 shadow-xs text-center max-w-lg mx-auto space-y-5">
            <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
              <svg className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-left text-xs space-y-2.5">
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
                  {refillBottlesCount > 0
                    ? hasEmptyBottleExchange
                      ? "Returning empties (No deposit fee)"
                      : "Deposit included"
                    : "Non-Refill (Single-use, no return needed)"}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link
                href="/customer/orders"
                className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition shadow-xs text-center"
              >
                Track My Delivery
              </Link>
              <button
                type="button"
                onClick={() => {
                  setConfirmedOrder(null);
                  setCart({ prod_001: 2 });
                }}
                className="w-full py-3 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition text-center cursor-pointer"
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
              <div className="bg-white dark:bg-gray-900/70 p-5 sm:p-6 rounded-[28px] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider block">
                    1. Select Bottles
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Refill &amp; Non-Refill available
                  </span>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    <SkeletonCard lines={2} />
                    <SkeletonCard lines={2} />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayProducts.map((prod) => {
                      const qty = cart[prod.id] || 0;
                      const isRefill = prod.id === "prod_001" || prod.type === "REFILLABLE_BOTTLE";
                      const isNonRefill = prod.id === "prod_005";

                      return (
                        <div
                          key={prod.id}
                          className={`p-4 rounded-2xl border transition ${
                            qty > 0
                              ? "border-brand-500/80 bg-brand-50/20 dark:bg-brand-950/20 shadow-xs"
                              : "border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/20"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            {prod.image && (
                              <div className="relative size-16 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shrink-0 border border-gray-100 dark:border-gray-800 shadow-2xs">
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
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                  {prod.name}
                                </h3>
                                {isRefill && (
                                  <Badge color="primary" size="sm">
                                    Refill
                                  </Badge>
                                )}
                                {isNonRefill && (
                                  <Badge color="info" size="sm">
                                    Non-Refill
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                                {isRefill
                                  ? "Reusable bottle returned or swapped for refill."
                                  : isNonRefill
                                  ? "Single-use bottle. Keep it without returning empties."
                                  : prod.description}
                              </p>
                              <div className="text-xs font-bold text-brand-600 dark:text-sky-400 mt-1">
                                GH₵ {prod.price.toFixed(2)}{" "}
                                <span className="text-[11px] font-normal text-gray-400">/ {prod.unit}</span>
                              </div>
                            </div>

                            {/* Quantity Buttons */}
                            <div className="flex items-center gap-2 shrink-0 bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
                              <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                type="button"
                                onClick={() => handleQuantityChange(prod.id, -1)}
                                disabled={qty === 0}
                                aria-label={`Decrease ${prod.name}`}
                                className="size-7 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white font-bold flex items-center justify-center disabled:opacity-40 transition cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                              >
                                <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
                                </svg>
                              </motion.button>
                              <span className="w-5 text-center text-xs font-bold text-gray-900 dark:text-white">
                                {qty}
                              </span>
                              <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                type="button"
                                onClick={() => handleQuantityChange(prod.id, 1)}
                                aria-label={`Increase ${prod.name}`}
                                className="size-7 rounded-xl bg-brand-500 text-white font-bold flex items-center justify-center hover:bg-brand-600 transition shadow-xs cursor-pointer"
                              >
                                <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                </svg>
                              </motion.button>
                            </div>
                          </div>

                          {/* Empty Bottle Return Checkbox for Refill Bottles */}
                          {isRefill && qty > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800">
                              <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                                <input
                                  type="checkbox"
                                  checked={hasEmptyBottleExchange}
                                  onChange={(e) => setHasEmptyBottleExchange(e.target.checked)}
                                  className="size-4 rounded-md border-gray-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                                />
                                <span className="text-gray-700 dark:text-gray-300 font-semibold">
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

                          {/* Non-Refill Note */}
                          {isNonRefill && qty > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 text-[11px] text-brand-700 dark:text-sky-300 flex items-center gap-1.5">
                              <svg className="size-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span>Single-use bottle included with water. No empty bottle return required.</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 2. Delivery Address & Time */}
              <div className="bg-white dark:bg-gray-900/70 p-5 sm:p-6 rounded-[28px] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider block">
                    2. Delivery Location &amp; Time
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddAddressModalOpen(true)}
                      className="text-xs text-brand-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                    >
                      + Add Location
                    </button>
                    <Link
                      href="/customer/addresses"
                      className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium"
                    >
                      Manage
                    </Link>
                  </div>
                </div>

                {/* Address Selector */}
                {addresses.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">No delivery address saved.</span>
                      <span className="text-[11px] text-amber-700 dark:text-amber-400">
                        Use current location or type your digital address.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddAddressModalOpen(true)}
                      className="px-3 py-1.5 bg-brand-500 text-white rounded-xl font-bold cursor-pointer hover:bg-brand-600 transition"
                    >
                      Add Location
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <select
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      aria-label="Select Delivery Address"
                      className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 shadow-2xs"
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
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 block mb-2">
                    Preferred Time Slot
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
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
                          className={`py-2.5 px-2 text-center rounded-2xl text-xs font-bold border transition cursor-pointer ${
                            isSelected
                              ? "border-brand-500 bg-brand-500 text-white shadow-xs"
                              : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-gray-50/60 dark:bg-gray-800/40 hover:border-gray-300"
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
                    placeholder="Delivery instructions (e.g. Call 0244950505 upon arrival, leave with security reception)"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    className="w-full h-11 px-3.5 text-xs rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:border-brand-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* 3. Payment Method */}
              <div className="bg-white dark:bg-gray-900/70 p-5 sm:p-6 rounded-[28px] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-3.5">
                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider block">
                  3. Payment Method
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option A: Pay Online */}
                  <div
                    onClick={() => setPaymentMethod("MOBILE_MONEY")}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3.5 ${
                      paymentMethod !== "CASH_ON_DELIVERY"
                        ? "border-brand-500 bg-brand-50/25 dark:bg-brand-950/25 shadow-xs"
                        : "border-gray-100 dark:border-gray-800/80 hover:border-gray-300 bg-white dark:bg-gray-900"
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
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3.5 ${
                      paymentMethod === "CASH_ON_DELIVERY"
                        ? "border-brand-500 bg-brand-50/25 dark:bg-brand-950/25 shadow-xs"
                        : "border-gray-100 dark:border-gray-800/80 hover:border-gray-300 bg-white dark:bg-gray-900"
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
            <div className="lg:col-span-5 lg:sticky lg:top-8">
              <div className="bg-white dark:bg-gray-900/70 p-5 sm:p-6 rounded-[28px] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-4">
                <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider block">
                  Order Summary
                </span>

                {/* Free Bottle Credit Reward Option */}
                {(profile?.freeBottleBalance ?? 0) > 0 && refillBottlesCount > 0 && (
                  <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={redeemFreeBottle}
                        onChange={(e) => setRedeemFreeBottle(e.target.checked)}
                        className="size-4 rounded-md border-emerald-400 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="font-bold text-emerald-900 dark:text-emerald-200">
                        Use 1 Free Bottle Reward (-GH₵ 25.00)
                      </span>
                    </label>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300 pl-6.5 block">
                      You have {profile?.freeBottleBalance} free bottle reward credit available!
                    </span>
                  </div>
                )}

                <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {Object.entries(cart).map(([pId, qty]) => {
                    const prod = products.find((p) => p.id === pId);
                    if (!prod) return null;
                    return (
                      <div key={pId} className="py-2.5 flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">
                          {prod.name} × {qty}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          GH₵ {(prod.price * qty).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}

                  {depositFee > 0 && (
                    <div className="py-2.5 flex items-center justify-between text-amber-600 dark:text-amber-400">
                      <span>Bottle Deposit ({refillBottlesCount} bottles)</span>
                      <span className="font-bold">+GH₵ {depositFee.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Delivery Fee</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">FREE</span>
                      ) : (
                        `GH₵ ${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="py-2.5 flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Free Bottle Reward (1 Refill)</span>
                      <span>-GH₵ {discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="pt-3.5 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-2xl font-black text-brand-600 dark:text-sky-400">
                      GH₵ {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Primary Order Action Button */}
                <button
                  type="button"
                  disabled={isSubmitting || totalItemsCount === 0}
                  onClick={handlePlaceOrder}
                  className="w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
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

        {/* MODAL: Inline Add Delivery Address (Dual Choice: Live GPS Location vs Type Digital Address) */}
        <Modal
          isOpen={isAddAddressModalOpen}
          onClose={() => setIsAddAddressModalOpen(false)}
          title="Add Delivery Location"
        >
          {newAddressError && (
            <div className="mb-4 p-3 rounded-lg text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400">
              {newAddressError}
            </div>
          )}

          <form onSubmit={handleSaveNewAddress} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                How would you like to set your delivery location?
              </label>
              <div className="p-1 rounded-2xl bg-gray-100 dark:bg-gray-800/80 flex items-center gap-1 border border-gray-200/80 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setAddressInputMode("gps");
                    handleDetectGPS();
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    addressInputMode === "gps"
                      ? "bg-white dark:bg-gray-900 text-brand-600 dark:text-sky-400 shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <svg className="size-3.5 text-brand-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                  </svg>
                  <span>Use Current Location</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAddressInputMode("digital")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    addressInputMode === "digital"
                      ? "bg-white dark:bg-gray-900 text-brand-600 dark:text-sky-400 shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <svg className="size-3.5 text-sky-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.581.814L10 14.197l-4.419 2.617A1 1 0 014 16V4zm2 2v8.528l3.419-2.025a1 1 0 011.162 0L14 14.528V6H6z" clipRule="evenodd" />
                  </svg>
                  <span>Type Digital Address</span>
                </button>
              </div>
            </div>

            {/* GPS Detection Box */}
            {addressInputMode === "gps" && (
              <div className="p-3.5 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/80 dark:border-brand-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-800 dark:text-sky-300">
                    Live GPS Geolocation
                  </span>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    disabled={isDetectingLocation}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 px-3 py-1.5 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isDetectingLocation ? (
                      <>
                        <span className="inline-block size-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Locating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
                        </svg>
                        <span>Detect Location</span>
                      </>
                    )}
                  </button>
                </div>

                {locationDetectedText ? (
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <svg className="size-4 shrink-0 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{locationDetectedText}</span>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                    Tap &ldquo;Detect Location&rdquo; to use your device GPS for instant delivery to where you are.
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location Type
                </label>
                <select
                  value={newAddressCategory}
                  onChange={(e) => setNewAddressCategory(e.target.value as AddressCategory)}
                  className="w-full h-10 px-3 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
                >
                  <option value="HOME">Residential Home</option>
                  <option value="OFFICE">Corporate Office</option>
                  <option value="SHOP">Commercial Shop / Store</option>
                  <option value="WAREHOUSE">Warehouse / Facility</option>
                  <option value="SCHOOL">School / Institution</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ghana Digital Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GA-492-1029"
                  value={newDigitalAddress}
                  onChange={(e) => setNewDigitalAddress(e.target.value)}
                  className="w-full h-10 px-3 text-xs sm:text-sm font-mono rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Street Name &amp; Area Landmark
              </label>
              <input
                type="text"
                required
                placeholder="e.g. House 14, Boundary Road"
                value={newAreaName}
                onChange={(e) => setNewAreaName(e.target.value)}
                className="w-full h-10 px-3 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Drop-Off &amp; Driver Instructions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Call 0244950505 upon arrival, leave with security reception."
                value={newDeliveryInstructions}
                onChange={(e) => setNewDeliveryInstructions(e.target.value)}
                className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsAddAddressModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingAddress}
                className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSavingAddress ? "Saving..." : "Save Location"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default function OrderWaterPage() {
  return (
    <Suspense
      fallback={
        <AppLayout role="CUSTOMER">
          <div className="max-w-4xl mx-auto py-12 flex justify-center">
            <div className="size-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          </div>
        </AppLayout>
      }
    >
      <OrderWaterInner />
    </Suspense>
  );
}
