"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Card } from "@/components/tailgrids/core/card";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { SkeletonCard, SkeletonAppShell } from "@/components/ui/skeleton";
import type { StoredProduct } from "@/lib/product-store";
import type { StoredAddress, StoredCustomerProfile } from "@/lib/customer-store";
import type { PaymentMethod } from "@/lib/order-store";
import { cn } from "@/utils/cn";
import { Check, Minus, Plus, Droplet, ArrowRight, ShieldCheck, Package } from "lucide-react";

interface CartState {
  [productId: string]: number;
}

type ProductFilterTab = "ALL" | "REFILL" | "NON_REFILL";

function OrderWaterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");

  // Data
  const [products, setProducts] = useState<StoredProduct[]>([]);
  const [addresses, setAddresses] = useState<StoredAddress[]>([]);
  const [profile, setProfile] = useState<StoredCustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter tab: defaults to query parameter
  const [activeTab, setActiveTab] = useState<ProductFilterTab>(
    typeParam === "non-refill" ? "NON_REFILL" : typeParam === "refill" ? "REFILL" : "ALL"
  );

  // Cart & Order Options
  const [cart, setCart] = useState<CartState>(() => {
    const initial: CartState = {};
    if (typeParam === "non-refill") {
      initial["prod_001_non_refill"] = 1;
    } else {
      initial["prod_001"] = 2;
    }
    return initial;
  });

  const [hasEmptyBottleExchange, setHasEmptyBottleExchange] = useState(true);
  const [redeemFreeBottle, setRedeemFreeBottle] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [deliverySlot, setDeliverySlot] = useState<
    "Morning (8am - 12pm)" | "Afternoon (12pm - 4pm)" | "Evening (4pm - 7pm)"
  >("Morning (8am - 12pm)");
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

  // If query parameter changes, sync tab
  useEffect(() => {
    if (typeParam === "non-refill") {
      setActiveTab("NON_REFILL");
    } else if (typeParam === "refill") {
      setActiveTab("REFILL");
    }
  }, [typeParam]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    if (activeTab === "REFILL") {
      return products.filter((p) => p.type === "REFILLABLE_BOTTLE");
    }
    if (activeTab === "NON_REFILL") {
      return products.filter((p) => p.type !== "REFILLABLE_BOTTLE");
    }
    return products;
  }, [products, activeTab]);

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

  const refillBottlesCount = Object.entries(cart).reduce((sum, [pId, qty]) => {
    const prod = products.find((p) => p.id === pId);
    return prod?.type === "REFILLABLE_BOTTLE" ? sum + qty : sum;
  }, 0);

  const subtotal = Object.entries(cart).reduce((sum, [pId, qty]) => {
    const prod = products.find((p) => p.id === pId);
    return sum + (prod ? prod.price * qty : 0);
  }, 0);

  const depositFee =
    !hasEmptyBottleExchange && refillBottlesCount > 0
      ? refillBottlesCount * 80.0
      : 0.0;

  const deliveryFee =
    subtotal >= 100 || refillBottlesCount >= 3 || totalItemsCount === 0 ? 0.0 : 10.0;

  const discountAmount =
    redeemFreeBottle && (profile?.freeBottleBalance ?? 0) > 0 && refillBottlesCount > 0
      ? 25.0
      : 0.0;

  const totalAmount = Math.max(0, subtotal + depositFee + deliveryFee - discountAmount);

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

      // Cash on delivery: show confirmation
      if (paymentMethod === "CASH_ON_DELIVERY" || totalAmount === 0) {
        setConfirmedOrder(data.order);
        setIsSubmitting(false);
        return;
      }

      // Online payment initialization
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
          initData.error || "Could not connect to payment gateway. Please retry."
        );
        setIsSubmitting(false);
        return;
      }

      window.location.href = initData.authorizationUrl;
    } catch {
      setErrorMessage("Network connection error. Please try again.");
      setIsSubmitting(false);
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  return (
    <AppLayout role="CUSTOMER">
      <div className="space-y-6">
        {/* Breadcrumbs & Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Order Water Delivery
            </h1>
            <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
              Select your Refill or Non-Refill bottles and schedule fast delivery to your door in Ghana.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: "/customer" },
                { label: "Order Water" },
              ]}
            />
          </div>
        </div>

        {/* FEEDBACK ALERT */}
        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* CONFIRMATION VIEW */}
        {confirmedOrder ? (
          <Card className="mx-auto max-w-lg p-6 sm:p-8 text-center space-y-5">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Check className="size-8" />
            </div>

            <div>
              <Badge color="success" size="sm">
                Order Confirmed
              </Badge>
              <h2 className="mt-2 text-2xl font-bold text-text-primary">
                {confirmedOrder.orderNumber}
              </h2>
              <p className="mt-1 text-xs text-text-tertiary">
                Scheduled delivery for {confirmedOrder.deliverySlot}.
              </p>
            </div>

            <div className="rounded-xl bg-background-gray-secondary p-4 text-left text-xs space-y-2.5 border border-card-border">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Delivery Address:</span>
                <span className="font-semibold text-text-primary truncate max-w-[200px]">
                  {confirmedOrder.deliveryAddressText || selectedAddress?.areaName || "Saved Address"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Payment:</span>
                <span className="font-semibold text-text-primary font-mono">
                  Cash on Delivery (GH₵ {confirmedOrder.totalAmount?.toFixed(2) || totalAmount.toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Bottle Option:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {refillBottlesCount > 0
                    ? hasEmptyBottleExchange
                      ? "Refill: Returning empties (No deposit fee)"
                      : "Refill: Deposit included"
                    : "Non-Refill (Single use)"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2 sm:flex-row">
              <Button asChild className="w-full">
                <Link href="/customer/orders">Track My Delivery</Link>
              </Button>
              <Button
                appearance="outline"
                className="w-full"
                onClick={() => {
                  setConfirmedOrder(null);
                  setCart({ prod_001: 2 });
                }}
              >
                Order More
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* LEFT COLUMN: Products, Address, Payment */}
            <div className="space-y-6 lg:col-span-7">
              {/* 1. Products Selection */}
              <Card className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-card-border pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                      1. Select Bottles &amp; Products
                    </h3>
                    <p className="text-[11px] text-text-tertiary mt-0.5">
                      Choose between reusable Refill bottles and single-use Non-Refill products.
                    </p>
                  </div>

                  {/* Refill vs Non-Refill Tabs */}
                  <div className="flex items-center gap-1 rounded-lg border border-card-border p-1 bg-background-gray-secondary/50 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab("ALL")}
                      className={cn(
                        "px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer",
                        activeTab === "ALL"
                          ? "bg-primary text-white shadow-xs"
                          : "text-text-tertiary hover:text-text-primary"
                      )}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("REFILL")}
                      className={cn(
                        "px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1",
                        activeTab === "REFILL"
                          ? "bg-primary text-white shadow-xs"
                          : "text-text-tertiary hover:text-text-primary"
                      )}
                    >
                      <Droplet className="size-3" />
                      <span>Refill</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("NON_REFILL")}
                      className={cn(
                        "px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer flex items-center gap-1",
                        activeTab === "NON_REFILL"
                          ? "bg-primary text-white shadow-xs"
                          : "text-text-tertiary hover:text-text-primary"
                      )}
                    >
                      <Package className="size-3" />
                      <span>Non-Refill</span>
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    <SkeletonCard lines={2} />
                    <SkeletonCard lines={2} />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((prod) => {
                      const qty = cart[prod.id] || 0;
                      const isRefill = prod.type === "REFILLABLE_BOTTLE";

                      return (
                        <div
                          key={prod.id}
                          className={`rounded-xl border p-4 transition ${
                            qty > 0
                              ? "border-primary/50 bg-blue-light-50/20 dark:bg-blue-light-950/20"
                              : "border-card-border bg-card-background"
                          }`}
                        >
                          <div className="flex items-start gap-3.5 sm:gap-4">
                            {prod.image && (
                              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-card-border bg-white dark:bg-card-background">
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
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-text-primary">
                                  {prod.name}
                                </h4>
                                <Badge
                                  color={isRefill ? "primary" : "sky"}
                                  size="sm"
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {isRefill ? "Refill" : "Non-Refill"}
                                </Badge>
                              </div>

                              <p className="mt-1 text-xs text-text-tertiary leading-relaxed">
                                {isRefill
                                  ? "A reusable bottle that customers return or bring back to be refilled."
                                  : prod.description ||
                                    "A new bottle sold as a single-use product. Customers do not return it for refilling."}
                              </p>

                              <div className="mt-1.5 text-xs font-bold text-primary font-mono">
                                GH₵ {prod.price.toFixed(2)}{" "}
                                <span className="font-normal text-text-tertiary">/ {prod.unit}</span>
                              </div>
                            </div>

                            {/* Quantity Buttons */}
                            <div className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-card-border bg-card-background p-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(prod.id, -1)}
                                disabled={qty === 0}
                                aria-label={`Decrease ${prod.name}`}
                                className="flex size-7 items-center justify-center rounded-md bg-background-gray-secondary text-text-primary font-bold disabled:opacity-40 hover:bg-background-gray-tertiary transition cursor-pointer"
                              >
                                <Minus className="size-3.5" />
                              </button>
                              <span className="w-5 text-center text-xs font-bold text-text-primary">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(prod.id, 1)}
                                aria-label={`Increase ${prod.name}`}
                                className="flex size-7 items-center justify-center rounded-md bg-primary text-white font-bold hover:bg-brand-600 transition cursor-pointer shadow-xs"
                              >
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Empty Bottle Return Checkbox for Refillable Bottles */}
                          {isRefill && qty > 0 && (
                            <div className="mt-3 border-t border-card-border pt-3">
                              <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                                <input
                                  type="checkbox"
                                  checked={hasEmptyBottleExchange}
                                  onChange={(e) => setHasEmptyBottleExchange(e.target.checked)}
                                  className="size-4 rounded border-card-border text-primary focus:ring-primary cursor-pointer"
                                />
                                <span className="text-text-primary font-medium">
                                  Returning empty bottles on delivery (No deposit fee)
                                </span>
                              </label>
                              {!hasEmptyBottleExchange && (
                                <p className="mt-1 pl-6 text-[11px] text-amber-600 dark:text-amber-400">
                                  +GH₵ {(qty * 80).toFixed(2)} refundable bottle deposit will be added.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* 2. Delivery Address & Time */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                    2. Delivery Location &amp; Time
                  </h3>
                  <Link
                    href="/customer/addresses"
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Manage Addresses
                  </Link>
                </div>

                {addresses.length === 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300 flex items-center justify-between">
                    <span>No saved delivery address found.</span>
                    <Link
                      href="/customer/addresses"
                      className="font-bold underline ml-2"
                    >
                      Add Address
                    </Link>
                  </div>
                ) : (
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-text-primary">
                      Delivery Address
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {addresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`cursor-pointer rounded-xl border p-3 transition ${
                              isSelected
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-card-border bg-card-background hover:border-border-secondary"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-text-primary truncate">
                                {addr.areaName}
                              </span>
                              {addr.isDefault && (
                                <Badge color="primary" size="sm" className="text-[10px]">
                                  Default
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1 font-mono text-[11px] text-text-tertiary">
                              {addr.digitalAddress}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Delivery Time & Slot */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-text-primary">
                      Delivery Day
                    </label>
                    <div className="flex gap-2">
                      {["Today", "Tomorrow"].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setDeliveryDate(day)}
                          className={`flex-1 rounded-lg border py-2 text-xs font-bold transition cursor-pointer ${
                            deliveryDate === day
                              ? "border-primary bg-primary text-white shadow-xs"
                              : "border-card-border bg-card-background text-text-secondary hover:bg-background-gray-secondary"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-text-primary">
                      Preferred Time Slot
                    </label>
                    <select
                      value={deliverySlot}
                      onChange={(e) => setDeliverySlot(e.target.value as any)}
                      className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
                    >
                      <option value="Morning (8am - 12pm)">Morning (8am - 12pm)</option>
                      <option value="Afternoon (12pm - 4pm)">Afternoon (12pm - 4pm)</option>
                      <option value="Evening (4pm - 7pm)">Evening (4pm - 7pm)</option>
                    </select>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-text-primary">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Leave at gate security, call 0244..."
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
                  />
                </div>
              </Card>

              {/* 3. Payment Method */}
              <Card className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  3. Payment Method
                </h3>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div
                    onClick={() => setPaymentMethod("MOBILE_MONEY")}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition ${
                      paymentMethod === "MOBILE_MONEY"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-card-border bg-card-background hover:border-border-secondary"
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-bold text-text-primary">
                        Mobile Money
                      </span>
                      <span className="text-[11px] text-text-tertiary">
                        MTN MoMo, Telecel Cash, AT Money
                      </span>
                    </div>
                    {paymentMethod === "MOBILE_MONEY" && <Check className="size-4 text-primary" />}
                  </div>

                  <div
                    onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-3.5 transition ${
                      paymentMethod === "CASH_ON_DELIVERY"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-card-border bg-card-background hover:border-border-secondary"
                    }`}
                  >
                    <div>
                      <span className="block text-xs font-bold text-text-primary">
                        Cash on Delivery
                      </span>
                      <span className="text-[11px] text-text-tertiary">
                        Pay driver when water arrives
                      </span>
                    </div>
                    {paymentMethod === "CASH_ON_DELIVERY" && <Check className="size-4 text-primary" />}
                  </div>
                </div>
              </Card>
            </div>

            {/* RIGHT COLUMN: Order Summary & Checkout */}
            <div className="space-y-6 lg:col-span-5">
              <Card className="p-6 space-y-5 sticky top-6">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                  Order Summary
                </h3>

                {/* Items breakdown */}
                <div className="space-y-2 border-b border-card-border pb-4 text-xs">
                  {Object.entries(cart).map(([pId, qty]) => {
                    const prod = products.find((p) => p.id === pId);
                    if (!prod || qty === 0) return null;
                    const isRefill = prod.type === "REFILLABLE_BOTTLE";

                    return (
                      <div key={pId} className="flex justify-between items-center">
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="font-semibold text-text-primary truncate block">
                            {qty}x {prod.name}
                          </span>
                          <span className="text-[10px] text-text-tertiary">
                            {isRefill ? "Refill bottle" : "Non-Refill product"}
                          </span>
                        </div>
                        <span className="font-bold text-text-primary font-mono shrink-0">
                          GH₵ {(prod.price * qty).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}

                  {totalItemsCount === 0 && (
                    <div className="py-2 text-center text-text-tertiary text-xs">
                      No bottles selected in cart.
                    </div>
                  )}
                </div>

                {/* Free bottle reward redemption */}
                {(profile?.freeBottleBalance ?? 0) > 0 && refillBottlesCount > 0 && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs dark:border-emerald-900/60 dark:bg-emerald-950/30">
                    <label className="flex items-center gap-2 cursor-pointer font-medium text-emerald-800 dark:text-emerald-300">
                      <input
                        type="checkbox"
                        checked={redeemFreeBottle}
                        onChange={(e) => setRedeemFreeBottle(e.target.checked)}
                        className="size-4 rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>Redeem 1 Free Refill Bottle (Reward)</span>
                    </label>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal ({totalItemsCount} items):</span>
                    <span className="font-mono text-text-primary">GH₵ {subtotal.toFixed(2)}</span>
                  </div>

                  {depositFee > 0 && (
                    <div className="flex justify-between text-amber-600 dark:text-amber-400">
                      <span>Bottle Deposits ({refillBottlesCount} bottles):</span>
                      <span className="font-mono">+GH₵ {depositFee.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-text-secondary">
                    <span>Delivery Fee:</span>
                    <span className="font-mono text-text-primary">
                      {deliveryFee === 0 ? "FREE" : `GH₵ ${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Referral Reward Discount:</span>
                      <span className="font-mono">-GH₵ {discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-card-border pt-3 flex justify-between text-sm font-bold text-text-primary">
                    <span>Total Amount:</span>
                    <span className="font-mono text-lg text-primary">
                      GH₵ {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="button"
                  disabled={isSubmitting || totalItemsCount === 0}
                  onClick={handlePlaceOrder}
                  className="w-full justify-center py-3 text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>{submittingStatus || "Processing..."}</span>
                  ) : paymentMethod !== "CASH_ON_DELIVERY" ? (
                    <span>Proceed to Online Payment • GH₵ {totalAmount.toFixed(2)}</span>
                  ) : (
                    <span>Confirm Order • GH₵ {totalAmount.toFixed(2)}</span>
                  )}
                </Button>

                <div className="border-t border-card-border pt-3 text-center">
                  <span className="text-[11px] text-text-tertiary">
                    Hygienic sealed bottles • Fast doorstep delivery across Accra
                  </span>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default function OrderWaterPage() {
  return (
    <Suspense fallback={<SkeletonAppShell />}>
      <OrderWaterContent />
    </Suspense>
  );
}
