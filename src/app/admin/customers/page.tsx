"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import type { StatusType } from "@/types/next-auth";

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

  // Instant client-side filtering (0ms lag, no network roundtrip on typing)
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

  // Initial load
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

  // Instant memoized filter
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

  // Operational metrics
  const metrics = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.status === "ACTIVE").length;
    const totalBottles = customers.reduce((sum, c) => sum + (c.bottlesHeld || 0), 0);
    const dispenserPlans = customers.filter(
      (c) => c.dispenserPlan && c.dispenserPlan !== "None (Refill Only)"
    ).length;
    return { total, active, totalBottles, dispenserPlans };
  }, [customers]);

  // Add Customer
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

  // Edit Customer
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

  // Toggle Status
  const handleToggleStatus = async (cust: CustomerItem) => {
    const newStatus: StatusType = cust.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    // Instant optimistic update
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

  // Delete Customer
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
      <div className="space-y-6">
        {/* Toast / Notification Banner */}
        {feedbackMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-all ${
              feedbackMessage.type === "success"
                ? "bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 text-green-700 dark:text-green-300"
                : "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300"
            }`}
          >
            <span>{feedbackMessage.text}</span>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Customer Directory
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Manage residential and commercial refill accounts, dispenser leases, and bottle deposits.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs self-start sm:self-auto cursor-pointer"
          >
            <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add Customer
          </button>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Accounts</span>
            <div className="mt-1 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.total}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Active Refill Users</span>
            <div className="mt-1 text-xl sm:text-2xl font-bold text-brand-600 dark:text-brand-400">
              {metrics.active}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Bottles in Custody</span>
            <div className="mt-1 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {metrics.totalBottles}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Active Dispenser Leases</span>
            <div className="mt-1 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
              {metrics.dispenserPlans}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <input
              type="text"
              placeholder="Search by customer name, code (CUST-...), phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
            <svg
              className="size-4 text-gray-400 absolute left-3 top-3 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Customers</option>
              <option value="INACTIVE">Inactive Customers</option>
            </select>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-theme-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-600 dark:text-gray-400 font-semibold">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Account ID</th>
                  <th className="py-3 px-4">Contact Phone</th>
                  <th className="py-3 px-4">Bottles Held</th>
                  <th className="py-3 px-4">Dispenser Plan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {initialLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      Loading customer directory...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      No customers match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr
                      key={cust.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">{cust.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{cust.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold">
                          {cust.customerCode || "CUST-NEW"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                        {cust.phone}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 font-medium text-gray-900 dark:text-white">
                          <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                          {cust.bottlesHeld ?? 0} bottles
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-gray-600 dark:text-gray-300">
                        {cust.dispenserPlan || "None"}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          color={cust.status === "ACTIVE" ? "success" : "light"}
                          variant="light"
                          size="sm"
                        >
                          {cust.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => openEditModal(cust)}
                            title="Edit Customer"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          >
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>

                          {/* Toggle Active / Inactive */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(cust)}
                            title={cust.status === "ACTIVE" ? "Deactivate Customer" : "Activate Customer"}
                            className={`p-1.5 rounded-lg transition ${
                              cust.status === "ACTIVE"
                                ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                : "text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                            }`}
                          >
                            {cust.status === "ACTIVE" ? (
                              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                            ) : (
                              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            )}
                          </button>

                          {/* Delete Customer */}
                          <button
                            type="button"
                            onClick={() => openDeleteModal(cust)}
                            title="Delete Customer Record"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          >
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add Customer */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Register New Customer"
        >
          {formError && (
            <div className="mb-4 p-3 rounded-lg text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Name / Business
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ama Osei"
                value={newCustData.name}
                onChange={(e) => setNewCustData({ ...newCustData, name: e.target.value })}
                className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="ama@example.com"
                  value={newCustData.email}
                  onChange={(e) => setNewCustData({ ...newCustData, email: e.target.value })}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="024 123 4567"
                  value={newCustData.phone}
                  onChange={(e) => setNewCustData({ ...newCustData, phone: e.target.value })}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Primary Delivery Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. East Legon, Accra"
                  value={newCustData.deliveryArea}
                  onChange={(e) => setNewCustData({ ...newCustData, deliveryArea: e.target.value })}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dispenser Option
                </label>
                <select
                  value={newCustData.dispenserPlan}
                  onChange={(e) => setNewCustData({ ...newCustData, dispenserPlan: e.target.value })}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
                >
                  <option value="Smart Rent-to-Own">Smart Rent-to-Own Plan</option>
                  <option value="Standard Hot/Cold">Direct Purchase (Standard Hot/Cold)</option>
                  <option value="None (Refill Only)">None (Refill Only)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Creating..." : "Save Customer"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Edit Customer */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Customer: ${activeCustomer?.name || ""}`}
        >
          {formError && (
            <div className="mb-4 p-3 rounded-lg text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={editCustData.name}
                onChange={(e) => setEditCustData({ ...editCustData, name: e.target.value })}
                className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editCustData.email}
                  onChange={(e) => setEditCustData({ ...editCustData, email: e.target.value })}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={editCustData.phone}
                  onChange={(e) => setEditCustData({ ...editCustData, phone: e.target.value })}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Confirm Customer Removal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Customer Removal"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to remove customer{" "}
              <strong className="text-gray-900 dark:text-white">{activeCustomer?.name}</strong>{" "}
              ({activeCustomer?.customerCode})? This will deactivate their water delivery portal.
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition shadow-theme-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Removing..." : "Remove Customer"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
