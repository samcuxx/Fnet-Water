"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { SkeletonMetrics, SkeletonTable } from "@/components/ui/skeleton";
import { staggerContainer, fadeInUp, cardHoverMotion } from "@/lib/animations";
import type { RoleType, StatusType } from "@/types/next-auth";

interface StaffItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: RoleType;
  status: StatusType;
  createdAt: string;
}

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Instant client-side filters (Zero loading spinners or lag when typing)
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [activeStaff, setActiveStaff] = useState<StaffItem | null>(null);

  // Form States
  const [newStaffData, setNewStaffData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "DRIVER" as RoleType,
  });

  const [editStaffData, setEditStaffData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "DRIVER" as RoleType,
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial load
  const loadStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setStaffList(data.users);
      }
    } catch (err) {
      console.error("Failed to load staff:", err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  // Auto-dismiss notification after 4s
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // Instant memoized filter (0ms delay, no network refetch)
  const filteredStaff = useMemo(() => {
    const q = search.toLowerCase().trim();
    return staffList.filter((staff) => {
      const matchesSearch =
        !q ||
        staff.name.toLowerCase().includes(q) ||
        staff.email.toLowerCase().includes(q) ||
        staff.phone.includes(q);

      const matchesRole = roleFilter === "ALL" || staff.role === roleFilter;
      const matchesStatus = statusFilter === "ALL" || staff.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staffList, search, roleFilter, statusFilter]);

  // Operational metrics
  const metrics = useMemo(() => {
    const total = staffList.length;
    const drivers = staffList.filter((s) => s.role === "DRIVER").length;
    const agents = staffList.filter((s) => s.role === "AGENT").length;
    const managers = staffList.filter((s) => s.role === "MANAGER" || s.role === "ADMIN").length;
    return { total, drivers, agents, managers };
  }, [staffList]);

  // Action: Add Staff
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaffData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to create staff.");
        setIsSubmitting(false);
        return;
      }

      setStaffList((prev) => [data.user, ...prev]);
      setIsAddModalOpen(false);
      setNewStaffData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "DRIVER",
      });
      setFeedbackMessage({ type: "success", text: "New staff member added successfully." });
    } catch {
      setFormError("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Open Edit Modal
  const openEditModal = (staff: StaffItem) => {
    setActiveStaff(staff);
    setEditStaffData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Action: Save Edited Staff
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStaff) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          userId: activeStaff.id,
          ...editStaffData,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to update staff.");
        setIsSubmitting(false);
        return;
      }

      setStaffList((prev) =>
        prev.map((s) => (s.id === activeStaff.id ? { ...s, ...editStaffData } : s))
      );
      setIsEditModalOpen(false);
      setFeedbackMessage({ type: "success", text: "Staff details updated successfully." });
    } catch {
      setFormError("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Open Password Modal
  const openPasswordModal = (staff: StaffItem) => {
    setActiveStaff(staff);
    setNewPassword("");
    setConfirmPassword("");
    setFormError(null);
    setIsPasswordModalOpen(true);
  };

  // Action: Save Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStaff) return;
    if (newPassword.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "password",
          userId: activeStaff.id,
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to update password.");
        setIsSubmitting(false);
        return;
      }

      setIsPasswordModalOpen(false);
      setFeedbackMessage({ type: "success", text: `Password updated for ${activeStaff.name}.` });
    } catch {
      setFormError("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Toggle Status
  const handleToggleStatus = async (staff: StaffItem) => {
    const newStatus: StatusType = staff.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    // Optimistic instant local update
    setStaffList((prev) =>
      prev.map((s) => (s.id === staff.id ? { ...s, status: newStatus } : s))
    );

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", userId: staff.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMessage({
          type: "success",
          text: `${staff.name} marked as ${newStatus.toLowerCase()}.`,
        });
      } else {
        // Rollback on error
        setStaffList((prev) =>
          prev.map((s) => (s.id === staff.id ? { ...s, status: staff.status } : s))
        );
        setFeedbackMessage({
          type: "error",
          text: data.message || "Failed to update staff status.",
        });
      }
    } catch {
      setStaffList((prev) =>
        prev.map((s) => (s.id === staff.id ? { ...s, status: staff.status } : s))
      );
      setFeedbackMessage({
        type: "error",
        text: "Network error updating staff status.",
      });
    }
  };

  // Action: Open Delete Modal
  const openDeleteModal = (staff: StaffItem) => {
    setActiveStaff(staff);
    setIsDeleteModalOpen(true);
  };

  // Action: Confirm Delete
  const handleConfirmDelete = async () => {
    if (!activeStaff) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/users?userId=${activeStaff.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setStaffList((prev) => prev.filter((s) => s.id !== activeStaff.id));
        setIsDeleteModalOpen(false);
        setFeedbackMessage({ type: "success", text: `${activeStaff.name} removed from staff.` });
      } else {
        setFeedbackMessage({ type: "error", text: data.message || "Failed to delete staff." });
      }
    } catch {
      setFeedbackMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadgeColor = (role: RoleType): "primary" | "info" | "success" | "warning" | "dark" => {
    switch (role) {
      case "ADMIN":
        return "primary";
      case "MANAGER":
        return "info";
      case "DRIVER":
        return "success";
      case "AGENT":
        return "warning";
      default:
        return "dark";
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Staff Directory
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Manage operations personnel, driver assignments, and portal access credentials across Ghana.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            <span>+ Add Staff Member</span>
          </button>
        </div>

        {/* Operational KPI Cards */}
        {initialLoading ? (
          <SkeletonMetrics count={4} />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          >
            <motion.div
              variants={fadeInUp}
              whileHover={cardHoverMotion.whileHover}
              transition={cardHoverMotion.transition}
              className="p-5 rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs"
            >
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Staff</span>
              <div className="mt-1 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                {metrics.total}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">Active personnel</span>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              whileHover={cardHoverMotion.whileHover}
              transition={cardHoverMotion.transition}
              className="p-5 rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs"
            >
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Delivery Drivers</span>
              <div className="mt-1 text-2xl sm:text-3xl font-black text-brand-600 dark:text-sky-400">
                {metrics.drivers}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">Fleet operators</span>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              whileHover={cardHoverMotion.whileHover}
              transition={cardHoverMotion.transition}
              className="p-5 rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs"
            >
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Field Agents</span>
              <div className="mt-1 text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                {metrics.agents}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">Community sales</span>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              whileHover={cardHoverMotion.whileHover}
              transition={cardHoverMotion.transition}
              className="p-5 rounded-[28px] border border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900/70 shadow-xs"
            >
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Managers &amp; Admin</span>
              <div className="mt-1 text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                {metrics.managers}
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">Hub dispatch control</span>
            </motion.div>
          </motion.div>
        )}

        {/* Instant Filter Controls (No lag, client-side) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search staff by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition shadow-2xs"
            />
            <svg
              className="size-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none"
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Staff Roles</option>
              <option value="ADMIN">Administrator</option>
              <option value="MANAGER">Operations Manager</option>
              <option value="DRIVER">Delivery Driver</option>
              <option value="AGENT">Field Agent</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-11 px-3.5 text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Staff</option>
              <option value="INACTIVE">Inactive Staff</option>
            </select>
          </div>
        </div>

        {/* Staff Table */}
        {initialLoading ? (
          <SkeletonTable rows={6} columns={6} />
        ) : (
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="bg-white dark:bg-gray-900/70 border border-gray-100 dark:border-gray-800/80 rounded-[28px] overflow-hidden shadow-xs"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-gray-600 dark:text-gray-400 font-semibold">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Added</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No staff members match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                  filteredStaff.map((staff) => (
                    <tr
                      key={staff.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {staff.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {staff.email}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                        {staff.phone}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge color={getRoleBadgeColor(staff.role)} variant="light" size="sm">
                          {staff.role}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge
                          color={staff.status === "ACTIVE" ? "success" : "light"}
                          variant="light"
                          size="sm"
                        >
                          {staff.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(staff.createdAt).toLocaleDateString()}
                      </td>

                      {/* Icon Actions Column */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => openEditModal(staff)}
                            title="Edit Staff Details"
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

                          {/* Change Password */}
                          <button
                            type="button"
                            onClick={() => openPasswordModal(staff)}
                            title="Reset Staff Password"
                            className="p-1.5 rounded-lg text-gray-500 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                          >
                            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          </button>

                          {/* Toggle Active / Deactivate */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(staff)}
                            title={staff.status === "ACTIVE" ? "Deactivate Staff" : "Activate Staff"}
                            className={`p-1.5 rounded-lg transition ${
                              staff.status === "ACTIVE"
                                ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                : "text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                            }`}
                          >
                            {staff.status === "ACTIVE" ? (
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

                          {/* Delete Staff */}
                          <button
                            type="button"
                            onClick={() => openDeleteModal(staff)}
                            title="Delete Staff Member"
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
        </motion.div>
      )}

        {/* Modal 1: Add Staff */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Staff Member"
        >
          {formError && (
            <div className="mb-4 p-3 rounded-lg text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateStaff} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kwame Mensah"
                value={newStaffData.name}
                onChange={(e) => setNewStaffData({ ...newStaffData, name: e.target.value })}
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
                  placeholder="kwame@fnetwater.com"
                  value={newStaffData.email}
                  onChange={(e) => setNewStaffData({ ...newStaffData, email: e.target.value })}
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
                  value={newStaffData.phone}
                  onChange={(e) => setNewStaffData({ ...newStaffData, phone: e.target.value })}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Operational Role
                </label>
                <select
                  value={newStaffData.role}
                  onChange={(e) =>
                    setNewStaffData({ ...newStaffData, role: e.target.value as RoleType })
                  }
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
                >
                  <option value="DRIVER">Delivery Driver</option>
                  <option value="AGENT">Field Agent</option>
                  <option value="MANAGER">Operations Manager</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newStaffData.password}
                  onChange={(e) =>
                    setNewStaffData({ ...newStaffData, password: e.target.value })
                  }
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
                />
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
                {isSubmitting ? "Saving..." : "Create Staff"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal 2: Edit Staff Details */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Staff: ${activeStaff?.name || ""}`}
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
                value={editStaffData.name}
                onChange={(e) => setEditStaffData({ ...editStaffData, name: e.target.value })}
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
                  value={editStaffData.email}
                  onChange={(e) => setEditStaffData({ ...editStaffData, email: e.target.value })}
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
                  value={editStaffData.phone}
                  onChange={(e) => setEditStaffData({ ...editStaffData, phone: e.target.value })}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <select
                value={editStaffData.role}
                onChange={(e) =>
                  setEditStaffData({ ...editStaffData, role: e.target.value as RoleType })
                }
                className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
              >
                <option value="DRIVER">Delivery Driver</option>
                <option value="AGENT">Field Agent</option>
                <option value="MANAGER">Operations Manager</option>
                <option value="ADMIN">Administrator</option>
              </select>
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
                {isSubmitting ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal 3: Change Password */}
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          title={`Reset Password: ${activeStaff?.name || ""}`}
        >
          {formError && (
            <div className="mb-4 p-3 rounded-lg text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-medium rounded-lg text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 transition shadow-theme-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal 4: Delete Confirmation */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Staff Removal"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to remove{" "}
              <strong className="text-gray-900 dark:text-white">{activeStaff?.name}</strong>{" "}
              ({activeStaff?.role}) from the staff directory? This will revoke all portal access
              immediately.
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
                {isSubmitting ? "Removing..." : "Remove Staff"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
