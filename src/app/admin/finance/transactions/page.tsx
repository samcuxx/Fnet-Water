"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/badge/Badge";
import Input from "@/components/form/input/InputField";

interface TransactionItem {
  id: string;
  reference: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  channel: "MTN MoMo" | "Telecel Cash" | "AT Money" | "Card" | "Cash on Delivery";
  type: "19L Water Refill" | "Dispenser Installment" | "Dispenser Deposit" | "Takeaway Bottles";
  paidAt: string;
}

const mockTransactions: TransactionItem[] = [
  {
    id: "tx_001",
    reference: "PAY-GH-9901",
    customerName: "Kwesi Appiah",
    customerPhone: "0241000005",
    amount: 150.0,
    channel: "MTN MoMo",
    type: "Dispenser Installment",
    paidAt: "2026-11-08T10:45:00.000Z",
  },
  {
    id: "tx_002",
    reference: "PAY-GH-9902",
    customerName: "Dr. Mensah Clinic",
    customerPhone: "0208112233",
    amount: 150.0,
    channel: "MTN MoMo",
    type: "19L Water Refill",
    paidAt: "2026-11-08T09:12:00.000Z",
  },
  {
    id: "tx_003",
    reference: "PAY-GH-9903",
    customerName: "Grace Osei",
    customerPhone: "0277998877",
    amount: 50.0,
    channel: "Telecel Cash",
    type: "19L Water Refill",
    paidAt: "2026-11-07T16:30:00.000Z",
  },
  {
    id: "tx_004",
    reference: "PAY-GH-9904",
    customerName: "Zenith Bank Head Office",
    customerPhone: "0244112233",
    amount: 300.0,
    channel: "Card",
    type: "Dispenser Deposit",
    paidAt: "2026-11-07T14:15:00.000Z",
  },
  {
    id: "tx_005",
    reference: "PAY-GH-9905",
    customerName: "Kofi Owusu-Ansah",
    customerPhone: "0245667788",
    amount: 100.0,
    channel: "MTN MoMo",
    type: "19L Water Refill",
    paidAt: "2026-11-07T11:00:00.000Z",
  },
];

export default function AdminTransactionsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockTransactions.filter(
    (t) =>
      t.reference.toLowerCase().includes(search.toLowerCase()) ||
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.customerPhone.includes(search)
  );

  const totalRevenue = mockTransactions.reduce((acc, t) => acc + t.amount, 0);

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
              Real-time audit log of Mobile Money and card payments across Accra operations.
            </p>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-brand-600 font-medium block">Total Transactions</span>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {mockTransactions.length}
            </div>
            <span className="text-[11px] text-gray-400">100% verified receipts</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-emerald-600 font-medium block">Total Revenue</span>
            <div className="mt-1 text-2xl font-bold text-emerald-600">
              GH₵ {totalRevenue.toFixed(2)}
            </div>
            <span className="text-[11px] text-gray-400">Across MoMo and card channels</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-purple-600 font-medium block">Mobile Money Share</span>
            <div className="mt-1 text-2xl font-bold text-purple-600">
              88.5%
            </div>
            <span className="text-[11px] text-gray-400">MTN, Telecel &amp; AT Money</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-cyan-600 font-medium block">Payment Gateway</span>
            <div className="mt-1 text-2xl font-bold text-cyan-600">
              Active
            </div>
            <span className="text-[11px] text-gray-400">Automatic webhook verification</span>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Input
            type="text"
            placeholder="Search by reference code, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 text-xs"
          />
          <span className="text-xs text-gray-500">
            {filtered.length} verified transactions
          </span>
        </div>

        {/* Transactions Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 font-semibold bg-gray-50/50 dark:bg-gray-800/50">
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Reference Code</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Order / Service</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="py-3 px-4 text-gray-500 font-mono text-[11px]">
                    {new Date(t.paidAt).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-gray-900 dark:text-white">
                    {t.reference}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                      {t.customerName}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">{t.customerPhone}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {t.channel}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {t.type}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                    GH₵ {t.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Badge color="success" size="sm">
                      Confirmed
                    </Badge>
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
