"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { Modal } from "@/components/ui/Modal";
import type { StoredTransaction } from "@/lib/transaction-store";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<StoredTransaction[]>([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    momoRevenue: 0,
    cardRevenue: 0,
    todayRevenue: 0,
    totalTransactions: 0,
    successfulCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [selectedTx, setSelectedTx] = useState<StoredTransaction | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (channelFilter !== "ALL") params.set("channel", channelFilter);
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error("Failed to load admin transactions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [channelFilter, typeFilter, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getChannelBadge = (ch: string) => {
    switch (ch) {
      case "MTN_MOMO":
        return <Badge color="warning" size="sm">MTN MoMo</Badge>;
      case "TELECEL_CASH":
        return <Badge color="error" size="sm">Telecel Cash</Badge>;
      case "AT_MONEY":
        return <Badge color="info" size="sm">AT Money</Badge>;
      case "CARD":
        return <Badge color="primary" size="sm">Card</Badge>;
      default:
        return <Badge color="dark" size="sm">Cash</Badge>;
    }
  };

  return (
    <AppLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Payment Transactions &amp; Revenue
              </h1>
              <Badge color="primary" size="sm">
                Finance
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Real-time audit log of Mobile Money, card, and cash settlements across operations.
            </p>
          </div>
        </div>

        {/* 4 Financial KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-brand-600 dark:text-blue-light-400 font-medium block">
              Total Collections
            </span>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              GH₵ {metrics.totalRevenue.toFixed(2)}
            </div>
            <span className="text-[11px] text-gray-400">
              {metrics.successfulCount} successful payments
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium block">
              Mobile Money Volume
            </span>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              GH₵ {metrics.momoRevenue.toFixed(2)}
            </div>
            <span className="text-[11px] text-gray-400">
              MTN, Telecel &amp; AT Money
            </span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium block">
              Card Payments
            </span>
            <div className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
              GH₵ {metrics.cardRevenue.toFixed(2)}
            </div>
            <span className="text-[11px] text-gray-400">Visa &amp; Mastercard</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block">
              Today&apos;s Collections
            </span>
            <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              GH₵ {metrics.todayRevenue.toFixed(2)}
            </div>
            <span className="text-[11px] text-gray-400">Settled within past 24h</span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <Input
              type="text"
              placeholder="Search reference (FNW-TX-...), customer, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <Select
              options={[
                { value: "ALL", label: "All Payment Channels" },
                { value: "MTN_MOMO", label: "MTN Mobile Money" },
                { value: "TELECEL_CASH", label: "Telecel Cash" },
                { value: "AT_MONEY", label: "AT Money" },
                { value: "CARD", label: "Debit/Credit Card" },
                { value: "CASH_ON_DELIVERY", label: "Cash on Delivery" },
              ]}
              value={channelFilter}
              onChange={(val) => setChannelFilter(val)}
              className="text-xs"
            />
          </div>

          <div>
            <Select
              options={[
                { value: "ALL", label: "All Service Types" },
                { value: "WATER_ORDER", label: "19L Refill Orders" },
                { value: "DISPENSER_INSTALLMENT", label: "Dispenser Installments" },
                { value: "DISPENSER_DEPOSIT", label: "Dispenser Deposits" },
              ]}
              value={typeFilter}
              onChange={(val) => setTypeFilter(val)}
              className="text-xs"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading live financial ledger...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No transactions match your search or filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 font-semibold bg-gray-50/50 dark:bg-gray-800/50">
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Reference Code</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Service Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {transactions.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition cursor-pointer"
                      onClick={() => setSelectedTx(t)}
                    >
                      <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                        {new Date(t.paidAt).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white">
                        {t.reference}
                        {t.orderNumber && (
                          <span className="block text-[10px] text-gray-400 font-normal">
                            Order: {t.orderNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                          {t.customerName}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono">{t.customerPhone}</span>
                      </td>
                      <td className="py-3 px-4">{getChannelBadge(t.channel)}</td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300 font-medium">
                        {t.type === "DISPENSER_INSTALLMENT"
                          ? "Dispenser Installment"
                          : t.type === "DISPENSER_DEPOSIT"
                          ? "Dispenser Deposit"
                          : "19L Refill Delivery"}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        GH₵ {t.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {t.status === "PAID" ? (
                          <Badge color="success" size="sm">Confirmed</Badge>
                        ) : t.status === "UNPAID" ? (
                          <Badge color="warning" size="sm">Pending</Badge>
                        ) : (
                          <Badge color="error" size="sm">{t.status}</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTx(t);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg text-brand-600 dark:text-blue-light-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL: Transaction Details Audit */}
        <Modal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title={`Transaction Audit: ${selectedTx?.reference}`}
        >
          {selectedTx && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Gross Settlement Amount:</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    GH₵ {selectedTx.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Payment Status:</span>
                  {selectedTx.status === "PAID" ? (
                    <Badge color="success" size="sm">Settled • Verified</Badge>
                  ) : (
                    <Badge color="warning" size="sm">Pending</Badge>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Channel / Network:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {selectedTx.channel.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer Name:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedTx.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer Phone:</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">
                    {selectedTx.customerPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Timestamp:</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">
                    {new Date(selectedTx.paidAt).toLocaleString("en-GB")}
                  </span>
                </div>
                {selectedTx.orderNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Associated Order:</span>
                    <span className="font-mono text-brand-600 font-bold">
                      {selectedTx.orderNumber}
                    </span>
                  </div>
                )}
              </div>

              {selectedTx.metadata && Object.keys(selectedTx.metadata).length > 0 && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                  <span className="text-[11px] font-bold text-gray-400 block mb-1">
                    System Audit Metadata:
                  </span>
                  <pre className="text-[10px] font-mono text-gray-600 dark:text-gray-300 overflow-x-auto">
                    {JSON.stringify(selectedTx.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-brand-500 hover:bg-brand-600 transition shadow-theme-xs cursor-pointer"
                >
                  Close Audit
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}
