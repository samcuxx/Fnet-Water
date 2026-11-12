"use client";

import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/tailgrids/core/badge";
import Breadcrumbs from "@/components/tailgrids/core/breadcrumbs";
import { Button } from "@/components/tailgrids/core/button";
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
import Modal from "@/components/ui/Modal";
import { SkeletonMetrics, SkeletonTable } from "@/components/ui/skeleton";
import type { StatusType } from "@/types/next-auth";
import { cn } from "@/utils/cn";
import { SearchIcon } from "@/components/common/header/icons";
import { InvoiceIcon, TableIcon, TaskIcon, UserGroupIcon, Widget4Icon } from "@/components/common/sidebar/icon";
import { Edit2, Plus, Trash2, UserCheck, UserX, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: StatusType;
  customerCode?: string;
  bottlesHeld?: number;
  dispenserPlan?: string;
  deliveryArea?: string;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<CustomerItem | null>(null);

  // Forms
  const [newCustData, setNewCustData] = useState({
    name: "",
    email: "",
    phone: "",
    deliveryArea: "East Legon",
    dispenserPlan: "Smart Rent-to-Own",
  });

  const [editCustData, setEditCustData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  const filteredCustomers = useMemo(() => {
    const q = search.toLowerCase().trim();
    return customers.filter((cust) => {
      const matchesSearch =
        !q ||
        cust.name.toLowerCase().includes(q) ||
        cust.email.toLowerCase().includes(q) ||
        cust.phone.includes(q) ||
        cust.customerCode?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "ALL" || cust.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customers, search, statusFilter]);

  const metrics = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.status === "ACTIVE").length;
    const totalBottles = customers.reduce((sum, c) => sum + (c.bottlesHeld || 0), 0);
    const dispenserPlans = customers.filter(
      (c) => c.dispenserPlan && c.dispenserPlan !== "None (Refill Only)"
    ).length;
    return { total, active, totalBottles, dispenserPlans };
  }, [customers]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to create customer.");
        setIsSubmitting(false);
        return;
      }

      setCustomers((prev) => [data.customer, ...prev]);
      setIsAddModalOpen(false);
      setNewCustData({
        name: "",
        email: "",
        phone: "",
        deliveryArea: "East Legon",
        dispenserPlan: "Smart Rent-to-Own",
      });
      setFeedbackMessage({ type: "success", text: "Customer account created." });
    } catch {
      setFormError("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (cust: CustomerItem) => {
    setActiveCustomer(cust);
    setEditCustData({
      name: cust.name,
      email: cust.email,
      phone: cust.phone,
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: activeCustomer.id,
          ...editCustData,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to update customer.");
        setIsSubmitting(false);
        return;
      }

      setCustomers((prev) =>
        prev.map((c) => (c.id === activeCustomer.id ? { ...c, ...editCustData } : c))
      );
      setIsEditModalOpen(false);
      setFeedbackMessage({ type: "success", text: "Customer details updated." });
    } catch {
      setFormError("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (cust: CustomerItem) => {
    const newStatus: StatusType = cust.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setCustomers((prev) =>
      prev.map((c) => (c.id === cust.id ? { ...c, status: newStatus } : c))
    );

    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: cust.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage({
          type: "success",
          text: `${cust.name} marked as ${newStatus.toLowerCase()}.`,
        });
      } else {
        setCustomers((prev) =>
          prev.map((c) => (c.id === cust.id ? { ...c, status: cust.status } : c))
        );
        setFeedbackMessage({
          type: "error",
          text: data.message || "Failed to update customer status.",
        });
      }
    } catch {
      setCustomers((prev) =>
        prev.map((c) => (c.id === cust.id ? { ...c, status: cust.status } : c))
      );
      setFeedbackMessage({
        type: "error",
        text: "Network error updating customer status.",
      });
    }
  };

  const openDeleteModal = (cust: CustomerItem) => {
    setActiveCustomer(cust);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!activeCustomer) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/customers?customerId=${activeCustomer.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setCustomers((prev) => prev.filter((c) => c.id !== activeCustomer.id));
        setIsDeleteModalOpen(false);
        setFeedbackMessage({ type: "success", text: `${activeCustomer.name} removed.` });
      } else {
        setFeedbackMessage({ type: "error", text: data.message || "Failed to remove customer." });
      }
    } catch {
      setFeedbackMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout role="ADMIN">
      <div className="mt-4 space-y-6 px-2 lg:px-4">
        {/* Toast / Notification Banner */}
        {feedbackMessage && (
          <div
            className={cn(
              "p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-all",
              feedbackMessage.type === "success"
                ? "bg-success-50 text-green-700 border border-success-200 dark:bg-success-950/40 dark:text-green-300"
                : "bg-error-50 text-red-700 border border-error-200 dark:bg-error-950/40 dark:text-red-300"
            )}
          >
            <span>{feedbackMessage.text}</span>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* NextAdmin Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="mb-2">
              <Breadcrumbs
                dividerType="chevron"
                items={[
                  { label: "Home", href: "/admin" },
                  { label: "Operations", href: "/admin/orders" },
                  { label: "Customers" },
                ]}
              />
            </div>
            <h1 className="mb-1 text-[28px] leading-8 font-semibold text-text-primary tracking-tight">
              Customer Directory
            </h1>
            <p className="text-sm leading-5 text-text-tertiary">
              Manage residential and commercial refill accounts, dispenser leases, and bottle deposits.
            </p>
          </div>

          <Button
            size="md"
            onClick={() => {
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Add Customer</span>
          </Button>
        </div>

        {/* 4-Card NextAdmin Overview Stats */}
        {initialLoading ? (
          <SkeletonMetrics count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            <Card beamIndex={0}>
              <CardHeader className="justify-between">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-light-50 text-primary dark:bg-blue-light-950">
                  <UserGroupIcon />
                </div>
              </CardHeader>
              <CardContent className="mt-3.5 sm:mt-5 p-0">
                <div className="text-lg leading-6 font-bold text-text-primary sm:text-xl md:text-2xl">
                  {metrics.total}
                </div>
              </CardContent>
              <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
                <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Total Accounts</span>
                <span className="text-[11px] leading-4 sm:text-xs font-semibold text-primary">Registered clients</span>
              </CardFooter>
            </Card>

            <Card beamIndex={1}>
              <CardHeader className="justify-between">
                <div className="flex size-8 items-center justify-center rounded-lg bg-success-50 text-green-600 dark:bg-success-950">
                  <TaskIcon />
                </div>
              </CardHeader>
              <CardContent className="mt-3.5 sm:mt-5 p-0">
                <div className="text-lg leading-6 font-bold text-green-600 sm:text-xl md:text-2xl">
                  {metrics.active}
                </div>
              </CardContent>
              <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
                <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Active Refill Users</span>
                <span className="text-[11px] leading-4 sm:text-xs font-semibold text-green-600">Subscribed</span>
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
                  {metrics.totalBottles}
                </div>
              </CardContent>
              <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
                <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Bottles in Field</span>
                <span className="text-[11px] leading-4 sm:text-xs font-semibold text-brand-600">19L cylinders</span>
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
                  {metrics.dispenserPlans}
                </div>
              </CardContent>
              <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
                <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Dispenser Leases</span>
                <span className="text-[11px] leading-4 sm:text-xs font-semibold text-orange-500">Rent-to-own</span>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Main Customers Table Card */}
        <Card className="p-0 overflow-hidden">
          <CardHeader className="p-5 pb-4">
            <div>
              <CardTitle>Customer Directory</CardTitle>
              <p className="mt-0.5 text-xs text-text-tertiary">
                Showing {filteredCustomers.length} of {customers.length} registered clients
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <InputGroup className="h-9 w-60 sm:w-72">
                <InputGroupAddon align="inline-start" className="pr-0 text-icon-tertiary">
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, phone, code..."
                  className="pl-2 text-xs"
                />
              </InputGroup>

              <div className="flex items-center gap-1 rounded-lg border border-card-border bg-background-gray-primary p-0.5">
                {(["ALL", "ACTIVE", "INACTIVE"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer",
                      statusFilter === st
                        ? "bg-card-background text-text-primary font-semibold shadow-xs"
                        : "text-text-tertiary hover:text-text-primary"
                    )}
                  >
                    {st === "ALL" ? "All Statuses" : st === "ACTIVE" ? "Active" : "Inactive"}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          {/* Table */}
          {initialLoading ? (
            <div className="p-5">
              <SkeletonTable rows={6} columns={7} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <TableRoot className="w-full rounded-none border-none">
                <TableHeader>
                  <TableRow className="border-t border-b border-border-primary bg-background-gray-primary/40">
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Customer
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Account ID
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Contact Phone
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Bottles Held
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Dispenser Plan
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Status
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-xs font-semibold text-text-secondary">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-xs text-text-tertiary">
                        No customers match your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <TableRow key={cust.id} className="hover:bg-background-gray-primary/50 transition-colors">
                        <TableCell className="px-5 py-3">
                          <div className="font-semibold text-xs text-text-primary">{cust.name}</div>
                          <div className="text-[11px] text-text-tertiary">{cust.email}</div>
                        </TableCell>

                        <TableCell className="px-5 py-3">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-background-gray-primary border border-card-border text-text-secondary font-medium">
                            {cust.customerCode || "CUST-NEW"}
                          </span>
                        </TableCell>

                        <TableCell className="px-5 py-3 font-mono text-xs text-text-secondary">
                          {cust.phone}
                        </TableCell>

                        <TableCell className="px-5 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-primary">
                            <span className="size-2 rounded-full bg-primary" />
                            {cust.bottlesHeld ?? 0} bottles
                          </span>
                        </TableCell>

                        <TableCell className="px-5 py-3 text-xs text-text-secondary">
                          {cust.dispenserPlan || "None"}
                        </TableCell>

                        <TableCell className="px-5 py-3">
                          <Badge color={cust.status === "ACTIVE" ? "success" : "neutral"} size="sm">
                            {cust.status === "ACTIVE" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>

                        <TableCell className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="xs"
                              iconOnly
                              onClick={() => openEditModal(cust)}
                              className="text-icon-secondary hover:text-text-primary"
                              title="Edit"
                            >
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              iconOnly
                              onClick={() => handleToggleStatus(cust)}
                              className={cn(
                                cust.status === "ACTIVE"
                                  ? "text-orange-500 hover:text-orange-600"
                                  : "text-green-600 hover:text-green-700"
                              )}
                              title={cust.status === "ACTIVE" ? "Deactivate" : "Activate"}
                            >
                              {cust.status === "ACTIVE" ? <UserX className="size-3.5" /> : <UserCheck className="size-3.5" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              iconOnly
                              onClick={() => openDeleteModal(cust)}
                              className="text-destructive hover:bg-destructive/10"
                              title="Delete"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableRoot>
            </div>
          )}
        </Card>

        {/* Modal: Add Customer */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Onboard New Customer"
        >
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-lg bg-error-50 border border-error-200 text-red-600 text-xs">
                {formError}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-primary">Full Name</label>
              <input
                required
                type="text"
                placeholder="e.g. Kwame Mensah"
                value={newCustData.name}
                onChange={(e) => setNewCustData((p) => ({ ...p, name: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-primary">Phone Number</label>
                <input
                  required
                  type="tel"
                  placeholder="024 XXX XXXX"
                  value={newCustData.phone}
                  onChange={(e) => setNewCustData((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-primary">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="kwame@example.com"
                  value={newCustData.email}
                  onChange={(e) => setNewCustData((p) => ({ ...p, email: e.target.value }))}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-primary">Delivery Zone</label>
              <select
                value={newCustData.deliveryArea}
                onChange={(e) => setNewCustData((p) => ({ ...p, deliveryArea: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="East Legon">East Legon</option>
                <option value="Cantonments">Cantonments</option>
                <option value="Airport Residential">Airport Residential</option>
                <option value="Osu">Osu</option>
                <option value="Ridge">Ridge</option>
                <option value="Spintex">Spintex</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
              <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Edit Customer */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit ${activeCustomer?.name}`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-lg bg-error-50 border border-error-200 text-red-600 text-xs">
                {formError}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-primary">Full Name</label>
              <input
                required
                type="text"
                value={editCustData.name}
                onChange={(e) => setEditCustData((p) => ({ ...p, name: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-primary">Phone Number</label>
              <input
                required
                type="tel"
                value={editCustData.phone}
                onChange={(e) => setEditCustData((p) => ({ ...p, phone: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-primary">Email Address</label>
              <input
                type="email"
                value={editCustData.email}
                onChange={(e) => setEditCustData((p) => ({ ...p, email: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
              <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Confirm Delete */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Customer Account"
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary leading-relaxed">
              Are you sure you want to remove <strong className="text-text-primary">{activeCustomer?.name}</strong>? All bottle tracking history and active dispenser agreements will be permanently archived.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
              <Button variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Customer"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
