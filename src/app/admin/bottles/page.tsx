"use client";

import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/tailgrids/core/badge";
import Breadcrumbs from "@/components/tailgrids/core/breadcrumbs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/tailgrids/core/input-group";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { SkeletonMetrics, SkeletonTable } from "@/components/ui/skeleton";
import type { BottleExchangeRecord } from "@/lib/dispatch-store";
import { SearchIcon } from "@/components/common/header/icons";
import { InvoiceIcon, TableIcon, TaskIcon, Widget4Icon } from "@/components/common/sidebar/icon";
import React, { useCallback, useEffect, useState } from "react";

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
      <div className="mt-4 space-y-6 px-2 lg:px-4">
        {/* NextAdmin Page Header */}
        <div>
          <div className="mb-2">
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: "/admin" },
                { label: "Operations", href: "/admin/orders" },
                { label: "Bottle Tracking" },
              ]}
            />
          </div>
          <h1 className="mb-1 text-[28px] leading-8 font-semibold text-text-primary tracking-tight">
            Bottle Exchanges &amp; Returns Log
          </h1>
          <p className="text-sm leading-5 text-text-tertiary">
            Audit log of empty bottle returns, filled deliveries, and damaged units recorded by van drivers.
          </p>
        </div>

        {/* 4-Card NextAdmin Pro Overview Stats */}
        {isLoading ? (
          <SkeletonMetrics count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            <Card beamIndex={0}>
              <CardHeader className="justify-between">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-light-50 text-primary dark:bg-blue-light-950">
                  <TaskIcon />
                </div>
              </CardHeader>
              <CardContent className="mt-3.5 sm:mt-5 p-0">
                <div className="text-lg leading-6 font-bold text-text-primary sm:text-xl md:text-2xl">
                  {summary.totalFilledDelivered}
                </div>
              </CardContent>
              <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
                <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Bottles Delivered</span>
                <span className="text-[11px] leading-4 sm:text-xs font-semibold text-primary">Filled 19L units</span>
              </CardFooter>
            </Card>

            <Card beamIndex={2}>
              <CardHeader className="justify-between">
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-950">
                  <TableIcon />
                </div>
              </CardHeader>
              <CardContent className="mt-3.5 sm:mt-5 p-0">
                <div className="text-lg leading-6 font-bold text-brand-600 dark:text-brand-400 sm:text-xl md:text-2xl">
                  {summary.totalEmptyCollected}
                </div>
              </CardContent>
              <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
                <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Empties Returned</span>
                <span className="text-[11px] leading-4 sm:text-xs font-semibold text-brand-600">No deposit fee</span>
              </CardFooter>
            </Card>

            <Card beamIndex={3}>
              <CardHeader className="justify-between">
                <div className="flex size-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500 dark:bg-orange-950">
                  <Widget4Icon />
                </div>
              </CardHeader>
              <CardContent className="mt-3.5 sm:mt-5 p-0">
                <div className="text-lg leading-6 font-bold text-orange-600 dark:text-orange-400 sm:text-xl md:text-2xl">
                  {summary.totalDamaged}
                </div>
              </CardContent>
              <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
                <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Damaged Bottles</span>
                <span className="text-[11px] leading-4 sm:text-xs font-semibold text-orange-500">Decommissioned</span>
              </CardFooter>
            </Card>

            <Card beamIndex={1}>
              <CardHeader className="justify-between">
                <div className="flex size-8 items-center justify-center rounded-lg bg-success-50 text-green-600 dark:bg-success-950">
                  <InvoiceIcon />
                </div>
              </CardHeader>
              <CardContent className="mt-3.5 sm:mt-5 p-0">
                <div className="text-lg leading-6 font-bold text-green-600 sm:text-xl md:text-2xl">
                  GH₵ {summary.totalCashCollected.toFixed(2)}
                </div>
              </CardContent>
              <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
                <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Cash Collected</span>
                <span className="text-[11px] leading-4 sm:text-xs font-semibold text-green-600">Direct settlement</span>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Main Exchanges Table Card */}
        <Card className="p-0 overflow-hidden">
          <CardHeader className="p-5 pb-4">
            <div>
              <CardTitle>Exchange Audit Log</CardTitle>
              <p className="mt-0.5 text-xs text-text-tertiary">
                Showing {filtered.length} exchange records
              </p>
            </div>

            <InputGroup className="h-9 w-64 sm:w-80">
              <InputGroupAddon align="inline-start" className="pr-0 text-icon-tertiary">
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search record ID, notes..."
                className="pl-2 text-xs"
              />
            </InputGroup>
          </CardHeader>

          {/* Table */}
          {isLoading ? (
            <div className="p-5">
              <SkeletonTable rows={5} columns={7} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <TableRoot className="w-full rounded-none border-none">
                <TableHeader>
                  <TableRow className="border-t border-b border-border-primary bg-background-gray-primary/40">
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Date &amp; Time
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Record ID
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Bottles Delivered
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Empties Collected
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Damaged
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Cash Collected
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Customer Notes
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-xs text-text-tertiary">
                        No bottle exchange records match your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((e) => (
                      <TableRow key={e.id} className="hover:bg-background-gray-primary/50 transition-colors">
                        <TableCell className="px-5 py-3 font-mono text-xs text-text-tertiary whitespace-nowrap">
                          {new Date(e.createdAt).toLocaleString("en-GB", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </TableCell>
                        <TableCell className="px-5 py-3 font-mono text-xs font-bold text-text-primary">
                          {e.id}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-xs font-semibold text-text-primary">
                          {e.filledDelivered} Bottles
                        </TableCell>
                        <TableCell className="px-5 py-3 text-xs font-semibold text-brand-600 dark:text-brand-400">
                          {e.emptyCollected} Empties
                        </TableCell>
                        <TableCell className="px-5 py-3 text-xs">
                          {e.damagedCount > 0 ? (
                            <Badge color="warning" size="sm">
                              {e.damagedCount} damaged
                            </Badge>
                          ) : (
                            <span className="text-text-tertiary">0</span>
                          )}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-xs font-bold text-text-primary">
                          {e.cashCollected > 0 ? `GH₵ ${e.cashCollected.toFixed(2)}` : "-"}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-xs text-text-secondary max-w-xs truncate">
                          {e.customerNotes || "Standard exchange signoff"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableRoot>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
