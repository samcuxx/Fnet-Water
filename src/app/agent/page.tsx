"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import type { AgentStats } from "@/lib/referral-store";

export default function AgentDashboardPage() {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Onboard modal state
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custArea, setCustArea] = useState("");
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardError, setOnboardError] = useState<string | null>(null);
  const [onboardSuccess, setOnboardSuccess] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/agent/stats");
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load agent stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleCopy = () => {
    if (!stats) return;
    navigator.clipboard.writeText(stats.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardError(null);
    setIsOnboarding(true);

    try {
      const res = await fetch("/api/agent/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: custName,
          phone: custPhone,
          email: custEmail,
          deliveryArea: custArea,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setOnboardError(data.error || "Failed to onboard customer.");
        setIsOnboarding(false);
        return;
      }

      setOnboardSuccess(`Customer ${custName} registered successfully under your referral code!`);
      setIsOnboardModalOpen(false);
      setCustName("");
      setCustPhone("");
      setCustEmail("");
      setCustArea("");
      await loadStats();
    } catch {
      setOnboardError("Network error occurred.");
    } finally {
      setIsOnboarding(false);
    }
  };

  if (loading) {
    return (
      <AppLayout role="AGENT">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        </div>
      </AppLayout>
    );
  }

  const s = stats || {
    agentId: "usr_agent_001",
    agentName: "Kofi Mensah",
    agentCode: "FNW-AGENT-KOFI",
    referralLink: "http://localhost:3000/register?ref=FNW-AGENT-KOFI",
    totalOnboarded: 28,
    activeCustomers: 22,
    totalRefillsOrdered: 145,
    freeBottlesEarned: 6,
    totalCommissionGHS: 725.0,
    commissionBalanceGHS: 725.0,
    referees: [],
  };

  return (
    <AppLayout role="AGENT">
      <div className="space-y-6">
        {/* Success Alert */}
        {onboardSuccess && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span>{onboardSuccess}</span>
            <button
              onClick={() => setOnboardSuccess(null)}
              className="font-bold text-emerald-600 hover:text-emerald-800 ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Field Agent Portal &amp; Commissions
              </h1>
              <Badge color="warning" size="sm">
                Sales Agent
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Register customers on ground, track referee refills, and manage commissions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setOnboardError(null);
              setIsOnboardModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs self-start sm:self-auto cursor-pointer"
          >
            <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            <span>Register Customer On Ground</span>
          </button>
        </div>

        {/* Agent Share Link Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-brand-700 text-white shadow-theme-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200 block">
              Your Agent Referral Code
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-wider">
              {s.agentCode}
            </div>
            <p className="text-xs text-amber-100 max-w-lg">
              Earn GH₵ 5.00 cash commission on every refill bottle ordered by your registered customers, plus free bottles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={s.referralLink}
              className="w-56 sm:w-64 h-10 px-3 text-xs font-mono rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-amber-900 hover:bg-amber-50 transition shadow-sm whitespace-nowrap cursor-pointer"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        {/* 4 Agent KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
              Onboarded Customers
            </span>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {s.totalOnboarded}
            </div>
            <span className="text-[11px] text-gray-400">Total accounts registered</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-brand-600 dark:text-blue-light-400 font-medium block">
              Refill Orders Generated
            </span>
            <div className="mt-1 text-2xl font-bold text-brand-600 dark:text-blue-light-400">
              {s.totalRefillsOrdered}
            </div>
            <span className="text-[11px] text-gray-400">18.9L bottles ordered</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block">
              Free Bottles Earned
            </span>
            <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {s.freeBottlesEarned}
            </div>
            <span className="text-[11px] text-gray-400">5:1 Reward rule active</span>
          </div>

          <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20 shadow-theme-xs">
            <span className="text-xs text-amber-800 dark:text-amber-300 font-bold block">
              Commission Earned
            </span>
            <div className="mt-1 text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              GH₵ {s.totalCommissionGHS.toFixed(2)}
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-400">
              GH₵ 5.00 per refill bottle
            </span>
          </div>
        </div>

        {/* Referee Customer Accounts Table */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-theme-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Referred Customer Accounts ({s.referees.length})
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Customer refills ordered and commission tracking
              </p>
            </div>
            <Badge color="success" size="sm">
              GH₵ 5.00 / Bottle
            </Badge>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Onboarded</th>
                  <th className="py-2.5 px-3">Refills</th>
                  <th className="py-2.5 px-3 text-right">Commission Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {s.referees.map((ref) => (
                  <tr key={ref.id} className="hover:bg-gray-50/30">
                    <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">
                      {ref.customerName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-gray-500">
                      {ref.phone}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500">
                      {new Date(ref.onboardedDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-brand-600 dark:text-blue-light-400">
                      {ref.refillsCount} bottles
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      GH₵ {ref.commissionGHS.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: Register Customer On Ground */}
        <Modal
          isOpen={isOnboardModalOpen}
          onClose={() => setIsOnboardModalOpen(false)}
          title="Onboard Customer on Ground"
        >
          {onboardError && (
            <div className="p-3 mb-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300">
              {onboardError}
            </div>
          )}

          <form onSubmit={handleOnboardSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Customer Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kwame Adjei"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 0244123456"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. kwame@gmail.com"
                value={custEmail}
                onChange={(e) => setCustEmail(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Delivery Area / Street
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Near Shell Station, Spintex"
                value={custArea}
                onChange={(e) => setCustArea(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
              The customer will automatically be bound to your referral code (<strong>{s.agentCode}</strong>). You will earn GH₵ 5.00 on every refill they order!
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsOnboardModalOpen(false)}
                className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isOnboarding}
                className="px-4 py-2 font-bold text-white bg-brand-500 hover:bg-brand-600 rounded-lg shadow-theme-xs disabled:opacity-50 cursor-pointer"
              >
                {isOnboarding ? "Registering..." : "Complete Registration"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
