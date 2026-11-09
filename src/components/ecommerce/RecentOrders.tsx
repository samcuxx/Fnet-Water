"use client";

import React from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";

interface OrderItem {
  id: string;
  name: string;
  details: string;
  customer: string;
  amount: string;
  status: "Delivered" | "Assigned" | "Pending";
}

const recentWaterOrders: OrderItem[] = [
  {
    id: "FNW-8821",
    name: "19L Pure Refill (4 Bottles)",
    details: "Bottle Exchange Completed",
    customer: "Kwesi Appiah (East Legon)",
    amount: "GH₵ 120.00",
    status: "Delivered",
  },
  {
    id: "FNW-8822",
    name: "Aquamaster Smart Dispenser",
    details: "Monthly Installment (8 of 12)",
    customer: "Zenith Bank Head Office",
    amount: "GH₵ 200.00",
    status: "Delivered",
  },
  {
    id: "FNW-8823",
    name: "19L Pure Refill (2 Bottles)",
    details: "Driver Assigned: Van 02",
    customer: "Afia Addo (Airport Res.)",
    amount: "GH₵ 60.00",
    status: "Assigned",
  },
  {
    id: "FNW-8824",
    name: "19L Refill (10 Bottles Commercial)",
    details: "Awaiting Driver Assignment",
    customer: "Dr. Mensah Clinic (Osu)",
    amount: "GH₵ 300.00",
    status: "Pending",
  },
  {
    id: "FNW-8825",
    name: "New Dispenser Onboarding",
    details: "Mobile Money Verified",
    customer: "Samuel Danquah (Spintex)",
    amount: "GH₵ 450.00",
    status: "Delivered",
  },
];

export default function RecentOrders() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 shadow-theme-xs">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
            Recent Delivery &amp; Refill Orders
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Real-time fulfillment queue across dispatch hubs
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 self-start sm:self-auto transition cursor-pointer"
        >
          View All Orders
        </Link>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full text-left text-xs sm:text-sm">
          <TableHeader>
            <TableRow className="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-semibold">
              <TableCell isHeader className="py-3 px-3">
                Order &amp; Product
              </TableCell>
              <TableCell isHeader className="py-3 px-3">
                Customer &amp; Location
              </TableCell>
              <TableCell isHeader className="py-3 px-3">
                Amount
              </TableCell>
              <TableCell isHeader className="py-3 px-3 text-right">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {recentWaterOrders.map((ord) => (
              <TableRow
                key={ord.id}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
              >
                <TableCell className="py-3.5 px-3">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {ord.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {ord.id} • {ord.details}
                  </div>
                </TableCell>
                <TableCell className="py-3.5 px-3">
                  <div className="text-gray-800 dark:text-gray-200 font-medium">
                    {ord.customer}
                  </div>
                </TableCell>
                <TableCell className="py-3.5 px-3 font-semibold text-gray-900 dark:text-white">
                  {ord.amount}
                </TableCell>
                <TableCell className="py-3.5 px-3 text-right">
                  <Badge
                    color={
                      ord.status === "Delivered"
                        ? "success"
                        : ord.status === "Assigned"
                        ? "primary"
                        : "warning"
                    }
                    size="sm"
                  >
                    {ord.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
