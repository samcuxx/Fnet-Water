"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/badge/Badge";
import Alert from "@/components/ui/alert/Alert";
import { Modal } from "@/components/ui/Modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import TextArea from "@/components/form/input/TextArea";
import DispenserPayoffGauge from "@/components/dispenser/DispenserPayoffGauge";
import {
  StoredDispenserPlan,
  StoredDispenserPayment,
  DispenserCatalogModel,
} from "@/lib/dispenser-store";

export default function CustomerDispenserPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [plan, setPlan] = useState<StoredDispenserPlan | null>(null);
  const [payments, setPayments] = useState<StoredDispenserPayment[]>([]);
  const [catalog, setCatalog] = useState<DispenserCatalogModel[]>([]);

  // Modals
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isFaultModalOpen, setIsFaultModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Payment Form State
  const [payAmount, setPayAmount] = useState("150");
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [paySuccessMessage, setPaySuccessMessage] = useState("");

  // Fault Report State
  const [faultType, setFaultType] = useState<string>("COOLING_FAILURE");
  const [faultDesc, setFaultDesc] = useState("");
  const [faultUrgency, setFaultUrgency] = useState<"LOW" | "NORMAL" | "HIGH">("NORMAL");
  const [isSubmittingFault, setIsSubmittingFault] = useState(false);
  const [faultError, setFaultError] = useState("");
  const [faultSuccess, setFaultSuccess] = useState("");

  // Apply State
  const [selectedModel, setSelectedModel] = useState("Aquamaster Pro Hot/Cold");
  const [applyAddress, setApplyAddress] = useState("East Legon");
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/customer/dispenser");
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
        setPayments(data.payments || []);
        setCatalog(data.catalog || []);
      }
    } catch (err) {
      console.error("Failed to load customer dispenser:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Monthly Installment Payment via Paystack
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayError("");
    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) {
      setPayError("Please enter a valid amount greater than GH₵ 0.00");
      return;
    }
    if (plan && amt > plan.outstandingBalance) {
      setPayError(`Amount cannot exceed outstanding balance of GH₵ ${plan.outstandingBalance.toFixed(2)}`);
      return;
    }

    setIsPaying(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          type: "DISPENSER_INSTALLMENT",
          planId: plan?.id,
          callbackUrl: `${origin}/customer/payment-callback`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.authorizationUrl) {
        throw new Error(data.error || "Failed to initialize payment gateway.");
      }

      // Redirect directly to official Paystack checkout
      window.location.href = data.authorizationUrl;
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Error connecting to payment provider.");
      setIsPaying(false);
    }
  };

  // Handle Fault Report
  const handleFaultReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setFaultError("");
    if (!faultDesc || faultDesc.trim().length < 5) {
      setFaultError("Please describe the issue in detail (at least 5 characters).");
      return;
    }

    setIsSubmittingFault(true);
    try {
      const res = await fetch("/api/customer/dispenser/report-fault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueType: faultType,
          description: faultDesc,
          urgency: faultUrgency,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit fault report.");
      }

      setFaultSuccess(data.message);
      setIsFaultModalOpen(false);
      setFaultDesc("");
    } catch (err) {
      setFaultError(err instanceof Error ? err.message : "Error submitting request.");
    } finally {
      setIsSubmittingFault(false);
    }
  };

  // Handle Application Submit
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyError("");
    setIsApplying(true);
    try {
      const res = await fetch("/api/customer/dispenser/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelName: selectedModel,
          deliveryAddressText: applyAddress,
          paymentMethod: "MOBILE_MONEY",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to apply for dispenser.");
      }

      setIsApplyModalOpen(false);
      await loadData();
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Error applying for dispenser.");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout role="CUSTOMER">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout role="CUSTOMER">
      <div className="space-y-6">
        {/* Success Notifications */}
        {paySuccessMessage && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span>{paySuccessMessage}</span>
            <button
              onClick={() => setPaySuccessMessage("")}
              className="text-emerald-600 hover:text-emerald-800 font-bold ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {faultSuccess && (
          <div className="p-3 bg-blue-50 dark:bg-brand-950/30 border border-blue-200 dark:border-brand-800 rounded-xl text-xs text-brand-800 dark:text-blue-light-400 flex items-center justify-between">
            <span>{faultSuccess}</span>
            <button
              onClick={() => setFaultSuccess("")}
              className="text-brand-600 hover:text-brand-800 font-bold ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Low Water Warning if < 15% */}
        {plan && plan.waterLevelPercent < 15 && (
          <Alert
            variant="warning"
            title="Low Bottle Water Level"
            message={`Your dispenser bottle is at ${plan.waterLevelPercent}% capacity. Reorder a refill bottle soon to ensure uninterrupted clean water.`}
          />
        )}

        {/* Tamper / Sensor Warning if active */}
        {plan && plan.tamperAlert && (
          <Alert
            variant="error"
            title="Sensor Tamper / Tilt Alert"
            message="Your dispenser has detected movement or an irregular sensor reading. If the dispenser was moved, please check the leak tray."
          />
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Smart Water Dispenser
              </h1>
              <Badge color={plan?.isFullyPaid ? "success" : "info"} size="sm">
                {plan?.isFullyPaid ? "Customer Owned" : "Rent-to-Own"}
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Manage your dispenser plan, track bottle water levels, make monthly payments, or request service.
            </p>
          </div>

          {plan && !plan.isFullyPaid && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPayError("");
                  setPayAmount(plan.monthlyDue.toString());
                  setIsPayModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Pay Monthly Installment</span>
              </button>
            </div>
          )}
        </div>

        {/* IF CUSTOMER HAS AN ACTIVE DISPENSER */}
        {plan ? (
          <>
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
                  Amount Paid
                </span>
                <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  GH₵ {plan.amountPaid.toFixed(2)}
                </div>
                <span className="text-[11px] text-gray-400">
                  {plan.installmentsPaidCount} payments completed
                </span>
              </div>

              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
                  Remaining Balance
                </span>
                <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  GH₵ {plan.outstandingBalance.toFixed(2)}
                </div>
                <span className="text-[11px] text-gray-400">
                  {plan.isFullyPaid ? "Fully paid off" : "To own outright"}
                </span>
              </div>

              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
                  Monthly Payment
                </span>
                <div className="mt-1 text-2xl font-bold text-brand-600 dark:text-blue-light-400">
                  GH₵ {plan.monthlyDue.toFixed(2)}
                </div>
                <span className="text-[11px] text-gray-400">Per month (10 months total)</span>
              </div>

              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
                  Next Due Date
                </span>
                <div className="mt-1 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {plan.isFullyPaid
                    ? "Complete"
                    : new Date(plan.nextPaymentDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                </div>
                <span className="text-[11px] text-gray-400">
                  {plan.isFullyPaid ? "No future dues" : "Automatic reminder sent"}
                </span>
              </div>
            </div>

            {/* 7 / 5 Grid Split: Device & IoT Details vs Payoff Gauge */}
            <div className="grid grid-cols-12 gap-4 md:gap-6">
              {/* Left (7 cols): Device & Smart Telemetry */}
              <div className="col-span-12 lg:col-span-7 space-y-4">
                <div className="p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-[11px] font-mono text-gray-400 block">
                        SERIAL: {plan.serialNumber}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                        {plan.modelName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`size-2.5 rounded-full ${plan.isOnline ? "bg-emerald-500" : "bg-gray-400"}`} />
                      <span className="text-xs text-gray-500">
                        {plan.isOnline ? "Connected" : "Offline"}
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Sensor Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-brand-950/20 border border-blue-100 dark:border-brand-800/40">
                      <span className="text-[11px] text-gray-500 block">Bottle Water Level</span>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className={`text-xl font-bold ${plan.waterLevelPercent < 15 ? "text-amber-600" : "text-brand-600 dark:text-blue-light-400"}`}>
                          {plan.waterLevelPercent}%
                        </span>
                        <span className="text-[10px] text-gray-400">
                          (~{((plan.waterLevelPercent / 100) * 18.9).toFixed(1)}L)
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40">
                      <span className="text-[11px] text-gray-500 block">Daily Consumption</span>
                      <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {plan.dailyUsageLiters} <span className="text-xs font-normal text-gray-400">L/day</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-800/40">
                      <span className="text-[11px] text-gray-500 block">Sensor Battery</span>
                      <div className="mt-1 text-xl font-bold text-purple-600 dark:text-purple-400">
                        {plan.batteryPercent}%
                      </div>
                    </div>
                  </div>

                  {/* Quick Refill Prompt if water is low */}
                  {plan.waterLevelPercent < 30 && (
                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-amber-800 dark:text-amber-300 block">Running Low on Water?</strong>
                        <span className="text-amber-700 dark:text-amber-400">Order a fresh 18.9L refill bottle delivered to your doorstep.</span>
                      </div>
                      <Link
                        href="/customer/order"
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 transition shrink-0 ml-3"
                      >
                        Order Water
                      </Link>
                    </div>
                  )}

                  {/* Device Info Rows */}
                  <div className="space-y-2 text-xs pt-1">
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">Installation Address:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{plan.deliveryAddressText}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-gray-500">Installation Date:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200">{plan.installedDate}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-500">Free Maintenance Warranty:</span>
                      <span className="font-medium text-emerald-600">Active (Included with Plan)</span>
                    </div>
                  </div>

                  {/* Service Support Trigger */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFaultError("");
                        setIsFaultModalOpen(true);
                      }}
                      className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-blue-light-400 flex items-center gap-1.5 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Need maintenance or repairs? Report an issue</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right (5 cols): Rent-to-Own Payoff Gauge */}
              <div className="col-span-12 lg:col-span-5">
                <DispenserPayoffGauge
                  amountPaid={plan.amountPaid}
                  totalCost={plan.totalCost}
                  isFullyPaid={plan.isFullyPaid}
                />
              </div>
            </div>

            {/* Payment History Table */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6 shadow-theme-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Payment History
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    All monthly installment receipts for {plan.serialNumber}
                  </p>
                </div>
                <Badge color="success" size="sm">
                  {payments.length} Payments Logged
                </Badge>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 bg-gray-50/50 dark:bg-gray-800/50">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Reference</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-3 text-gray-500">
                          {new Date(p.paidAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-gray-800 dark:text-gray-200">
                          {p.referenceCode}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 dark:text-gray-400">
                          {p.momoNetwork ? `${p.momoNetwork} Mobile Money` : "Mobile Money"}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white">
                          GH₵ {p.amount.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Confirmed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* IF CUSTOMER DOES NOT HAVE AN ACTIVE DISPENSER: SHOWCASE CATALOG */
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-theme-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-cyan-200">
                  Smart Home &amp; Office Solution
                </span>
                <h2 className="text-xl sm:text-2xl font-bold mt-1">
                  Own a Smart Dispenser for just GH₵ 150 / month
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-cyan-100 max-w-xl">
                  Choose your dispenser with zero interest financing. Start with a small deposit and pay monthly. Once completed, the unit is 100% yours!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setApplyError("");
                  setIsApplyModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-white text-brand-700 hover:bg-cyan-50 transition shadow-sm self-start sm:self-auto cursor-pointer"
              >
                Apply for Rent-to-Own
              </button>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {catalog.map((mod) => (
                <div
                  key={mod.id}
                  className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-theme-xs flex flex-col justify-between group hover:shadow-lg transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge color="primary" size="sm">
                        Rent-to-Own
                      </Badge>
                      <span className="text-xs font-bold text-gray-500">
                        GH₵ {mod.totalCost.toFixed(2)}
                      </span>
                    </div>

                    {/* Dispenser Product Photo */}
                    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-sky-50 dark:bg-gray-800/60 my-2 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                      <Image
                        src="/images/product/fnet-smart-dispenser.jpg"
                        alt={mod.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        {mod.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {mod.tagline}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Initial Deposit:</span>
                        <span className="font-bold text-gray-900 dark:text-white">GH₵ {mod.initialDeposit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Monthly Payment:</span>
                        <span className="font-bold text-brand-600 dark:text-blue-light-400">
                          GH₵ {mod.monthlyDue.toFixed(2)} × {mod.installmentsCount} mos
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400 pt-2">
                      {mod.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModel(mod.name);
                      setApplyError("");
                      setIsApplyModalOpen(true);
                    }}
                    className="mt-5 w-full py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition shadow-theme-xs cursor-pointer"
                  >
                    Select this Model
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL: Pay Monthly Installment */}
        <Modal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          title="Make Monthly Installment Payment"
        >
          <form onSubmit={handlePayment} className="space-y-4">
            {payError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300">
                {payError}
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Dispenser:</span>
                <span className="font-bold text-gray-900 dark:text-white">{plan?.modelName} ({plan?.serialNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Remaining Balance:</span>
                <span className="font-bold text-brand-600 dark:text-blue-light-400">GH₵ {plan?.outstandingBalance.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="pay-amount">Amount (GH₵)</Label>
              <Input
                id="pay-amount"
                type="number"
                min="10"
                max={plan?.outstandingBalance.toString()}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                required
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Standard monthly installment: GH₵ {plan?.monthlyDue.toFixed(2)}. You can pay extra to finish earlier.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-brand-950/30 border border-blue-200/60 dark:border-brand-800 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                <svg className="size-4 text-brand-600 dark:text-blue-light-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure Online Payment</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                You will be redirected to the secure payment portal to complete this installment using Mobile Money, Card, or Bank Transfer.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">
                  MTN MoMo
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300">
                  Telecel Cash
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300">
                  AT Money
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300">
                  Card (Visa / Mastercard)
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPaying}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-brand-500 hover:bg-brand-600 transition shadow-theme-xs disabled:opacity-50 cursor-pointer"
              >
                {isPaying ? "Connecting..." : `Proceed to Pay GH₵ ${parseFloat(payAmount || "0").toFixed(2)}`}
              </button>
            </div>
          </form>
        </Modal>

        {/* MODAL: Report Issue / Request Service */}
        <Modal
          isOpen={isFaultModalOpen}
          onClose={() => setIsFaultModalOpen(false)}
          title="Report Dispenser Issue"
        >
          <form onSubmit={handleFaultReport} className="space-y-4">
            {faultError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300">
                {faultError}
              </div>
            )}

            <div>
              <Label htmlFor="fault-type">Issue Type</Label>
              <Select
                id="fault-type"
                options={[
                  { value: "COOLING_FAILURE", label: "Water is not chilling / cooling" },
                  { value: "HEATING_FAILURE", label: "Water is not heating up" },
                  { value: "LEAKAGE", label: "Water leaking around tap or base" },
                  { value: "PUMP_NOISE", label: "Unusual pump or motor noise" },
                  { value: "SENSOR_ERROR", label: "Sensor indicator light flashing" },
                  { value: "OTHER", label: "Other general maintenance" },
                ]}
                value={faultType}
                onChange={(val) => setFaultType(val)}
              />
            </div>

            <div>
              <Label htmlFor="fault-urgency">Urgency</Label>
              <Select
                id="fault-urgency"
                options={[
                  { value: "LOW", label: "Low (General question or inspection)" },
                  { value: "NORMAL", label: "Normal (Service visit in 24-48 hours)" },
                  { value: "HIGH", label: "High (Urgent leak or power failure)" },
                ]}
                value={faultUrgency}
                onChange={(val) => setFaultUrgency(val as any)}
              />
            </div>

            <div>
              <Label htmlFor="fault-desc">Description of the Issue</Label>
              <TextArea
                id="fault-desc"
                placeholder="Please describe what happened, when it started, or any error signs..."
                value={faultDesc}
                onChange={(e) => setFaultDesc(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsFaultModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmittingFault}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-brand-500 hover:bg-brand-600 transition shadow-theme-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingFault ? "Submitting..." : "Submit Service Request"}
              </button>
            </div>
          </form>
        </Modal>

        {/* MODAL: Apply for Dispenser */}
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title="Apply for Smart Dispenser Rent-to-Own"
        >
          <form onSubmit={handleApply} className="space-y-4">
            {applyError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300">
                {applyError}
              </div>
            )}

            <div>
              <Label htmlFor="apply-model">Dispenser Model</Label>
              <Select
                id="apply-model"
                options={catalog.map((m) => ({
                  value: m.name,
                  label: `${m.name} (Deposit GH₵ ${m.initialDeposit.toFixed(2)}, then GH₵ ${m.monthlyDue.toFixed(2)}/mo)`,
                }))}
                value={selectedModel}
                onChange={(val) => setSelectedModel(val)}
              />
            </div>

            <div>
              <Label htmlFor="apply-address">Installation Address</Label>
              <Input
                id="apply-address"
                type="text"
                value={applyAddress}
                onChange={(e) => setApplyAddress(e.target.value)}
                placeholder="Enter street name, house number or landmark"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-brand-950/30 border border-blue-200 dark:border-brand-800 text-xs space-y-1">
              <strong className="text-brand-900 dark:text-blue-light-400 block">How Rent-to-Own Works:</strong>
              <p className="text-brand-800 dark:text-gray-300">
                A technician delivers and installs your dispenser. After 10 monthly payments, ownership transfers to you automatically.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isApplying}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-brand-500 hover:bg-brand-600 transition shadow-theme-xs disabled:opacity-50 cursor-pointer"
              >
                {isApplying ? "Activating..." : "Confirm & Activate Plan"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
