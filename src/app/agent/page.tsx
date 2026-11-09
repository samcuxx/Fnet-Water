"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/Badge";

export default function AgentDashboardPage() {
  const [copied, setCopied] = useState(false);
  const referralCode = "FNW-AGENT-KOFI";
  const referralLink = `http://localhost:3000/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout role="AGENT">
      <div className="space-y-6">
        <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Sales Agent &amp; Referral Hub
            </h1>
            <Badge color="warning" variant="light" size="sm">
              Agent Portal
            </Badge>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Track customer onboarding, monitor the 5:1 bottle reward engine, and view commissions.
          </p>
        </div>

        {/* Share Referral Link Banner */}
        <div className="bg-brand-50/80 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-blue-light-400">
              Your Referral Link
            </span>
            <div className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 font-mono">
              {referralCode}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Share with residential estates, offices, and clinics to earn free bottles and commissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="h-9 px-3 text-xs font-mono rounded-lg border border-brand-200 dark:border-brand-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-52 sm:w-64"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 h-9 rounded-lg text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 transition shadow-theme-xs whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* Agent Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-theme-xs">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Onboarded Customers
            </span>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              28
            </div>
            <span className="mt-1 inline-block text-xs text-green-600 dark:text-green-400 font-medium">
              +4 this month
            </span>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-theme-xs">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Refills Ordered by Referees
            </span>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              145 Bottles
            </div>
            <span className="mt-1 inline-block text-xs text-brand-600 dark:text-brand-400 font-medium">
              5:1 Reward rule active
            </span>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-theme-xs">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Free Bottle Credits
            </span>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              6 Bottles
            </div>
            <span className="mt-1 inline-block text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Ready to redeem
            </span>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-theme-xs">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Commission Earned
            </span>
            <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              GH₵ 725.00
            </div>
            <span className="mt-1 inline-block text-xs text-green-600 dark:text-green-400 font-medium">
              MoMo payout available
            </span>
          </div>
        </div>

        {/* Referred Customers Table */}
        <ComponentCard title="Recent Referee Orders">
          <div className="space-y-3">
            {[
              {
                customer: "Emmanuel Quaye",
                refills: 12,
                lastOrder: "Today, 10:30 AM",
                commission: "GH₵ 36.00",
              },
              {
                customer: "Akua Konadu Law Chambers",
                refills: 20,
                lastOrder: "Yesterday",
                commission: "GH₵ 60.00",
              },
              {
                customer: "Samuel Danquah",
                refills: 5,
                lastOrder: "3 Nov 2026",
                commission: "GH₵ 15.00 (+1 Free Bottle)",
              },
            ].map((referee, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-xs"
              >
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {referee.customer}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                    {referee.refills} refills purchased • Last order: {referee.lastOrder}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {referee.commission}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ComponentCard>
      </div>
    </AppLayout>
  );
}
