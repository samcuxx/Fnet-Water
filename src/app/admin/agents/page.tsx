"use client";

import React from "react";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/badge/Badge";

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
  return (
    <AppLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Field Sales Agents
              </h1>
              <Badge color="primary" size="sm">
                Distribution Network
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Community agents onboarding new residential, shop, and corporate pure water accounts across Accra.
            </p>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-gray-500 font-medium block">Active Field Agents</span>
            <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {mockAgents.length} Agents
            </div>
            <span className="text-[11px] text-gray-400">Operational across Greater Accra</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-brand-600 font-medium block">Agent Customer Accounts</span>
            <div className="mt-1 text-2xl font-bold text-brand-600 dark:text-blue-light-400">
              {mockAgents.reduce((acc, a) => acc + a.activeAccounts, 0)} Accounts
            </div>
            <span className="text-[11px] text-gray-400">Onboarded through field sales</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs text-emerald-600 font-medium block">Dispensers Deployed</span>
            <div className="mt-1 text-2xl font-bold text-emerald-600">
              {mockAgents.reduce((acc, a) => acc + a.dispensersDeployed, 0)} Units
            </div>
            <span className="text-[11px] text-gray-400">Rent-to-own signed via agents</span>
          </div>
        </div>

        {/* Agents Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 font-semibold bg-gray-50/50 dark:bg-gray-800/50">
                <th className="py-3 px-4">Agent Name</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Territory Area</th>
                <th className="py-3 px-4">Onboarded Accounts</th>
                <th className="py-3 px-4">Dispensers Deployed</th>
                <th className="py-3 px-4">Commission (GH₵)</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {mockAgents.map((agt) => (
                <tr key={agt.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-gray-900 dark:text-white block">
                      {agt.name}
                    </span>
                    <span className="text-[11px] font-mono text-gray-400">{agt.id}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-gray-700 dark:text-gray-300">
                    {agt.phone}
                  </td>
                  <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                    {agt.territory}
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                    {agt.activeAccounts} Accounts
                  </td>
                  <td className="py-3 px-4 font-semibold text-brand-600 dark:text-blue-light-400">
                    {agt.dispensersDeployed} Units
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600">
                    GH₵ {agt.monthlyCommission.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Badge color="success" size="sm">
                      Active
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
