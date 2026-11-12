"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import AppLayout from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Card } from "@/components/tailgrids/core/card";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { Modal } from "@/components/ui/Modal";
import DispenserPayoffGauge from "@/components/dispenser/DispenserPayoffGauge";
import { SkeletonTelemetry } from "@/components/ui/skeleton";
import {
  StoredDispenserPlan,
  StoredDispenserPayment,
  DispenserCatalogModel,
} from "@/lib/dispenser-store";
import {
  CreditCard,
  Wrench,
  Check,
  ShieldCheck,
  Cpu,
  Droplets,
  Calendar,
  AlertTriangle,
} from "lucide-react";

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

  // Handle Monthly Installment Payment via gateway
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

  return (
    <AppLayout role="CUSTOMER">
      <div className="space-y-6">
        {/* Success Banners */}
        {faultSuccess && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300">
            <span>{faultSuccess}</span>
            <button
              onClick={() => setFaultSuccess("")}
              className="text-text-tertiary hover:text-text-primary cursor-pointer p-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* Breadcrumbs & Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Smart Dispenser &amp; IoT Telemetry
              </h1>
              {plan && (
                <Badge color={plan.isFullyPaid ? "success" : "cyan"} size="sm">
                  {plan.isFullyPaid ? "Customer Owned" : "Rent-to-Own"}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
              Manage your dispenser plan, track bottle water levels, make monthly payments, or request service.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: "/customer" },
                { label: "Water Dispenser" },
              ]}
            />
            {plan && !plan.isFullyPaid && (
              <Button
                size="sm"
                onClick={() => {
                  setPayError("");
                  setPayAmount(plan.monthlyDue.toString());
                  setIsPayModalOpen(true);
                }}
                className="gap-2 text-xs font-semibold"
              >
                <CreditCard className="size-3.5" />
                <span>Pay Monthly Installment</span>
              </Button>
            )}
          </div>
        </div>

        {/* IF CUSTOMER HAS AN ACTIVE DISPENSER */}
        {plan ? (
          <>
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
              <Card>
                <span className="text-xs font-medium text-text-secondary block">
                  Amount Paid
                </span>
                <div className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400 sm:text-2xl lg:text-3xl font-mono">
                  GH₵ {plan.amountPaid.toFixed(2)}
                </div>
                <span className="mt-2 text-[11px] text-text-tertiary block">
                  {plan.installmentsPaidCount} payments completed
                </span>
              </Card>

              <Card>
                <span className="text-xs font-medium text-text-secondary block">
                  Remaining Balance
                </span>
                <div className="mt-1 text-lg font-bold text-text-primary sm:text-2xl lg:text-3xl font-mono">
                  GH₵ {plan.outstandingBalance.toFixed(2)}
                </div>
                <span className="mt-2 text-[11px] text-text-tertiary block">
                  {plan.isFullyPaid ? "Fully paid off" : "To own outright"}
                </span>
              </Card>

              <Card>
                <span className="text-xs font-medium text-text-secondary block">
                  Monthly Payment
                </span>
                <div className="mt-1 text-lg font-bold text-primary sm:text-2xl lg:text-3xl font-mono">
                  GH₵ {plan.monthlyDue.toFixed(2)}
                </div>
                <span className="mt-2 text-[11px] text-text-tertiary block">Per month (10 months total)</span>
              </Card>

              <Card>
                <span className="text-xs font-medium text-text-secondary block">
                  Next Due Date
                </span>
                <div className="mt-1 text-sm font-bold text-text-primary sm:text-xl lg:text-2xl">
                  {plan.isFullyPaid
                    ? "Complete"
                    : new Date(plan.nextPaymentDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                </div>
                <span className="mt-2 text-[11px] text-text-tertiary block">
                  {plan.isFullyPaid ? "No future dues" : "Automatic reminder sent"}
                </span>
              </Card>
            </div>

            {/* 7 / 5 Grid Split: Device & IoT Details vs Payoff Gauge */}
            <div className="grid grid-cols-12 gap-4 md:gap-6">
              {/* Left (7 cols): Device & Smart Telemetry */}
              <div className="col-span-12 lg:col-span-7 space-y-4">
                <Card className="p-6 space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-card-border">
                    <div>
                      <span className="text-[11px] font-mono text-text-tertiary block">
                        SERIAL: {plan.serialNumber}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary">
                        {plan.modelName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`size-2.5 rounded-full ${plan.isOnline ? "bg-emerald-500" : "bg-card-border"}`} />
                      <span className="text-xs text-text-secondary font-medium">
                        {plan.isOnline ? "Connected" : "Offline"}
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Sensor Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-background-gray-secondary p-3.5 border border-card-border">
                      <span className="text-[11px] text-text-tertiary block">Water Level</span>
                      <div className="mt-1.5 flex items-baseline gap-1">
                        <span className={`text-xl font-bold ${plan.waterLevelPercent < 15 ? "text-amber-600" : "text-primary"}`}>
                          {plan.waterLevelPercent}%
                        </span>
                        <span className="text-[10px] text-text-tertiary">
                          (~{((plan.waterLevelPercent / 100) * 18.9).toFixed(1)}L)
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-background-gray-secondary p-3.5 border border-card-border">
                      <span className="text-[11px] text-text-tertiary block">Daily Usage</span>
                      <div className="mt-1.5 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {plan.dailyUsageLiters} <span className="text-xs font-normal text-text-tertiary">L/day</span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-background-gray-secondary p-3.5 border border-card-border">
                      <span className="text-[11px] text-text-tertiary block">Sensor Battery</span>
                      <div className="mt-1.5 text-xl font-bold text-purple-600 dark:text-purple-400">
                        {plan.batteryPercent}%
                      </div>
                    </div>
                  </div>

                  {/* Quick Refill Prompt if water is low */}
                  {plan.waterLevelPercent < 30 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-950/30 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-amber-800 dark:text-amber-300 block">Running Low on Water?</strong>
                        <span className="text-amber-700 dark:text-amber-400">Order a fresh 18.9L refill bottle delivered to your doorstep.</span>
                      </div>
                      <Button asChild size="sm" className="shrink-0 ml-3 bg-amber-600 hover:bg-amber-700 text-white">
                        <Link href="/customer/order">
                          Order Water
                        </Link>
                      </Button>
                    </div>
                  )}

                  {/* Device Info Rows */}
                  <div className="space-y-2.5 text-xs pt-1">
                    <div className="flex justify-between py-1 border-b border-card-border">
                      <span className="text-text-tertiary">Installation Address:</span>
                      <span className="font-medium text-text-primary">{plan.deliveryAddressText}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-card-border">
                      <span className="text-text-tertiary">Installation Date:</span>
                      <span className="font-medium text-text-primary">{plan.installedDate}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-text-tertiary">Maintenance Warranty:</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">Active (Included with Plan)</span>
                    </div>
                  </div>

                  {/* Service Support Trigger */}
                  <div className="pt-2 border-t border-card-border">
                    <button
                      type="button"
                      onClick={() => {
                        setFaultError("");
                        setIsFaultModalOpen(true);
                      }}
                      className="text-xs font-semibold text-text-secondary hover:text-primary flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Wrench className="size-4" />
                      <span>Need maintenance or repairs? Report an issue</span>
                    </button>
                  </div>
                </Card>
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
            <Card className="overflow-hidden p-0">
              <div className="p-5 border-b border-card-border flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    Payment History
                  </h3>
                  <p className="text-xs text-text-tertiary">
                    Monthly installment receipts for {plan.serialNumber}
                  </p>
                </div>
                <Badge color="success" size="sm">
                  {payments.length} Payments Logged
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <TableRoot>
                  <TableHeader>
                    <TableRow className="border-b border-card-border bg-background-gray-secondary/50">
                      <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary uppercase">Date</TableHead>
                      <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary uppercase">Reference</TableHead>
                      <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary uppercase">Method</TableHead>
                      <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary uppercase">Amount</TableHead>
                      <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary uppercase text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-card-border">
                    {payments.map((p) => (
                      <TableRow key={p.id} className="hover:bg-background-gray-secondary/30 transition">
                        <TableCell className="px-5 py-3.5 text-xs text-text-tertiary">
                          {new Date(p.paidAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="px-5 py-3.5 font-mono font-medium text-xs text-text-primary">
                          {p.referenceCode}
                        </TableCell>
                        <TableCell className="px-5 py-3.5 text-xs text-text-secondary">
                          {p.momoNetwork ? `${p.momoNetwork} Mobile Money` : "Mobile Money"}
                        </TableCell>
                        <TableCell className="px-5 py-3.5 font-bold text-xs text-text-primary font-mono">
                          GH₵ {p.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="px-5 py-3.5 text-xs text-right">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Confirmed
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableRoot>
              </div>
            </Card>
          </>
        ) : (
          /* IF CUSTOMER DOES NOT HAVE AN ACTIVE DISPENSER: SHOWCASE CATALOG */
          <div className="space-y-6">
            <Card className="p-8 bg-gradient-to-r from-primary to-blue-light-600 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-none shadow-sm">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-white/80">
                  Smart Home &amp; Office Solution
                </span>
                <h2 className="text-xl sm:text-2xl font-bold mt-1 text-white">
                  Own a Smart Dispenser for just GH₵ 150 / month
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-white/90 max-w-xl">
                  Zero interest rent-to-own financing. Pay monthly installments and after 10 months the unit is 100% yours!
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setApplyError("");
                  setIsApplyModalOpen(true);
                }}
                className="bg-white text-primary hover:bg-white/90 shrink-0 font-bold"
              >
                Apply for Rent-to-Own
              </Button>
            </Card>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {catalog.map((mod) => (
                <Card
                  key={mod.id}
                  className="p-6 flex flex-col justify-between group transition hover:border-primary/50"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge color="primary" size="sm">
                        Rent-to-Own
                      </Badge>
                      <span className="text-xs font-bold text-text-primary font-mono">
                        GH₵ {mod.totalCost.toFixed(2)}
                      </span>
                    </div>

                    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-background-gray-secondary flex items-center justify-center border border-card-border">
                      <Image
                        src="/images/product/fnet-smart-dispenser.jpg"
                        alt={mod.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-text-primary">
                        {mod.name}
                      </h3>
                      <p className="text-xs text-text-tertiary mt-1 line-clamp-2">
                        {mod.tagline}
                      </p>
                    </div>

                    <div className="rounded-xl bg-background-gray-secondary p-3.5 text-xs space-y-1.5 border border-card-border">
                      <div className="flex justify-between">
                        <span className="text-text-tertiary">Initial Deposit:</span>
                        <span className="font-bold text-text-primary font-mono">GH₵ {mod.initialDeposit.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-tertiary">Monthly Payment:</span>
                        <span className="font-bold text-primary font-mono">
                          GH₵ {mod.monthlyDue.toFixed(2)} × {mod.installmentsCount} mos
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-1.5 text-xs text-text-secondary pt-2">
                      {mod.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedModel(mod.name);
                      setApplyError("");
                      setIsApplyModalOpen(true);
                    }}
                    className="mt-6 w-full justify-center"
                  >
                    Select this Model
                  </Button>
                </Card>
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
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                {payError}
              </div>
            )}

            <div className="rounded-xl bg-background-gray-secondary p-4 text-xs space-y-1.5 border border-card-border">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Dispenser:</span>
                <span className="font-bold text-text-primary">{plan?.modelName} ({plan?.serialNumber})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Remaining Balance:</span>
                <span className="font-bold text-primary font-mono">GH₵ {plan?.outstandingBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Scheduled Monthly Amount:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">GH₵ {plan?.monthlyDue.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Payment Amount (GH₵)
              </label>
              <input
                type="number"
                step="0.01"
                min="10"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                required
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs font-mono text-text-primary focus:outline-hidden focus:border-primary transition"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-card-border">
              <Button
                type="button"
                appearance="outline"
                size="sm"
                onClick={() => setIsPayModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPaying}
                size="sm"
              >
                {isPaying ? "Connecting..." : `Proceed to Payment • GH₵ ${parseFloat(payAmount || "0").toFixed(2)}`}
              </Button>
            </div>
          </form>
        </Modal>

        {/* MODAL: Report Fault / Request Service */}
        <Modal
          isOpen={isFaultModalOpen}
          onClose={() => setIsFaultModalOpen(false)}
          title="Report Dispenser Issue"
        >
          <form onSubmit={handleFaultReport} className="space-y-4">
            {faultError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                {faultError}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Issue Category
              </label>
              <select
                value={faultType}
                onChange={(e) => setFaultType(e.target.value)}
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
              >
                <option value="COOLING_FAILURE">Not Cooling Properly</option>
                <option value="HEATING_FAILURE">Not Heating Water</option>
                <option value="WATER_LEAKAGE">Water Leakage around Spout / Base</option>
                <option value="SENSOR_ERROR">Sensor / Telemetry Inaccurate</option>
                <option value="NO_POWER">Power Issue / Will Not Turn On</option>
                <option value="OTHER">Other Issue</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Urgency
              </label>
              <select
                value={faultUrgency}
                onChange={(e) => setFaultUrgency(e.target.value as any)}
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
              >
                <option value="NORMAL">Normal — Routine maintenance</option>
                <option value="HIGH">High — Urgent (Water leak or no drinking water)</option>
                <option value="LOW">Low — Minor cosmetic issue</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Describe the Problem
              </label>
              <textarea
                rows={3}
                required
                value={faultDesc}
                onChange={(e) => setFaultDesc(e.target.value)}
                placeholder="Explain what is happening so our technician can prepare replacement parts..."
                className="w-full rounded-lg border border-card-border bg-card-background p-2.5 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-card-border">
              <Button
                type="button"
                appearance="outline"
                size="sm"
                onClick={() => setIsFaultModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingFault}
                size="sm"
              >
                {isSubmittingFault ? "Submitting..." : "Submit Service Request"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* MODAL: Apply for Dispenser */}
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title="Apply for Rent-to-Own Dispenser"
        >
          <form onSubmit={handleApply} className="space-y-4">
            {applyError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                {applyError}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Selected Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
              >
                {catalog.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} (Deposit: GH₵ {m.initialDeposit.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Delivery Location
              </label>
              <input
                type="text"
                required
                value={applyAddress}
                onChange={(e) => setApplyAddress(e.target.value)}
                placeholder="e.g. East Legon, Accra"
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
              />
            </div>

            <div className="rounded-xl bg-background-gray-secondary p-4 text-xs space-y-1.5 border border-card-border">
              <div className="font-semibold text-text-primary">
                Contract Summary:
              </div>
              <p className="text-text-tertiary">
                Small initial deposit paid upon delivery. Monthly installment of GH₵ 150 for 10 months. Includes free maintenance, sanitization, and full ownership transfer.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-card-border">
              <Button
                type="button"
                appearance="outline"
                size="sm"
                onClick={() => setIsApplyModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isApplying}
                size="sm"
              >
                {isApplying ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
