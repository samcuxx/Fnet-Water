"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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

  // Wizard Step: 1 = Products, 2 = Delivery, 3 = Review & Payment, 4 = Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

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
  const [redeemFreeRefill, setRedeemFreeRefill] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MOBILE_MONEY");
  const [momoNetwork, setMomoNetwork] = useState<"MTN" | "Telecel" | "AT">("MTN");
  const [momoPhone, setMomoPhone] = useState<string>("0241000005");

  // Submission & Confirmed Order
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      if (profData.success && profData.user?.phone) {
        setMomoPhone(profData.user.phone);
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

  const canRedeemReward = (profile?.freeBottleBalance || 0) > 0 && refillBottlesCount > 0;
  const discountAmount = redeemFreeRefill && canRedeemReward ? 25.0 : 0.0;

  const totalAmount = Math.max(0, subtotal + depositFee + deliveryFee - discountAmount);

  // Place Order
  const handlePlaceOrder = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);

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
          deliveryAddressId: selectedAddressId,
          deliverySlot,
          deliveryDate: deliveryDate === "Today" ? new Date().toISOString() : new Date(Date.now() + 86400000).toISOString(),
          deliveryInstructions,
          hasEmptyBottleExchange,
          redeemFreeRefill,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to place order.");
        setIsSubmitting(false);
        return;
      }

      setConfirmedOrder(data.order);
      setCurrentStep(4);
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  return (
    <AppLayout role="CUSTOMER">
      <div className="max-w-2xl mx-auto space-y-5 pb-10">
        {/* Step Indicator */}
        {currentStep < 4 && (
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-xs">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className={currentStep === 1 ? "text-brand-600 dark:text-blue-light-400" : "text-gray-400"}>
                1. Select Water
              </span>
              <span className="text-gray-300 dark:text-gray-700">&rarr;</span>
              <span className={currentStep === 2 ? "text-brand-600 dark:text-blue-light-400" : "text-gray-400"}>
                2. Delivery
              </span>
              <span className="text-gray-300 dark:text-gray-700">&rarr;</span>
              <span className={currentStep === 3 ? "text-brand-600 dark:text-blue-light-400" : "text-gray-400"}>
                3. Payment
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-brand-500 h-full transition-all duration-300"
                style={{ width: currentStep === 1 ? "33%" : currentStep === 2 ? "66%" : "100%" }}
              />
            </div>
          </div>
        )}

        {/* STEP 1: SELECT WATER PRODUCTS */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Order Water Delivery
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select 19L pure refills or bottled water packs.
                </p>
              </div>
              <Badge color="primary" size="sm">
                1:1 Swap Available
              </Badge>
            </div>

            {/* Products List */}
            <div className="space-y-3">
              {loading ? (
                <div className="py-12 text-center text-xs text-gray-400">Loading water products...</div>
              ) : (
                products.map((prod) => {
                  const qty = cart[prod.id] || 0;
                  const is19L = prod.type === "REFILLABLE_BOTTLE";

                  return (
                    <div
                      key={prod.id}
                      className={`p-4 rounded-2xl border transition shadow-theme-xs bg-white dark:bg-gray-900 ${
                        qty > 0
                          ? "border-brand-500 ring-1 ring-brand-500/20"
                          : "border-gray-200 dark:border-gray-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                              {prod.name}
                            </h3>
                            {is19L && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-blue-light-400">
                                Most Popular
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {prod.description}
                          </p>
                          <div className="mt-2 text-sm font-bold text-brand-600 dark:text-blue-light-400">
                            GH₵ {prod.price.toFixed(2)}{" "}
                            <span className="text-xs font-normal text-gray-400">/ {prod.unit}</span>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 shrink-0 bg-gray-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(prod.id, -1)}
                            disabled={qty === 0}
                            className="size-7 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-white font-bold flex items-center justify-center disabled:opacity-40 transition shadow-xs cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-gray-900 dark:text-white">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(prod.id, 1)}
                            className="size-7 rounded-lg bg-brand-500 text-white font-bold flex items-center justify-center hover:bg-brand-600 transition shadow-xs cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* 1:1 Bottle Exchange Note for Refill Bottle */}
                      {is19L && qty > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              Empty bottle return:
                            </span>
                            <span className="ml-1 text-gray-500 dark:text-gray-400">
                              {hasEmptyBottleExchange ? "1:1 swap (Deposit waived)" : `No empty bottles (+GH₵ ${(qty * 80).toFixed(2)})`}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setHasEmptyBottleExchange(!hasEmptyBottleExchange)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                              hasEmptyBottleExchange
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                            }`}
                          >
                            {hasEmptyBottleExchange ? "1:1 Swap Active" : "Add Deposit"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Next Step Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={totalItemsCount === 0}
                onClick={() => setCurrentStep(2)}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continue to Delivery</span>
                <span>&bull;</span>
                <span>GH₵ {totalAmount.toFixed(2)}</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DELIVERY DETAILS & SCHEDULE */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Delivery Destination &amp; Time
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Confirm where and when you want your water delivered.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs text-brand-600 dark:text-blue-light-400 font-medium hover:underline cursor-pointer"
              >
                &larr; Back to Items
              </button>
            </div>

            {/* Address Selection */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Select Drop-off Address
                </span>
                <Link
                  href="/customer/addresses"
                  className="text-[11px] text-brand-600 dark:text-blue-light-400 font-medium hover:underline"
                >
                  + Add New Address
                </Link>
              </div>

              {addresses.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  No saved addresses found. Please add one in your Address Book.
                </div>
              ) : (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition ${
                        selectedAddressId === addr.id
                          ? "border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 ring-1 ring-brand-500/30"
                          : "border-gray-200 dark:border-gray-800"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryAddress"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-0.5 text-brand-500 focus:ring-brand-500"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {addr.areaName}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            {addr.digitalAddress}
                          </span>
                        </div>
                        {addr.deliveryInstructions && (
                          <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 truncate">
                            {addr.deliveryInstructions}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery Date & Time Slot */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-xs space-y-3">
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block">
                Delivery Schedule
              </span>

              {/* Day */}
              <div className="grid grid-cols-2 gap-2">
                {["Today", "Tomorrow"].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setDeliveryDate(day)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                      deliveryDate === day
                        ? "border-brand-500 bg-brand-50/30 text-brand-600 dark:bg-brand-950/40 dark:text-blue-light-400"
                        : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Time Slots */}
              <div className="space-y-1.5">
                {[
                  "Morning (8am - 12pm)",
                  "Afternoon (12pm - 4pm)",
                  "Evening (4pm - 7pm)",
                ].map((slot) => (
                  <label
                    key={slot}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition ${
                      deliverySlot === slot
                        ? "border-brand-500 bg-brand-50/20 text-brand-700 dark:bg-brand-950/20 dark:text-blue-light-400 font-semibold"
                        : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span>{slot}</span>
                    <input
                      type="radio"
                      name="deliverySlot"
                      checked={deliverySlot === slot}
                      onChange={() => setDeliverySlot(slot as any)}
                      className="text-brand-500"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-xs space-y-2">
              <label className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block">
                Special Delivery Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Call when outside gate, leave with reception..."
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                className="w-full h-9.5 px-3 text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
              />
            </div>

            {/* Continue to Payment */}
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue to Payment</span>
              <span>&rarr;</span>
            </button>
          </div>
        )}

        {/* STEP 3: REVIEW & PAYMENT */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Review &amp; Pay
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select payment method and confirm order.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs text-brand-600 dark:text-blue-light-400 font-medium hover:underline cursor-pointer"
              >
                &larr; Back to Delivery
              </button>
            </div>

            {/* Feedback message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            {/* Order Summary Receipt */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-xs space-y-3">
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block">
                Order Summary
              </span>

              <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {Object.entries(cart).map(([pId, qty]) => {
                  const prod = products.find((p) => p.id === pId);
                  if (!prod) return null;
                  return (
                    <div key={pId} className="py-2 flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        {prod.name} &times; {qty}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        GH₵ {(prod.price * qty).toFixed(2)}
                      </span>
                    </div>
                  );
                })}

                {depositFee > 0 && (
                  <div className="py-2 flex items-center justify-between text-amber-600 dark:text-amber-400">
                    <span>Bottle Deposit ({refillBottlesCount} bottles)</span>
                    <span className="font-semibold">+GH₵ {depositFee.toFixed(2)}</span>
                  </div>
                )}

                <div className="py-2 flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Delivery Fee</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {deliveryFee === 0 ? "FREE" : `GH₵ ${deliveryFee.toFixed(2)}`}
                  </span>
                </div>

                {/* Redeem Free Refill Toggle */}
                {canRedeemReward && (
                  <div className="py-2.5 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20 px-2 rounded-lg mt-1">
                    <div>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300 block">
                        Redeem Free 19L Refill Credit
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        Balance: {profile?.freeBottleBalance} credit available
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRedeemFreeRefill(!redeemFreeRefill)}
                      className={`text-xs font-bold px-3 py-1 rounded-lg transition cursor-pointer ${
                        redeemFreeRefill
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                      }`}
                    >
                      {redeemFreeRefill ? "Applied (-GH₵ 25)" : "Redeem"}
                    </button>
                  </div>
                )}

                {/* Total */}
                <div className="pt-3 flex items-center justify-between text-sm font-bold">
                  <span className="text-gray-900 dark:text-white">Total Amount</span>
                  <span className="text-lg text-brand-600 dark:text-blue-light-400">
                    GH₵ {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-xs space-y-3">
              <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider block">
                Payment Method
              </span>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "MOBILE_MONEY", label: "Mobile Money" },
                  { id: "CARD", label: "Card Payment" },
                  { id: "CASH_ON_DELIVERY", label: "Cash on Delivery" },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                    className={`py-2.5 px-2 text-xs font-semibold rounded-xl border text-center transition cursor-pointer ${
                      paymentMethod === pm.id
                        ? "border-brand-500 bg-brand-50/30 text-brand-600 dark:bg-brand-950/40 dark:text-blue-light-400"
                        : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>

              {/* Mobile Money Details */}
              {paymentMethod === "MOBILE_MONEY" && (
                <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="grid grid-cols-3 gap-2">
                    {(["MTN", "Telecel", "AT"] as const).map((net) => (
                      <button
                        key={net}
                        type="button"
                        onClick={() => setMomoNetwork(net)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                          momoNetwork === net
                            ? "border-brand-500 bg-brand-500 text-white"
                            : "border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {net}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 block mb-1">
                      Mobile Money Number
                    </label>
                    <input
                      type="tel"
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      className="w-full h-9.5 px-3 text-xs font-mono rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Place Order CTA */}
            <button
              type="button"
              disabled={isSubmitting || totalItemsCount === 0}
              onClick={handlePlaceOrder}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Placing your order...</span>
              ) : (
                <>
                  <span>Confirm Order</span>
                  <span>&bull;</span>
                  <span>GH₵ {totalAmount.toFixed(2)}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 4: ORDER CONFIRMED & LIVE TRACKING STEPPER */}
        {currentStep === 4 && confirmedOrder && (
          <div className="space-y-4 text-center">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-theme-xs space-y-4">
              <div className="size-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold">
                &check;
              </div>

              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold block">
                  Order Successfully Placed
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                  Order {confirmedOrder.orderNumber}
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Scheduled for {confirmedOrder.deliverySlot} to {confirmedOrder.deliveryAddressText}.
                </p>
              </div>

              {/* Interactive Live Tracking Stepper */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-left space-y-3">
                <span className="text-xs font-bold text-gray-900 dark:text-white block">
                  Delivery Tracking
                </span>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-500">
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 size-3 rounded-full bg-brand-500 ring-4 ring-brand-100 dark:ring-brand-950" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      Order Received
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Payment confirmed &bull; GH₵ {confirmedOrder.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 size-3 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block">
                      Driver Assignment
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Allocating nearest delivery van in Accra hub
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 size-3 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block">
                      Out for Delivery
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Driver en route to {confirmedOrder.deliveryDigitalAddress}
                    </span>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 size-3 rounded-full bg-gray-300 dark:bg-gray-700" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 block">
                      Delivered &amp; Bottles Exchanged
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Empty bottles collected at doorstep
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                <Link
                  href="/customer"
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-brand-600 dark:text-blue-light-400 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition text-center"
                >
                  Return to Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedOrder(null);
                    setCurrentStep(1);
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition text-center cursor-pointer"
                >
                  Place Another Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
