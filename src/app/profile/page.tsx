"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import AppLayout from "@/components/layout/AppLayout";
import Modal from "@/components/ui/Modal";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Card } from "@/components/tailgrids/core/card";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import Skeleton from "@/components/ui/skeleton";
import type { RoleType } from "@/types/next-auth";
import { X, Edit2, MapPin, KeyRound, User, Mail, Phone, Calendar, Shield, Check } from "lucide-react";

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: RoleType;
  status: string;
  createdAt: string;
  customerCode?: string;
  bottlesHeld?: number;
  dispenserPlan?: string;
  deliveryArea?: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modals state
  const [isEditInfoOpen, setIsEditInfoOpen] = useState(false);
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Forms state
  const [infoForm, setInfoForm] = useState({ name: "", email: "", phone: "" });
  const [addressForm, setAddressForm] = useState({ deliveryArea: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch current user profile
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user/profile");
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setInfoForm({
          name: data.profile.name || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
        });
        setAddressForm({
          deliveryArea: data.profile.deliveryArea || "East Legon",
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Action: Save Personal Info
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "details",
          name: infoForm.name,
          email: infoForm.email,
          phone: infoForm.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to update profile.");
        setIsSubmitting(false);
        return;
      }

      setProfile(data.profile);
      setIsEditInfoOpen(false);
      setFeedback({ type: "success", text: "Personal information updated successfully." });
    } catch {
      setFormError("Network connection error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Save Address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "details",
          deliveryArea: addressForm.deliveryArea,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to update address.");
        setIsSubmitting(false);
        return;
      }

      setProfile(data.profile);
      setIsEditAddressOpen(false);
      setFeedback({ type: "success", text: "Operating address updated successfully." });
    } catch {
      setFormError("Network connection error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action: Change Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (passwordForm.newPassword.length < 6) {
      setFormError("New password must be at least 6 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "password",
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to change password.");
        setIsSubmitting(false);
        return;
      }

      setIsChangePasswordOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setFeedback({ type: "success", text: "Password changed successfully." });
    } catch {
      setFormError("Network connection error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const userRole: RoleType = profile?.role || (session?.user as { role?: RoleType })?.role || "ADMIN";

  const homeHref =
    userRole === "ADMIN"
      ? "/admin"
      : userRole === "MANAGER"
      ? "/manager"
      : userRole === "DRIVER"
      ? "/driver"
      : userRole === "AGENT"
      ? "/agent"
      : "/customer";

  const getRoleBadgeColor = (role: RoleType): "primary" | "cyan" | "success" | "warning" | "neutral" => {
    switch (role) {
      case "ADMIN":
        return "primary";
      case "MANAGER":
        return "cyan";
      case "DRIVER":
        return "success";
      case "AGENT":
        return "warning";
      case "CUSTOMER":
      default:
        return "neutral";
    }
  };

  return (
    <AppLayout role={userRole}>
      <div className="space-y-6">
        {/* Breadcrumbs & Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Account Profile
            </h1>
            <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
              Manage your personal information, operating address, and account credentials.
            </p>
          </div>
          <div>
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: homeHref },
                { label: "Profile" },
              ]}
            />
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`flex items-center justify-between rounded-xl p-4 text-xs font-semibold sm:text-sm ${
              feedback.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Check className="size-4 shrink-0" />
              <span>{feedback.text}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-text-tertiary hover:text-text-primary cursor-pointer p-0.5"
              aria-label="Dismiss feedback"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-5">
                <Skeleton className="size-20 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48 rounded-lg" />
                  <Skeleton className="h-4 w-32 rounded-lg" />
                </div>
              </div>
            </Card>
            <Card className="p-6 space-y-4">
              <Skeleton className="h-5 w-40 rounded-lg" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Hero Card */}
            <Card className="p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex size-18 sm:size-20 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-white shadow-xs">
                    {profile?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-bold text-text-primary sm:text-2xl">
                        {profile?.name}
                      </h2>
                      <Badge color={getRoleBadgeColor(userRole)} size="sm">
                        {userRole}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-tertiary sm:text-sm">
                      <span>{profile?.email}</span>
                      <span>•</span>
                      <span className="font-mono">{profile?.phone}</span>
                      <span>•</span>
                      <span>Ghana</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    appearance="outline"
                    size="sm"
                    onClick={() => {
                      setFormError(null);
                      setIsEditInfoOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Edit2 className="size-3.5" />
                    <span>Edit Profile</span>
                  </Button>
                  <Button
                    appearance="outline"
                    size="sm"
                    onClick={() => {
                      setFormError(null);
                      setIsChangePasswordOpen(true);
                    }}
                    className="gap-2"
                  >
                    <KeyRound className="size-3.5" />
                    <span>Change Password</span>
                  </Button>
                </div>
              </div>
            </Card>

            {/* Profile Grid: Personal Details & Operating Location */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Personal Information */}
              <Card className="p-6">
                <div className="flex items-center justify-between border-b border-card-border pb-4">
                  <div className="flex items-center gap-2">
                    <User className="size-4.5 text-primary" />
                    <h3 className="text-base font-bold text-text-primary">
                      Personal Information
                    </h3>
                  </div>
                  <Button
                    appearance="ghost"
                    size="sm"
                    onClick={() => setIsEditInfoOpen(true)}
                    className="text-xs font-semibold text-primary"
                  >
                    Edit
                  </Button>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-card-border/60">
                    <span className="text-text-tertiary font-medium">Full Name</span>
                    <span className="text-text-primary font-bold">{profile?.name}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-card-border/60">
                    <span className="text-text-tertiary font-medium">Email Address</span>
                    <span className="text-text-primary font-medium">{profile?.email}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-card-border/60">
                    <span className="text-text-tertiary font-medium">Phone Number</span>
                    <span className="text-text-primary font-mono font-bold">{profile?.phone}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-card-border/60">
                    <span className="text-text-tertiary font-medium">Account Role</span>
                    <Badge color={getRoleBadgeColor(userRole)} size="sm">
                      {userRole}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center text-xs sm:text-sm py-1">
                    <span className="text-text-tertiary font-medium">Member Since</span>
                    <span className="text-text-secondary">
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "2024"}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Operating Address & Operational Metadata */}
              <Card className="p-6">
                <div className="flex items-center justify-between border-b border-card-border pb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4.5 text-primary" />
                    <h3 className="text-base font-bold text-text-primary">
                      Operating Location
                    </h3>
                  </div>
                  <Button
                    appearance="ghost"
                    size="sm"
                    onClick={() => setIsEditAddressOpen(true)}
                    className="text-xs font-semibold text-primary"
                  >
                    Update
                  </Button>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-card-border/60">
                    <span className="text-text-tertiary font-medium">Operating Territory</span>
                    <span className="text-text-primary font-bold">
                      {profile?.deliveryArea || "East Legon, Accra"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-card-border/60">
                    <span className="text-text-tertiary font-medium">Country / Region</span>
                    <span className="text-text-secondary font-medium">Greater Accra, Ghana</span>
                  </div>

                  {userRole === "CUSTOMER" && (
                    <>
                      <div className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-card-border/60">
                        <span className="text-text-tertiary font-medium">Bottles Held</span>
                        <span className="text-text-primary font-bold font-mono">
                          {profile?.bottlesHeld ?? 0} Bottles
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-card-border/60">
                        <span className="text-text-tertiary font-medium">Dispenser Agreement</span>
                        <span className="text-text-secondary">
                          {profile?.dispenserPlan || "None active"}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center text-xs sm:text-sm py-1">
                    <span className="text-text-tertiary font-medium">Account Status</span>
                    <Badge color="success" size="sm">
                      Active
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* MODAL 1: Edit Info */}
        <Modal
          isOpen={isEditInfoOpen}
          onClose={() => setIsEditInfoOpen(false)}
          title="Edit Personal Information"
        >
          {formError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveInfo} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Full Name
              </label>
              <input
                type="text"
                required
                value={infoForm.name}
                onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-sm text-text-primary focus:outline-hidden focus:border-primary transition"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-text-primary">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={infoForm.email}
                  onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                  className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-sm text-text-primary focus:outline-hidden focus:border-primary transition"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-text-primary">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={infoForm.phone}
                  onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                  className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-sm text-text-primary focus:outline-hidden focus:border-primary transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-card-border">
              <Button
                type="button"
                appearance="outline"
                size="sm"
                onClick={() => setIsEditInfoOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* MODAL 2: Edit Address */}
        <Modal
          isOpen={isEditAddressOpen}
          onClose={() => setIsEditAddressOpen(false)}
          title="Edit Operating Address"
        >
          {formError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Primary Operating Area / Delivery Location
              </label>
              <input
                type="text"
                required
                placeholder="e.g. East Legon, Accra"
                value={addressForm.deliveryArea}
                onChange={(e) => setAddressForm({ ...addressForm, deliveryArea: e.target.value })}
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-sm text-text-primary focus:outline-hidden focus:border-primary transition"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-card-border">
              <Button
                type="button"
                appearance="outline"
                size="sm"
                onClick={() => setIsEditAddressOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting ? "Saving..." : "Save Location"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* MODAL 3: Change Password */}
        <Modal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          title="Change Account Password"
        >
          {formError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              {formError}
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Current Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-sm text-text-primary focus:outline-hidden focus:border-primary transition"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-text-primary">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-sm text-text-primary focus:outline-hidden focus:border-primary transition"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-text-primary">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-sm text-text-primary focus:outline-hidden focus:border-primary transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-card-border">
              <Button
                type="button"
                appearance="outline"
                size="sm"
                onClick={() => setIsChangePasswordOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
