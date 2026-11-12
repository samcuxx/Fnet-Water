"use client";

import AppLayout from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback } from "@/components/tailgrids/core/avatar";
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
import type { RoleType, StatusType } from "@/types/next-auth";
import { cn } from "@/utils/cn";
import { SearchIcon } from "@/components/common/header/icons";
import { AuthIcon, UserGroupIcon, UserIcon, Widget4Icon, WindowIcon } from "@/components/common/sidebar/icon";
import { Edit2, KeyRound, Plus, Trash2, UserCheck, UserX, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

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

  const metrics = useMemo(() => {
    const total = staffList.length;
    const drivers = staffList.filter((s) => s.role === "DRIVER").length;
    const agents = staffList.filter((s) => s.role === "AGENT").length;
    const managers = staffList.filter((s) => s.role === "MANAGER" || s.role === "ADMIN").length;
    return { total, drivers, agents, managers };
  }, [staffList]);

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

  const openPasswordModal = (staff: StaffItem) => {
    setActiveStaff(staff);
    setNewPassword("");
    setConfirmPassword("");
    setFormError(null);
    setIsPasswordModalOpen(true);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStaff) return;
    setFormError(null);

    if (newPassword.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

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

  const handleToggleStatus = async (staff: StaffItem) => {
    const newStatus: StatusType = staff.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setStaffList((prev) =>
      prev.map((s) => (s.id === staff.id ? { ...s, status: newStatus } : s))
    );

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "status",
          userId: staff.id,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedbackMessage({
          type: "success",
          text: `${staff.name} is now ${newStatus.toLowerCase()}.`,
        });
      } else {
        setStaffList((prev) =>
          prev.map((s) => (s.id === staff.id ? { ...s, status: staff.status } : s))
        );
        setFeedbackMessage({ type: "error", text: data.message || "Failed to update status." });
      }
    } catch {
      setStaffList((prev) =>
        prev.map((s) => (s.id === staff.id ? { ...s, status: staff.status } : s))
      );
      setFeedbackMessage({ type: "error", text: "Network error occurred." });
    }
  };

  const openDeleteModal = (staff: StaffItem) => {
    setActiveStaff(staff);
    setIsDeleteModalOpen(true);
  };

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

  const getRoleBadgeColor = (role: RoleType) => {
    switch (role) {
      case "ADMIN":
        return "primary";
      case "MANAGER":
        return "cyan";
      case "DRIVER":
        return "success";
      case "AGENT":
        return "warning";
      default:
        return "neutral";
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
                  { label: "System", href: "/admin/users" },
                  { label: "Staff & Users" },
                ]}
              />
            </div>
            <h1 className="mb-1 text-[28px] leading-8 font-semibold text-text-primary tracking-tight">
              Staff &amp; User Directory
            </h1>
            <p className="text-sm leading-5 text-text-tertiary">
              Manage operations personnel, driver assignments, and portal access credentials across Ghana.
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
            <span>Add Staff Member</span>
          </Button>
        </div>

        {/* 4-Card NextAdmin Pro Overview Stats */}
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
                <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Total Staff</span>
                <span className="text-[11px] leading-4 sm:text-xs font-semibold text-primary">All personnel</span>
              </CardFooter>
            </Card>

            <Card beamIndex={1}>
              <CardHeader className="justify-between">
                <div className="flex size-8 items-center justify-center rounded-lg bg-success-50 text-green-600 dark:bg-success-950">
                  <Widget4Icon />
                </div>
              </CardHeader>
              <CardContent className="mt-3.5 sm:mt-5 p-0">
                <div className="text-lg leading-6 font-bold text-green-600 sm:text-xl md:text-2xl">
                  {metrics.drivers}
                </div>
              </CardContent>
              <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
                <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Delivery Drivers</span>
                <span className="text-[11px] leading-4 sm:text-xs font-semibold text-green-600">Van operators</span>
              </CardFooter>
            </Card>

            <Card beamIndex={3}>
              <CardHeader className="justify-between">
                <div className="flex size-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500 dark:bg-orange-950">
                  <UserIcon />
                </div>
              </CardHeader>
              <CardContent className="mt-3.5 sm:mt-5 p-0">
                <div className="text-lg leading-6 font-bold text-orange-600 dark:text-orange-400 sm:text-xl md:text-2xl">
                  {metrics.agents}
                </div>
              </CardContent>
              <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
                <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Field Agents</span>
                <span className="text-[11px] leading-4 sm:text-xs font-semibold text-orange-500">Community partners</span>
              </CardFooter>
            </Card>

            <Card beamIndex={2}>
              <CardHeader className="justify-between">
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-950">
                  <WindowIcon />
                </div>
              </CardHeader>
              <CardContent className="mt-3.5 sm:mt-5 p-0">
                <div className="text-lg leading-6 font-bold text-brand-600 dark:text-brand-400 sm:text-xl md:text-2xl">
                  {metrics.managers}
                </div>
              </CardContent>
              <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between p-0">
                <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Hub Managers</span>
                <span className="text-[11px] leading-4 sm:text-xs font-semibold text-brand-600">Dispatch control</span>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Main Staff Table Card */}
        <Card className="p-0 overflow-hidden">
          <CardHeader className="p-5 pb-4">
            <div>
              <CardTitle>Staff Directory</CardTitle>
              <p className="mt-0.5 text-xs text-text-tertiary">
                Showing {filteredStaff.length} of {staffList.length} staff accounts
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
                  placeholder="Search staff name, email, phone..."
                  className="pl-2 text-xs"
                />
              </InputGroup>

              {/* Role Filter */}
              <div className="flex items-center gap-1 rounded-lg border border-card-border bg-background-gray-primary p-0.5">
                {(["ALL", "DRIVER", "AGENT", "MANAGER", "ADMIN"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer",
                      roleFilter === r
                        ? "bg-card-background text-text-primary font-semibold shadow-xs"
                        : "text-text-tertiary hover:text-text-primary"
                    )}
                  >
                    {r === "ALL" ? "All Roles" : r.charAt(0) + r.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          {/* Table */}
          {initialLoading ? (
            <div className="p-5">
              <SkeletonTable rows={6} columns={6} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <TableRoot className="w-full rounded-none border-none">
                <TableHeader>
                  <TableRow className="border-t border-b border-border-primary bg-background-gray-primary/40">
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Personnel
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Contact Phone
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Assigned Role
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Status
                    </TableHead>
                    <TableHead className="px-5 py-3 text-xs font-semibold text-text-secondary">
                      Joined
                    </TableHead>
                    <TableHead className="px-4 py-3 text-right text-xs font-semibold text-text-secondary">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredStaff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-xs text-text-tertiary">
                        No staff members match the selected criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map((staff) => (
                      <TableRow key={staff.id} className="hover:bg-background-gray-primary/50 transition-colors">
                        <TableCell className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">
                              <AvatarFallback className="border border-card-border bg-primary/10 text-primary font-bold">
                                {staff.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-xs text-text-primary">{staff.name}</div>
                              <div className="text-[11px] text-text-tertiary">{staff.email}</div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-5 py-3 font-mono text-xs text-text-secondary">
                          {staff.phone}
                        </TableCell>

                        <TableCell className="px-5 py-3">
                          <Badge color={getRoleBadgeColor(staff.role)} size="sm">
                            {staff.role}
                          </Badge>
                        </TableCell>

                        <TableCell className="px-5 py-3">
                          <Badge color={staff.status === "ACTIVE" ? "success" : "neutral"} size="sm">
                            {staff.status === "ACTIVE" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>

                        <TableCell className="px-5 py-3 font-mono text-xs text-text-tertiary whitespace-nowrap">
                          {new Date(staff.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>

                        <TableCell className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="xs"
                              iconOnly
                              onClick={() => openEditModal(staff)}
                              className="text-icon-secondary hover:text-text-primary"
                              title="Edit Details"
                            >
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              iconOnly
                              onClick={() => openPasswordModal(staff)}
                              className="text-icon-secondary hover:text-text-primary"
                              title="Change Password"
                            >
                              <KeyRound className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              iconOnly
                              onClick={() => handleToggleStatus(staff)}
                              className={cn(
                                staff.status === "ACTIVE"
                                  ? "text-orange-500 hover:text-orange-600"
                                  : "text-green-600 hover:text-green-700"
                              )}
                              title={staff.status === "ACTIVE" ? "Deactivate" : "Activate"}
                            >
                              {staff.status === "ACTIVE" ? <UserX className="size-3.5" /> : <UserCheck className="size-3.5" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="xs"
                              iconOnly
                              onClick={() => openDeleteModal(staff)}
                              className="text-destructive hover:bg-destructive/10"
                              title="Remove"
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

        {/* Modal: Add Staff Member */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Staff Member"
        >
          <form onSubmit={handleCreateStaff} className="space-y-4">
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
                placeholder="e.g. John Kpodo"
                value={newStaffData.name}
                onChange={(e) => setNewStaffData((p) => ({ ...p, name: e.target.value }))}
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
                  value={newStaffData.phone}
                  onChange={(e) => setNewStaffData((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-primary">Email Address</label>
                <input
                  required
                  type="email"
                  placeholder="john@fnetwater.com"
                  value={newStaffData.email}
                  onChange={(e) => setNewStaffData((p) => ({ ...p, email: e.target.value }))}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-primary">System Role</label>
                <select
                  value={newStaffData.role}
                  onChange={(e) => setNewStaffData((p) => ({ ...p, role: e.target.value as RoleType }))}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="DRIVER">Delivery Driver</option>
                  <option value="AGENT">Field Agent</option>
                  <option value="MANAGER">Operations Manager</option>
                  <option value="ADMIN">Executive Administrator</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-primary">Initial Password</label>
                <input
                  required
                  type="password"
                  placeholder="Min. 6 characters"
                  value={newStaffData.password}
                  onChange={(e) => setNewStaffData((p) => ({ ...p, password: e.target.value }))}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
              <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Staff"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Edit Staff */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit ${activeStaff?.name}`}
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
                value={editStaffData.name}
                onChange={(e) => setEditStaffData((p) => ({ ...p, name: e.target.value }))}
                className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-primary">Phone Number</label>
                <input
                  required
                  type="tel"
                  value={editStaffData.phone}
                  onChange={(e) => setEditStaffData((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-text-primary">Role</label>
                <select
                  value={editStaffData.role}
                  onChange={(e) => setEditStaffData((p) => ({ ...p, role: e.target.value as RoleType }))}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="DRIVER">Delivery Driver</option>
                  <option value="AGENT">Field Agent</option>
                  <option value="MANAGER">Operations Manager</option>
                  <option value="ADMIN">Executive Administrator</option>
                </select>
              </div>
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

        {/* Modal: Change Password */}
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          title={`Set Password for ${activeStaff?.name}`}
        >
          <form onSubmit={handleSavePassword} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-lg bg-error-50 border border-error-200 text-red-600 text-xs">
                {formError}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-primary">New Password</label>
              <input
                required
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-text-primary">Confirm New Password</label>
              <input
                required
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-lg border border-input-border bg-input-background text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-card-border">
              <Button variant="ghost" size="sm" onClick={() => setIsPasswordModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Confirm Delete */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Remove Staff Account"
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary leading-relaxed">
              Are you sure you want to delete <strong className="text-text-primary">{activeStaff?.name}</strong>? Their portal access will be permanently revoked immediately.
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
                {isSubmitting ? "Removing..." : "Remove Staff"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
