"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ComponentCard from "@/components/common/ComponentCard";
import Badge from "@/components/ui/Badge";

export default function AgentDashboardPage() {
  const [copied, setCopied] = useState(false);
  const referralCode = "FNW-AGENT-KOFI";
  const [referralLink, setReferralLink] = useState(`/register?ref=${referralCode}`);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setReferralLink(`${window.location.origin}/register?ref=${referralCode}`);
    }
  }, [referralCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout role="AGENT">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                Sales Agent &amp; Referral Hub
              </h1>
              <Badge color="warning" size="sm">
                Agent Portal
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Track customer onboarding, monitor the 5:1 bottle reward engine, and view commissions.
            </p>
          </div>
        </div>

        {/* Share Referral Link Banner */}
        <div className="bg-brand-50/60 dark:bg-brand-500/10 border border-brand-200/80 dark:border-brand-500/20 p-5 sm:p-6 rounded-[28px] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-sky-400">
              Your Referral Link
            </span>
            <div className="text-lg font-black text-gray-900 dark:text-white mt-1 font-mono">
              {referralCode}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md">
              Share with residential estates, offices, and clinics to earn free bottles and commissions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="h-10 px-3.5 text-xs font-mono rounded-2xl border border-brand-200 dark:border-brand-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 w-52 sm:w-64 shadow-2xs"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 h-10 rounded-2xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 transition shadow-xs whitespace-nowrap cursor-pointer"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* Agent Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-900/70 border border-gray-100 dark:border-gray-800/80 p-5 sm:p-6 rounded-[28px] shadow-xs">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
              Onboarded Customers
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              28
            </div>
            <span className="mt-1 inline-block text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              +4 this month
            </span>
          </div>

          <div className="bg-white dark:bg-gray-900/70 border border-gray-100 dark:border-gray-800/80 p-5 sm:p-6 rounded-[28px] shadow-xs">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
              Refills Ordered by Referees
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-brand-600 dark:text-sky-400">
              145 Bottles
            </div>
            <span className="mt-1 inline-block text-xs text-brand-600 dark:text-sky-400 font-medium">
              5:1 Reward rule active
            </span>
          </div>

          <div className="bg-white dark:bg-gray-900/70 border border-gray-100 dark:border-gray-800/80 p-5 sm:p-6 rounded-[28px] shadow-xs">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
              Free Bottle Credits
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              6 Bottles
            </div>
            <span className="mt-1 inline-block text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Ready to redeem
            </span>
          </div>

          <div className="bg-white dark:bg-gray-900/70 border border-gray-100 dark:border-gray-800/80 p-5 sm:p-6 rounded-[28px] shadow-xs">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block">
              Commission Earned
            </span>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              GH₵ 725.00
            </div>
            <span className="mt-1 inline-block text-xs text-emerald-600 dark:text-emerald-400 font-medium">
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
                className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60 bg-gray-50/60 dark:bg-gray-800/30 text-xs"
              >
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {referee.customer}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                    {referee.refills} refills purchased • Last order: {referee.lastOrder}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
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
