"use client";

import { SearchIcon } from "@/components/common/header/icons";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
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
import { DownloadIcon, FilterIcon, MenuDotsIcon } from "@/utils/icon";
import Link from "next/link";
import React, { useState } from "react";

interface OrderItem {
  id: string;
  orderNumber: string;
  name: string;
  details: string;
  customer: string;
  location: string;
  date: string;
  amount: string;
  status: "Delivered" | "Assigned" | "Pending";
}

const RECENT_ORDERS: OrderItem[] = [
  {
    id: "1",
    orderNumber: "FNW-8821",
    name: "19L Pure Refill (4 Bottles)",
    details: "Bottle exchange completed",
    customer: "Kwesi Appiah",
    location: "East Legon",
    date: "Today • 10:45 AM",
    amount: "GH₵ 120.00",
    status: "Delivered",
  },
  {
    id: "2",
    orderNumber: "FNW-8822",
    name: "Smart Dispenser Rent-to-Own",
    details: "Monthly payment (8 of 12)",
    customer: "Zenith Bank Head Office",
    location: "Ridge Accra",
    date: "Today • 09:30 AM",
    amount: "GH₵ 200.00",
    status: "Delivered",
  },
  {
    id: "3",
    orderNumber: "FNW-8823",
    name: "19L Pure Refill (2 Bottles)",
    details: "Assigned: Van 02",
    customer: "Afia Addo",
    location: "Airport Residential",
    date: "Today • 09:15 AM",
    amount: "GH₵ 60.00",
    status: "Assigned",
  },
  {
    id: "4",
    orderNumber: "FNW-8824",
    name: "19L Refill (10 Commercial)",
    details: "Awaiting driver assignment",
    customer: "Dr. Mensah Clinic",
    location: "Osu",
    date: "Today • 08:50 AM",
    amount: "GH₵ 300.00",
    status: "Pending",
  },
  {
    id: "5",
    orderNumber: "FNW-8825",
    name: "New Dispenser Onboarding",
    details: "Mobile Money verified",
    customer: "Samuel Danquah",
    location: "Spintex Road",
    date: "Today • 08:20 AM",
    amount: "GH₵ 450.00",
    status: "Delivered",
  },
];

export default function RecentOrders() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const filteredOrders = RECENT_ORDERS.filter(
    (o) =>
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? filteredOrders.map((o) => o.id) : []);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelected((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));
  };

  const isAllSelected =
    filteredOrders.length > 0 && selected.length === filteredOrders.length;

  const getStatusBadgeColor = (status: OrderItem["status"]) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Assigned":
        return "primary";
      case "Pending":
        return "warning";
      default:
        return "neutral";
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      {/* Header with Search and Actions */}
      <CardHeader className="p-5 pb-4">
        <div>
          <CardTitle>Recent Orders & Fulfillment</CardTitle>
          <p className="mt-0.5 text-xs text-text-tertiary">
            Real-time fulfillment queue across dispatch hubs in Accra
          </p>
        </div>

        <div className="flex items-center gap-2">
          <InputGroup className="h-9 w-48 sm:w-60">
            <InputGroupAddon align="inline-start" className="pr-0 text-icon-tertiary">
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search orders..."
              className="pl-2 text-xs"
            />
          </InputGroup>

          <Button appearance="outline" size="sm" iconOnly className="text-icon-secondary">
            <FilterIcon />
          </Button>

          <Button appearance="outline" size="sm" iconOnly className="text-icon-secondary">
            <DownloadIcon />
          </Button>

          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-primary hover:underline ml-2"
          >
            View all
          </Link>
        </div>
      </CardHeader>

      {/* Table */}
      <div className="overflow-x-auto">
        <TableRoot className="w-full rounded-none border-none">
          <TableHeader>
            <TableRow className="border-t border-b border-border-primary bg-background-gray-primary/40">
              <TableHead className="w-10 px-4 py-3">
                <div className="flex items-center justify-center">
                  <Checkbox
                    isSelected={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </div>
              </TableHead>
              <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                Order Number
              </TableHead>
              <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                Product & Details
              </TableHead>
              <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                Customer & Location
              </TableHead>
              <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                Date
              </TableHead>
              <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                Amount
              </TableHead>
              <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                Status
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-semibold text-text-secondary">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-xs text-text-tertiary">
                  No orders match your search criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((ord) => (
                <TableRow key={ord.id} className="hover:bg-background-gray-primary/50 transition-colors">
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        isSelected={selected.includes(ord.id)}
                        onChange={(checked) => handleSelectOne(ord.id, checked)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-xs font-bold text-text-primary whitespace-nowrap">
                    {ord.orderNumber}
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    <div className="text-xs font-medium text-text-primary">
                      {ord.name}
                    </div>
                    <div className="text-[11px] text-text-tertiary">
                      {ord.details}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    <div className="text-xs font-medium text-text-primary">
                      {ord.customer}
                    </div>
                    <div className="text-[11px] text-text-tertiary">
                      {ord.location}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-3 text-xs text-text-secondary whitespace-nowrap">
                    {ord.date}
                  </TableCell>
                  <TableCell className="px-5 py-3 text-xs font-bold text-text-primary whitespace-nowrap">
                    {ord.amount}
                  </TableCell>
                  <TableCell className="px-5 py-3">
                    <Badge color={getStatusBadgeColor(ord.status)} size="sm">
                      {ord.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="xs"
                      iconOnly
                      className="text-icon-tertiary hover:text-text-primary"
                    >
                      <MenuDotsIcon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </TableRoot>
      </div>
    </Card>
  );
}
