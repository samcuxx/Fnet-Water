"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Card } from "@/components/tailgrids/core/card";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { Modal } from "@/components/ui/Modal";
import { SkeletonMetrics, SkeletonTable } from "@/components/ui/skeleton";
import { SearchIcon } from "@/components/common/header/icons";
import type { StoredTransaction } from "@/lib/transaction-store";
import {
  DollarSign,
  Smartphone,
  CreditCard,
  Clock,
  CheckCircle2,
} from "lucide-react";

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
        return <Badge color="cyan" size="sm">AT Money</Badge>;
      case "CARD":
        return <Badge color="primary" size="sm">Card</Badge>;
      default:
        return <Badge color="neutral" size="sm">Cash</Badge>;
    }
  };

  return (
    <AppLayout role="ADMIN">
      <div className="space-y-6">
        {/* Breadcrumbs & Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Payment Transactions &amp; Revenue
              </h1>
              <Badge color="primary" size="sm">
                Finance Ledger
              </Badge>
            </div>
            <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
              Real-time audit log of Mobile Money, card, and cash settlements across operations.
            </p>
          </div>
          <div>
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: "/admin" },
                { label: "Transactions" },
              ]}
            />
          </div>
        </div>

        {/* 4 Financial KPI Cards (NextAdmin Pro Style) */}
        {isLoading ? (
          <SkeletonMetrics count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
            {/* Card 1: Total Collections */}
            <Card beamIndex={0}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-text-secondary">
                    Total Collections
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-text-primary sm:text-2xl lg:text-3xl">
                    GH₵ {metrics.totalRevenue.toFixed(2)}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-blue-light-100 text-primary dark:bg-blue-light-950/60 dark:text-blue-light-400">
                  <DollarSign className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">
                {metrics.successfulCount} successful payments
              </p>
            </Card>

            {/* Card 2: Mobile Money Volume */}
            <Card beamIndex={3}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Mobile Money Volume
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-amber-600 dark:text-amber-400 sm:text-2xl lg:text-3xl">
                    GH₵ {metrics.momoRevenue.toFixed(2)}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <Smartphone className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">
                MTN, Telecel &amp; AT Money
              </p>
            </Card>

            {/* Card 3: Card Payments */}
            <Card beamIndex={2}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-text-secondary">
                    Card Payments
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-text-primary sm:text-2xl lg:text-3xl">
                    GH₵ {metrics.cardRevenue.toFixed(2)}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <CreditCard className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">Visa &amp; Mastercard settlements</p>
            </Card>

            {/* Card 4: Today's Collections */}
            <Card beamIndex={1}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Today&apos;s Collections
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400 sm:text-2xl lg:text-3xl">
                    GH₵ {metrics.todayRevenue.toFixed(2)}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Clock className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">Settled within past 24h</p>
            </Card>
          </div>
        )}

        {/* Filters & Search Bar */}
        <Card className="p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <InputGroup>
                <InputGroupAddon className="text-icon-secondary">
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  type="text"
                  placeholder="Search reference (FNW-TX-...), customer, or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-xs"
                />
              </InputGroup>
            </div>

            <div>
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                aria-label="Filter by payment channel"
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition cursor-pointer"
              >
                <option value="ALL">All Payment Channels</option>
                <option value="MTN_MOMO">MTN Mobile Money</option>
                <option value="TELECEL_CASH">Telecel Cash</option>
                <option value="AT_MONEY">AT Money</option>
                <option value="CARD">Debit/Credit Card</option>
                <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
              </select>
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filter by service type"
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition cursor-pointer"
              >
                <option value="ALL">All Service Types</option>
                <option value="WATER_ORDER">19L Refill Orders</option>
                <option value="DISPENSER_INSTALLMENT">Dispenser Installments</option>
                <option value="DISPENSER_DEPOSIT">Dispenser Deposits</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Transactions Table */}
        {isLoading ? (
          <SkeletonTable rows={6} columns={8} />
        ) : transactions.length === 0 ? (
          <Card className="p-12 text-center text-xs text-text-tertiary">
            No transactions match your search or filters.
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <TableRoot>
                <TableHeader>
                  <TableRow className="border-b border-card-border bg-background-gray-secondary/50">
                    <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                      Date &amp; Time
                    </TableHead>
                    <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                      Reference Code
                    </TableHead>
                    <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                      Customer
                    </TableHead>
                    <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                      Channel
                    </TableHead>
                    <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                      Service Type
                    </TableHead>
                    <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                      Amount
                    </TableHead>
                    <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                      Status
                    </TableHead>
                    <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-card-border">
                  {transactions.map((t) => (
                    <TableRow
                      key={t.id}
                      className="hover:bg-background-gray-secondary/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedTx(t)}
                    >
                      <TableCell className="px-5 py-4 font-mono text-xs text-text-tertiary">
                        {new Date(t.paidAt).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </TableCell>
                      <TableCell className="px-5 py-4 font-mono font-bold text-xs text-text-primary">
                        {t.reference}
                        {t.orderNumber && (
                          <span className="block text-[11px] text-text-tertiary font-normal">
                            Order: {t.orderNumber}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <span className="font-semibold text-xs text-text-primary block">
                          {t.customerName}
                        </span>
                        <span className="text-[11px] text-text-tertiary font-mono">{t.customerPhone}</span>
                      </TableCell>
                      <TableCell className="px-5 py-4">{getChannelBadge(t.channel)}</TableCell>
                      <TableCell className="px-5 py-4 text-xs text-text-secondary font-medium">
                        {t.type === "DISPENSER_INSTALLMENT"
                          ? "Dispenser Installment"
                          : t.type === "DISPENSER_DEPOSIT"
                          ? "Dispenser Deposit"
                          : "19L Refill Delivery"}
                      </TableCell>
                      <TableCell className="px-5 py-4 font-bold text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                        GH₵ {t.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        {t.status === "PAID" ? (
                          <Badge color="success" size="sm">Confirmed</Badge>
                        ) : t.status === "UNPAID" ? (
                          <Badge color="warning" size="sm">Pending</Badge>
                        ) : (
                          <Badge color="error" size="sm">{t.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right">
                        <Button
                          appearance="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTx(t);
                          }}
                          className="text-xs font-semibold"
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableRoot>
            </div>
          </Card>
        )}

        {/* MODAL: Transaction Details Audit */}
        <Modal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title={`Transaction Audit: ${selectedTx?.reference}`}
        >
          {selectedTx && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-background-gray-secondary p-4 space-y-2 border border-card-border">
                <div className="flex justify-between items-center">
                  <span className="text-text-tertiary">Gross Settlement Amount:</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    GH₵ {selectedTx.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-tertiary">Payment Status:</span>
                  {selectedTx.status === "PAID" ? (
                    <Badge color="success" size="sm">Settled • Verified</Badge>
                  ) : (
                    <Badge color="warning" size="sm">Pending</Badge>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-tertiary">Channel / Network:</span>
                  <span className="font-semibold text-text-primary">
                    {selectedTx.channel.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-card-border pt-4">
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Customer Name:</span>
                  <span className="font-semibold text-text-primary">
                    {selectedTx.customerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Customer Phone:</span>
                  <span className="font-mono text-text-secondary">
                    {selectedTx.customerPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary">Payment Timestamp:</span>
                  <span className="font-mono text-text-secondary">
                    {new Date(selectedTx.paidAt).toLocaleString("en-GB")}
                  </span>
                </div>
                {selectedTx.orderNumber && (
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Associated Order:</span>
                    <span className="font-mono text-primary font-bold">
                      {selectedTx.orderNumber}
                    </span>
                  </div>
                )}
              </div>

              {selectedTx.metadata && Object.keys(selectedTx.metadata).length > 0 && (
                <div className="rounded-xl bg-background-gray-secondary p-3 border border-card-border">
                  <span className="text-[11px] font-bold text-text-tertiary block mb-1">
                    System Audit Metadata:
                  </span>
                  <pre className="text-[10px] font-mono text-text-secondary overflow-x-auto">
                    {JSON.stringify(selectedTx.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-card-border">
                <Button
                  size="sm"
                  onClick={() => setSelectedTx(null)}
                >
                  Close Audit
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}
