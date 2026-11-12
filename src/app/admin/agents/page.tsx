"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Card } from "@/components/tailgrids/core/card";
import { Badge } from "@/components/tailgrids/core/badge";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@/components/tailgrids/core/table";
import { UserCheck, Users, Droplets } from "lucide-react";

interface FieldAgent {
  id: string;
  name: string;
  phone: string;
  territory: string;
  activeAccounts: number;
  dispensersDeployed: number;
  monthlyCommission: number;
  status: "ACTIVE" | "ON_LEAVE";
}

const mockAgents: FieldAgent[] = [
  {
    id: "agt_001",
    name: "Kofi Mensah",
    phone: "0245000004",
    territory: "East Legon & Adjiringanor",
    activeAccounts: 48,
    dispensersDeployed: 14,
    monthlyCommission: 720.0,
    status: "ACTIVE",
  },
  {
    id: "agt_002",
    name: "Akosua Frimpong",
    phone: "0201122445",
    territory: "Osu, Cantonments & Ridge",
    activeAccounts: 36,
    dispensersDeployed: 9,
    monthlyCommission: 540.0,
    status: "ACTIVE",
  },
  {
    id: "agt_003",
    name: "Emmanuel Tetteh",
    phone: "0278899001",
    territory: "Spintex Road & Sakumono",
    activeAccounts: 29,
    dispensersDeployed: 7,
    monthlyCommission: 410.0,
    status: "ACTIVE",
  },
];

export default function AdminAgentsPage() {
  const totalAccounts = mockAgents.reduce((acc, a) => acc + a.activeAccounts, 0);
  const totalDispensers = mockAgents.reduce((acc, a) => acc + a.dispensersDeployed, 0);

  return (
    <AppLayout role="ADMIN">
      <div className="space-y-6">
        {/* Breadcrumbs & Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Field Sales Agents
              </h1>
              <Badge color="primary" size="sm">
                Distribution Network
              </Badge>
            </div>
            <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
              Community agents onboarding new residential, shop, and corporate pure water accounts across Ghana.
            </p>
          </div>
          <div>
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: "/admin" },
                { label: "Sales Agents" },
              ]}
            />
          </div>
        </div>

        {/* 3 Metric Cards (NextAdmin Pro Style) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
          <Card beamIndex={0}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-text-secondary">
                  Active Field Agents
                </span>
                <h3 className="mt-1 text-lg font-bold text-text-primary sm:text-2xl lg:text-3xl">
                  {mockAgents.length} Agents
                </h3>
              </div>
              <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-blue-light-100 text-primary dark:bg-blue-light-950/60 dark:text-blue-light-400">
                <UserCheck className="size-4 sm:size-5" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-text-tertiary">Operational across assigned territories</p>
          </Card>

          <Card beamIndex={2}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-text-secondary">
                  Agent Customer Accounts
                </span>
                <h3 className="mt-1 text-lg font-bold text-primary sm:text-2xl lg:text-3xl">
                  {totalAccounts} Accounts
                </h3>
              </div>
              <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <Users className="size-4 sm:size-5" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-text-tertiary">Onboarded through field referrals</p>
          </Card>

          <Card beamIndex={1} className="col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-text-secondary">
                  Dispensers Deployed
                </span>
                <h3 className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400 sm:text-2xl lg:text-3xl">
                  {totalDispensers} Units
                </h3>
              </div>
              <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Droplets className="size-4 sm:size-5" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-text-tertiary">Rent-to-own signed via agents</p>
          </Card>
        </div>

        {/* Agents Table */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <TableRoot>
              <TableHeader>
                <TableRow className="border-b border-card-border bg-background-gray-secondary/50">
                  <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                    Agent Name
                  </TableHead>
                  <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                    Phone Number
                  </TableHead>
                  <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                    Territory Area
                  </TableHead>
                  <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                    Onboarded Accounts
                  </TableHead>
                  <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                    Dispensers Deployed
                  </TableHead>
                  <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase">
                    Commission
                  </TableHead>
                  <TableHead className="px-5 py-3.5 text-xs font-semibold text-text-secondary uppercase text-right">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-card-border">
                {mockAgents.map((agt) => (
                  <TableRow
                    key={agt.id}
                    className="hover:bg-background-gray-secondary/30 transition"
                  >
                    <TableCell className="px-5 py-4">
                      <span className="font-semibold text-xs text-text-primary block">
                        {agt.name}
                      </span>
                      <span className="text-[11px] font-mono text-text-tertiary">{agt.id}</span>
                    </TableCell>
                    <TableCell className="px-5 py-4 font-mono text-xs text-text-secondary">
                      {agt.phone}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-xs text-text-primary">
                      {agt.territory}
                    </TableCell>
                    <TableCell className="px-5 py-4 font-bold text-xs text-text-primary">
                      {agt.activeAccounts} Accounts
                    </TableCell>
                    <TableCell className="px-5 py-4 font-semibold text-xs text-primary">
                      {agt.dispensersDeployed} Units
                    </TableCell>
                    <TableCell className="px-5 py-4 font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      GH₵ {agt.monthlyCommission.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <Badge color="success" size="sm">
                        Active
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableRoot>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
