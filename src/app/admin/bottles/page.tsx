"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/form/input/InputField";
import type { BottleExchangeRecord } from "@/lib/dispatch-store";

export default function AdminBottlesPage() {
  const [exchanges, setExchanges] = useState<BottleExchangeRecord[]>([]);
  const [summary, setSummary] = useState({
    totalExchanges: 0,
    totalFilledDelivered: 0,
    totalEmptyCollected: 0,
    totalDamaged: 0,
    totalCashCollected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/bottles");
      if (res.ok) {
        const d = await res.json();
        setExchanges(d.data || []);
        if (d.summary) setSummary(d.summary);
      }
    } catch (err) {
      console.error("Failed to load bottle exchanges:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = exchanges.filter((e) =>
    e.id.toLowerCase().includes(search.toLowerCase()) ||
    e.deliveryId.toLowerCase().includes(search.toLowerCase()) ||
    (e.customerNotes && e.customerNotes.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Bottle Exchanges &amp; Returns Log
              </h1>
              <Badge color="primary" size="sm">
                Executive
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Audit log of empty bottle returns, filled deliveries, and damaged units recorded by van drivers.
            </p>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-brand-600 font-medium block">Bottles Delivered</span>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {summary.totalFilledDelivered}
            </div>
            <span className="text-[11px] text-gray-400">Filled 18.9L bottles</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-cyan-600 font-medium block">Empty Bottles Collected</span>
            <div className="mt-1 text-2xl font-bold text-cyan-600">
              {summary.totalEmptyCollected}
            </div>
            <span className="text-[11px] text-gray-400">Returned from customers</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-amber-600 font-medium block">Damaged Bottles</span>
            <div className="mt-1 text-2xl font-bold text-amber-600">
              {summary.totalDamaged}
            </div>
            <span className="text-[11px] text-gray-400">Cracked or decommissioned</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-emerald-600 font-medium block">Cash Collected</span>
            <div className="mt-1 text-2xl font-bold text-emerald-600">
              GH₵ {summary.totalCashCollected.toFixed(2)}
            </div>
            <span className="text-[11px] text-gray-400">Point-of-delivery cash</span>
          </div>
        </div>

        {/* Table Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Input
            type="text"
            placeholder="Search exchanges by record ID, stop, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 text-xs"
          />
          <span className="text-xs text-gray-500">
            {filtered.length} exchange records
          </span>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 font-semibold bg-gray-50/50 dark:bg-gray-800/50">
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Record ID</th>
                <th className="py-3 px-4">Bottles Delivered</th>
                <th className="py-3 px-4">Empties Returned</th>
                <th className="py-3 px-4">Damaged</th>
                <th className="py-3 px-4">Cash Collected</th>
                <th className="py-3 px-4">Customer Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                    {new Date(e.createdAt).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-gray-900 dark:text-white">
                    {e.id}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {e.filledDelivered} Bottles
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-cyan-600">
                      {e.emptyCollected} Empties
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {e.damagedCount > 0 ? (
                      <span className="font-bold text-amber-600">{e.damagedCount}</span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                    {e.cashCollected > 0 ? `GH₵ ${e.cashCollected.toFixed(2)}` : "-"}
                  </td>
                  <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                    {e.customerNotes || "Standard exchange signoff"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
