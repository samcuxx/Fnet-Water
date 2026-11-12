"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/form/input/InputField";
import { SkeletonMetrics, SkeletonTable } from "@/components/ui/skeleton";
import { staggerContainer, fadeInUp, cardHoverMotion } from "@/lib/animations";
import type { StoredDispenserPlan } from "@/lib/dispenser-store";

export default function AdminInstallmentsPage() {
  const [plans, setPlans] = useState<StoredDispenserPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/manager/dispensers/iot");
      if (res.ok) {
        const d = await res.json();
        setPlans(d.data || []);
      }
    } catch (err) {
      console.error("Failed to load installment plans:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const filtered = plans.filter((p) =>
    p.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.customerName.toLowerCase().includes(search.toLowerCase()) ||
    p.customerPhone.includes(search)
  );

  const activePlansCount = plans.filter((p) => !p.isFullyPaid).length;
  const fullyPaidCount = plans.filter((p) => p.isFullyPaid).length;
  const totalRepaidAmount = plans.reduce((acc, p) => acc + p.amountPaid, 0);

  return (
    <AppLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                Dispenser Installment Contracts
              </h1>
              <Badge color="primary" size="sm">
                Rent-to-Own Financing
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Active rent-to-own agreements, monthly installment schedules, and customer ownership transfers.
            </p>
          </div>
        </div>

        {/* 4 Metric Cards */}
        {isLoading ? (
          <SkeletonMetrics count={4} />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            <motion.div
              variants={fadeInUp}
              {...cardHoverMotion}
              className="p-5 sm:p-6 rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs cursor-pointer"
            >
              <span className="text-xs text-brand-600 dark:text-sky-400 font-medium block">Active Financing Contracts</span>
              <div className="mt-1 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                {activePlansCount}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">Under repayment schedule</span>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              {...cardHoverMotion}
              className="p-5 sm:p-6 rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs cursor-pointer"
            >
              <span className="text-xs text-emerald-600 font-medium block">Customer Owned</span>
              <div className="mt-1 text-2xl sm:text-3xl font-black text-emerald-600">
                {fullyPaidCount}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">100% paid off contracts</span>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              {...cardHoverMotion}
              className="p-5 sm:p-6 rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs cursor-pointer"
            >
              <span className="text-xs text-purple-600 font-medium block">Total Repaid to Date</span>
              <div className="mt-1 text-2xl sm:text-3xl font-black text-purple-600">
                GH₵ {totalRepaidAmount.toFixed(2)}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">Collected installment capital</span>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              {...cardHoverMotion}
              className="p-5 sm:p-6 rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs cursor-pointer"
            >
              <span className="text-xs text-cyan-600 font-medium block">Default Rate</span>
              <div className="mt-1 text-2xl sm:text-3xl font-black text-cyan-600">
                0.0%
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">Zero contract defaults</span>
            </motion.div>
          </motion.div>
        )}

        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Input
            type="text"
            placeholder="Search by serial, customer name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 text-xs"
          />
          <span className="text-xs text-gray-500">
            {filtered.length} installment contracts
          </span>
        </div>

        {/* Contracts Table */}
        {isLoading ? (
          <SkeletonTable rows={5} columns={7} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs"
          >
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 font-semibold bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="py-3 px-4">Dispenser Serial</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Model Name</th>
                  <th className="py-3 px-4">Financial Progress</th>
                  <th className="py-3 px-4">Monthly Rate</th>
                  <th className="py-3 px-4">Next Payment Due</th>
                  <th className="py-3 px-4 text-right">Contract Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white">
                      {p.serialNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                        {p.customerName}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">{p.customerPhone}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {p.modelName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-emerald-600 font-bold">GH₵ {p.amountPaid.toFixed(2)}</span>
                          <span className="text-gray-400">/ GH₵ {p.totalCost.toFixed(2)}</span>
                        </div>
                        <div className="w-28 bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${p.isFullyPaid ? "bg-emerald-500" : "bg-brand-500"}`}
                            style={{ width: `${Math.min(100, (p.amountPaid / p.totalCost) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      GH₵ {p.monthlyDue.toFixed(2)} / mo
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {p.isFullyPaid
                        ? "Paid Off"
                        : new Date(p.nextPaymentDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.isFullyPaid ? (
                        <Badge color="success" size="sm">
                          Customer Owned
                        </Badge>
                      ) : (
                        <Badge color="info" size="sm">
                          Active ({p.installmentsPaidCount}/{p.totalInstallmentsCount})
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
