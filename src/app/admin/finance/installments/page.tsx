"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Card } from "@/components/tailgrids/core/card";
import { Badge } from "@/components/tailgrids/core/badge";
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
import { SkeletonMetrics, SkeletonTable } from "@/components/ui/skeleton";
import { SearchIcon } from "@/components/common/header/icons";
import type { StoredDispenserPlan } from "@/lib/dispenser-store";
import {
  FileText,
  ShieldCheck,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function AdminInstallmentsPage() {
  const [plans, setPlans] = useState<StoredDispenserPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/manager/dispensers/iot");
      if (res.ok) {
        const d = await res.json();
        setPlans(d.data || []);
      }
    } catch (err) {
      console.error("Failed to load installment plans:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const filtered = plans.filter((p) =>
    p.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.customerName.toLowerCase().includes(search.toLowerCase()) ||
    p.customerPhone.includes(search)
  );

  const activePlansCount = plans.filter((p) => !p.isFullyPaid).length;
  const fullyPaidCount = plans.filter((p) => p.isFullyPaid).length;
  const totalRepaidAmount = plans.reduce((acc, p) => acc + p.amountPaid, 0);

  return (
    <AppLayout role="ADMIN">
      <div className="space-y-6">
        {/* Breadcrumbs & Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Dispenser Installment Contracts
              </h1>
              <Badge color="primary" size="sm">
                Rent-to-Own Financing
              </Badge>
            </div>
            <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
              Active rent-to-own agreements, monthly installment schedules, and customer ownership transfers.
            </p>
          </div>
          <div>
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: "/admin" },
                { label: "Installments" },
              ]}
            />
          </div>
        </div>

        {/* 4 Metric Cards (NextAdmin Pro Style) */}
        {isLoading ? (
          <SkeletonMetrics count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
            {/* Card 1: Active Contracts */}
            <Card beamIndex={0}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-text-secondary">
                    Active Contracts
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-text-primary sm:text-2xl lg:text-3xl">
                    {activePlansCount}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-blue-light-100 text-primary dark:bg-blue-light-950/60 dark:text-blue-light-400">
                  <FileText className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">Under repayment schedule</p>
            </Card>

            {/* Card 2: Customer Owned */}
            <Card beamIndex={1}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Customer Owned
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400 sm:text-2xl lg:text-3xl">
                    {fullyPaidCount}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <ShieldCheck className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">100% paid off contracts</p>
            </Card>

            {/* Card 3: Total Repaid */}
            <Card beamIndex={2}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-text-secondary">
                    Total Repaid to Date
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-text-primary sm:text-2xl lg:text-3xl">
                    GH₵ {totalRepaidAmount.toFixed(2)}
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <DollarSign className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">Collected installment capital</p>
            </Card>

            {/* Card 4: Default Rate */}
            <Card beamIndex={5}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-cyan-600 dark:text-cyan-400">
                    Contract Default Rate
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-cyan-600 dark:text-cyan-400 sm:text-2xl lg:text-3xl">
                    0.0%
                  </h3>
                </div>
                <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
                  <TrendingUp className="size-4 sm:size-5" />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-text-tertiary">Zero contract defaults</p>
            </Card>
          </div>
        )}

        {/* Search Bar */}
        <Card className="p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:w-80">
              <InputGroup>
                <InputGroupAddon className="text-icon-secondary">
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  type="text"
                  placeholder="Search by serial, customer name, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-xs"
                />
              </InputGroup>
            </div>
            <span className="text-xs text-text-tertiary">
              {filtered.length} installment contracts
            </span>
          </div>
        </Card>

        {/* Contracts Table */}
        {isLoading ? (
          <SkeletonTable rows={5} columns={7} />
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <TableRoot>
                <TableHeader>
                  <TableRow className="border-b border-card-border bg-background-gray-secondary/50">
                    <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                      Dispenser Serial
                    </TableHead>
                    <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                      Customer
                    </TableHead>
                    <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                      Model Name
                    </TableHead>
                    <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                      Financial Progress
                    </TableHead>
                    <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                      Monthly Rate
                    </TableHead>
                    <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                      Next Due Date
                    </TableHead>
                    <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase text-right">
                      Contract Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-card-border">
                  {filtered.map((p) => (
                    <TableRow
                      key={p.id}
                      className="hover:bg-background-gray-secondary/30 transition-colors"
                    >
                      <TableCell className="px-5 py-4 font-mono font-bold text-xs text-text-primary">
                        {p.serialNumber}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <span className="font-semibold text-xs text-text-primary block">
                          {p.customerName}
                        </span>
                        <span className="text-[11px] text-text-tertiary font-mono">{p.customerPhone}</span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-xs text-text-secondary">
                        {p.modelName}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="space-y-1.5 w-36">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              GH₵ {p.amountPaid.toFixed(2)}
                            </span>
                            <span className="text-text-tertiary">
                              / GH₵ {p.totalCost.toFixed(2)}
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-background-gray-secondary overflow-hidden">
                            <div
                              className={`h-full rounded-full ${p.isFullyPaid ? "bg-emerald-500" : "bg-primary"}`}
                              style={{ width: `${Math.min(100, (p.amountPaid / p.totalCost) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 font-semibold text-xs text-text-primary">
                        GH₵ {p.monthlyDue.toFixed(2)} / mo
                      </TableCell>
                      <TableCell className="px-5 py-4 text-xs text-text-secondary">
                        {p.isFullyPaid
                          ? "Paid Off"
                          : new Date(p.nextPaymentDate).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right">
                        {p.isFullyPaid ? (
                          <Badge color="success" size="sm">
                            Customer Owned
                          </Badge>
                        ) : (
                          <Badge color="cyan" size="sm">
                            Active ({p.installmentsPaidCount}/{p.totalInstallmentsCount})
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableRoot>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
