"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import ReferralProgressGauge from "@/components/referral/ReferralProgressGauge";
import type { CustomerReferralStats } from "@/lib/referral-store";

export default function CustomerReferralsPage() {
  const [stats, setStats] = useState<CustomerReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [redeemFeedback, setRedeemFeedback] = useState<string | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/customer/referrals");
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load referral stats:", err);
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

  const handleWhatsAppShare = () => {
    if (!stats) return;
    const text = encodeURIComponent(
      `Hello! Order fresh 18.9L pure water delivered to your doorstep with F Net Water Hub. Use my link to get started: ${stats.referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleRedeem = async () => {
    setIsRedeeming(true);
    setRedeemFeedback(null);
    try {
      const res = await fetch("/api/customer/referrals/redeem", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setRedeemFeedback("1 Free Refill Bottle Credit redeemed! You can place an order now.");
        await loadStats();
      } else {
        setRedeemFeedback(data.error || "Cannot redeem credit.");
      }
    } catch {
      setRedeemFeedback("Network error redeeming credit.");
    } finally {
      setIsRedeeming(false);
    }
  };

  if (loading) {
    return (
      <AppLayout role="CUSTOMER">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
        </div>
      </AppLayout>
    );
  }

  const s = stats || {
    referralCode: "FNW-AMA01",
    referralLink: "http://localhost:3000/register?ref=FNW-AMA01",
    totalInvited: 0,
    qualifiedCount: 0,
    pendingCount: 0,
    freeBottlesEarned: 0,
    freeBottleBalance: 0,
    progressTowardsNext: 0,
    progressPercent: 0,
    referees: [],
  };

  return (
    <AppLayout role="CUSTOMER">
      <div className="space-y-6">
        {/* Feedback alert */}
        {redeemFeedback && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <span>{redeemFeedback}</span>
            <button
              onClick={() => setRedeemFeedback(null)}
              className="font-bold text-emerald-600 hover:text-emerald-800 ml-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Invite Friends &amp; Earn Free Water
              </h1>
              <Badge color="success" size="sm">
                5:1 Reward Rule
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              For every 5 friends who order water through your link, get 1 free 18.9L refill bottle.
            </p>
          </div>

          <Link
            href="/customer/order"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs self-start sm:self-auto cursor-pointer"
          >
            <span>Order Water Refill</span>
          </Link>
        </div>

        {/* Hero Share Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-brand-600 to-sky-600 text-white shadow-theme-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-200 block">
              Your Personal Referral Code
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-wider">
              {s.referralCode}
            </div>
            <p className="text-xs text-sky-100 max-w-lg">
              Share your link with family, neighbors, or your office. When they place their first order, you get 1 step closer to free water.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <input
                type="text"
                readOnly
                value={s.referralLink}
                className="w-full sm:w-64 h-10 px-3 text-xs font-mono rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-hidden"
              />
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-white text-brand-700 hover:bg-sky-50 transition shadow-sm whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5"
            >
              <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
              </svg>
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </button>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white transition shadow-sm whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5"
            >
              <svg className="size-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
              </svg>
              <span>Share on WhatsApp</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium block">
              Friends Invited
            </span>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {s.totalInvited}
            </div>
            <span className="text-[11px] text-gray-400">Total sign-ups via link</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-brand-600 dark:text-blue-light-400 font-medium block">
              Completed First Order
            </span>
            <div className="mt-1 text-2xl font-bold text-brand-600 dark:text-blue-light-400">
              {s.qualifiedCount}
            </div>
            <span className="text-[11px] text-gray-400">{s.pendingCount} pending first order</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium block">
              Free Bottles Earned
            </span>
            <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {s.freeBottlesEarned}
            </div>
            <span className="text-[11px] text-gray-400">From 5:1 reward rules</span>
          </div>

          <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-theme-xs flex flex-col justify-between">
            <div>
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-bold block">
                Available to Spend
              </span>
              <div className="mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {s.freeBottleBalance} {s.freeBottleBalance === 1 ? "Bottle" : "Bottles"}
              </div>
            </div>

            {s.freeBottleBalance > 0 && (
              <Link
                href="/customer/order"
                className="mt-2 text-center py-1.5 px-3 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition"
              >
                Use Free Bottle
              </Link>
            )}
          </div>
        </div>

        {/* 7 / 5 Grid Split: How It Works & History vs ApexCharts Gauge */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Left Column (7 cols): How It Works + Referrals History Table */}
          <div className="col-span-12 lg:col-span-7 space-y-5">
            {/* 3 Step Visual Cards */}
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                How to Earn Free Water in 3 Steps
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-1">
                  <div className="size-6 rounded-lg bg-brand-500 text-white font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <strong className="block text-gray-900 dark:text-white pt-1">Share Your Link</strong>
                  <p className="text-gray-500 dark:text-gray-400">Send your code or link to friends, family, and colleagues.</p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-1">
                  <div className="size-6 rounded-lg bg-brand-500 text-white font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <strong className="block text-gray-900 dark:text-white pt-1">They Order Water</strong>
                  <p className="text-gray-500 dark:text-gray-400">When they order their first water delivery, they count as completed.</p>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-1">
                  <div className="size-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <strong className="block text-gray-900 dark:text-white pt-1">Get Free Bottles</strong>
                  <p className="text-gray-500 dark:text-gray-400">Every 5 completed friends automatically adds 1 free refill bottle credit.</p>
                </div>
              </div>
            </div>

            {/* Referrals History Table */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-theme-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Your Referred Friends ({s.referees.length})
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Live record of everyone who signed up using your link
                  </p>
                </div>
                <Badge color="info" size="sm">
                  {s.qualifiedCount} Qualified
                </Badge>
              </div>

              {s.referees.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No one has signed up with your link yet. Share your code to get started!
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 border-b border-gray-100 dark:border-gray-800">
                      <tr>
                        <th className="py-2.5 px-3">Friend</th>
                        <th className="py-2.5 px-3">Date Joined</th>
                        <th className="py-2.5 px-3 text-right">Reward Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {s.referees.map((ref) => (
                        <tr key={ref.id} className="hover:bg-gray-50/30">
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-gray-900 dark:text-white block">
                              {ref.name}
                            </span>
                            <span className="text-[11px] text-gray-400 font-mono">{ref.phone}</span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-500">
                            {new Date(ref.joinedDate).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {ref.isQualified ? (
                              <Badge color="success" size="sm">
                                Completed First Order
                              </Badge>
                            ) : (
                              <Badge color="warning" size="sm">
                                Awaiting First Order
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): ApexCharts 5:1 Radial Progress Gauge */}
          <div className="col-span-12 lg:col-span-5">
            <ReferralProgressGauge
              progressTowardsNext={s.progressTowardsNext}
              freeBottlesEarned={s.freeBottlesEarned}
              freeBottleBalance={s.freeBottleBalance}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
