"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import AppLayout from "@/components/layout/AppLayout";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import type { RoleType } from "@/types/next-auth";

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
          deliveryArea: data.profile.deliveryArea || "East Legon, Greater Accra",
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
      setFormError("Network error occurred.");
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
      setFeedback({ type: "success", text: "Address details updated successfully." });
    } catch {
      setFormError("Network error occurred.");
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
      setFormError("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const userRole: RoleType = profile?.role || (session?.user as { role?: RoleType })?.role || "ADMIN";

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
      case "CUSTOMER":
        return "dark";
      default:
        return "dark";
    }
  };

  return (
    <AppLayout role={userRole}>
      <div className="space-y-6">
        {/* Toast / Notification Banner */}
        {feedback && (
          <div
            className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-all ${
              feedback.type === "success"
                ? "bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 text-green-700 dark:text-green-300"
                : "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300"
            }`}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* Page Container matching ui_template UserProfiles.tsx */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6 shadow-theme-xs">
          <div className="mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Account Profile
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Manage your personal information, operating address, and account credentials.
            </p>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="size-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Loading profile data...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* CARD 1: UserMetaCard (Derived from ui_template UserMetaCard.tsx) */}
              <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <div className="flex flex-col gap-5 mb-6 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-col items-center w-full gap-5 sm:flex-row">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-brand-500 text-white font-bold text-2xl sm:text-3xl shrink-0 ring-4 ring-brand-100 dark:ring-brand-950">
                      {profile?.name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div className="text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                          {profile?.name}
                        </h2>
                        <Badge color={getRoleBadgeColor(userRole)} variant="light" size="sm">
                          {userRole}
                        </Badge>
                      </div>

                      <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <span>{profile?.email}</span>
                        <span className="hidden sm:inline">&bull;</span>
                        <span className="font-mono">{profile?.phone}</span>
                        <span className="hidden sm:inline">&bull;</span>
                        <span>Greater Accra, Ghana</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFormError(null);
                      setIsEditInfoOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/60 lg:inline-flex lg:w-auto shrink-0 cursor-pointer"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Edit Info
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Full Name</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.name}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email Address</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.email}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contact Phone</p>
                      <p className="text-sm font-medium font-mono text-gray-900 dark:text-white">
                        {profile?.phone}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Assigned Role</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{userRole}</p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Identifier</p>
                      <p className="text-sm font-medium font-mono text-gray-900 dark:text-white">
                        {profile?.customerCode || profile?.id || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Account Created</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Active"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: UserAddressCard (Derived from ui_template UserAddressCard.tsx) */}
              <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      Operating Address &amp; Delivery Zone
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Location for water deliveries and operations dispatch.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFormError(null);
                      setIsEditAddressOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/60 sm:w-auto shrink-0 cursor-pointer"
                  >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Edit Location
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Country</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Ghana</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Region / Province</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Greater Accra Region</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Primary Operating Zone</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profile?.deliveryArea || "East Legon, Accra"}
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD 3: Security & Credentials Card */}
              <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      Account Security &amp; Credentials
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Ensure your account remains safe with password updates.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFormError(null);
                      setIsChangePasswordOpen(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/60 sm:w-auto shrink-0 cursor-pointer"
                  >
                    <svg className="size-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL 1: Edit Personal Details */}
        <Modal
          isOpen={isEditInfoOpen}
          onClose={() => setIsEditInfoOpen(false)}
          title="Edit Personal Information"
        >
          {formError && (
            <div className="mb-4 p-3 rounded-lg text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveInfo} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={infoForm.name}
                onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })}
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
                  value={infoForm.email}
                  onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
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
                  value={infoForm.phone}
                  onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsEditInfoOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
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

        {/* MODAL 2: Edit Address */}
        <Modal
          isOpen={isEditAddressOpen}
          onClose={() => setIsEditAddressOpen(false)}
          title="Edit Operating Address"
        >
          {formError && (
            <div className="mb-4 p-3 rounded-lg text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Primary Operating Area / Delivery Location
              </label>
              <input
                type="text"
                required
                placeholder="e.g. East Legon, Accra"
                value={addressForm.deliveryArea}
                onChange={(e) => setAddressForm({ ...addressForm, deliveryArea: e.target.value })}
                className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsEditAddressOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Saving..." : "Save Location"}
              </button>
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
            <div className="mb-4 p-3 rounded-lg text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsChangePasswordOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
