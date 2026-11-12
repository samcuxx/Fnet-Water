"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Copy, Check, MessageCircle, Gift, Users, Droplet } from "lucide-react";
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

  if (loading) {
    return (
      <AppLayout role="CUSTOMER">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
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
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300">
            <span>{redeemFeedback}</span>
            <button
              onClick={() => setRedeemFeedback(null)}
              className="font-bold text-emerald-600 hover:text-emerald-800 cursor-pointer p-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* Breadcrumbs & Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Invite Friends &amp; Earn Free Water
              </h1>
              <Badge color="primary" size="sm">
                5:1 Reward Rule
              </Badge>
            </div>
            <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
              For every 5 friends who order water through your link, receive 1 free 18.9L refill bottle.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: "/customer" },
                { label: "Referrals" },
              ]}
            />
            <Button asChild size="sm">
              <Link href="/customer/order">
                <span>Order Water Refill</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero Share Banner */}
        <Card className="p-6 bg-gradient-to-r from-primary to-blue-light-600 text-white flex flex-col md:flex-row md:items-center justify-between gap-5 border-none shadow-sm">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider font-bold text-white/80 block">
              Your Personal Referral Code
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-wider text-white">
              {s.referralCode}
            </div>
            <p className="text-xs text-white/90 max-w-lg">
              Share your link with family, neighbors, or colleagues. When they complete their first order, you earn points toward free bottles.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <input
              type="text"
              readOnly
              value={s.referralLink}
              className="h-10 w-full sm:w-64 rounded-lg bg-white/15 border border-white/25 px-3 text-xs font-mono text-white placeholder-white/50 focus:outline-hidden"
            />
            <Button
              type="button"
              onClick={handleCopy}
              className="bg-white text-primary hover:bg-white/90 font-bold text-xs shrink-0"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              <span>{copied ? "Copied!" : "Copy Link"}</span>
            </Button>
            <Button
              type="button"
              onClick={handleWhatsAppShare}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0"
            >
              <MessageCircle className="size-3.5" />
              <span>WhatsApp</span>
            </Button>
          </div>
        </Card>

        {/* 4 Metric Cards (NextAdmin Pro Style) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
          <Card beamIndex={0}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-text-secondary">
                  Friends Invited
                </span>
                <h3 className="mt-1 text-lg font-bold text-text-primary sm:text-2xl lg:text-3xl">
                  {s.totalInvited}
                </h3>
              </div>
              <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-blue-light-100 text-primary dark:bg-blue-light-950/60 dark:text-blue-light-400">
                <Users className="size-4 sm:size-5" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-text-tertiary">Sign-ups through your link</p>
          </Card>

          <Card beamIndex={5}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-text-secondary">
                  Completed First Order
                </span>
                <h3 className="mt-1 text-lg font-bold text-primary sm:text-2xl lg:text-3xl">
                  {s.qualifiedCount}
                </h3>
              </div>
              <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
                <Check className="size-4 sm:size-5" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-text-tertiary">{s.pendingCount} pending first delivery</p>
          </Card>

          <Card beamIndex={1}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-text-secondary">
                  Free Bottles Earned
                </span>
                <h3 className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400 sm:text-2xl lg:text-3xl">
                  {s.freeBottlesEarned}
                </h3>
              </div>
              <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Gift className="size-4 sm:size-5" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-text-tertiary">Total 18.9L bottles rewarded</p>
          </Card>

          <Card beamIndex={4} className="flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Available Credits
                </span>
                <h3 className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400 sm:text-2xl lg:text-3xl">
                  {s.freeBottleBalance} {s.freeBottleBalance === 1 ? "Bottle" : "Bottles"}
                </h3>
              </div>
              <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Droplet className="size-4 sm:size-5" />
              </div>
            </div>
            {s.freeBottleBalance > 0 && (
              <Button asChild size="sm" className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                <Link href="/customer/order">
                  Use Free Bottle
                </Link>
              </Button>
            )}
          </Card>
        </div>

        {/* 7 / 5 Grid Split: How It Works & History vs ApexCharts Gauge */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Left Column (7 cols): How It Works + Referrals History Table */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {/* 3 Step Visual Cards */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                How to Earn Free Water in 3 Steps
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl bg-background-gray-secondary p-4 space-y-1.5 border border-card-border">
                  <div className="size-6 rounded-md bg-primary text-white font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <strong className="block text-text-primary pt-1">Share Your Link</strong>
                  <p className="text-text-tertiary">Send your personal referral link to friends, neighbors, or coworkers.</p>
                </div>

                <div className="rounded-xl bg-background-gray-secondary p-4 space-y-1.5 border border-card-border">
                  <div className="size-6 rounded-md bg-primary text-white font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <strong className="block text-text-primary pt-1">They Order Water</strong>
                  <p className="text-text-tertiary">When they receive their first bottle delivery, they count as completed.</p>
                </div>

                <div className="rounded-xl bg-background-gray-secondary p-4 space-y-1.5 border border-card-border">
                  <div className="size-6 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <strong className="block text-text-primary pt-1">Get Free Bottles</strong>
                  <p className="text-text-tertiary">Every 5 completed friends automatically awards you 1 free refill bottle.</p>
                </div>
              </div>
            </Card>

            {/* Referrals History Table */}
            <Card className="overflow-hidden p-0">
              <div className="p-5 border-b border-card-border flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text-primary">
                    Your Referred Friends ({s.referees.length})
                  </h3>
                  <p className="text-xs text-text-tertiary">
                    Record of everyone who registered with your link
                  </p>
                </div>
                <Badge color="cyan" size="sm">
                  {s.qualifiedCount} Qualified
                </Badge>
              </div>

              {s.referees.length === 0 ? (
                <div className="p-8 text-center text-xs text-text-tertiary">
                  No one has signed up with your link yet. Share your code to get started!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <TableRoot>
                    <TableHeader>
                      <TableRow className="border-b border-card-border bg-background-gray-secondary/50">
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">Friend</TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">Date Joined</TableHead>
                        <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase text-right">Reward Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-card-border">
                      {s.referees.map((ref) => (
                        <TableRow key={ref.id} className="hover:bg-background-gray-secondary/30 transition">
                          <TableCell className="px-5 py-4">
                            <span className="font-semibold text-xs text-text-primary block">
                              {ref.name}
                            </span>
                            <span className="text-[11px] text-text-tertiary font-mono">{ref.phone}</span>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-xs text-text-tertiary">
                            {new Date(ref.joinedDate).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-right">
                            {ref.isQualified ? (
                              <Badge color="success" size="sm">
                                Completed First Order
                              </Badge>
                            ) : (
                              <Badge color="warning" size="sm">
                                Awaiting First Order
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </TableRoot>
                </div>
              )}
            </Card>
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
