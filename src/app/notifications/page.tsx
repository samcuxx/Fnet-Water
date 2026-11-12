"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/context/ToastContext";
import type { NotificationItem } from "@/components/header/NotificationDropdown";

interface SmsLogItem {
  id: string;
  recipientPhone: string;
  message: string;
  status: "DELIVERED" | "QUEUED" | "FAILED";
  type: string;
  sentAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [smsLogs, setSmsLogs] = useState<SmsLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "ORDERS" | "DISPENSERS" | "REWARDS" | "SMS_LOGS">("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const role = (session?.user as any)?.role || "CUSTOMER";

  // Fetch notifications and SMS logs
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [notifsRes, smsRes] = await Promise.all([
        fetch("/api/notifications"),
        fetch("/api/notifications/sms-logs"),
      ]);

      if (notifsRes.ok) {
        const notifData = await notifsRes.json();
        if (notifData.success) {
          setNotifications(notifData.notifications || []);
        }
      }

      if (smsRes.ok) {
        const smsData = await smsRes.json();
        if (smsData.success) {
          setSmsLogs(smsData.logs || []);
        }
      }
    } catch (err) {
      console.warn("Failed to load notifications page data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session?.user]);

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        showToast({
          type: "success",
          title: "All Marked as Read",
          message: "All alerts in your inbox have been updated.",
        });
      }
    } catch (err) {
      console.warn("Error marking all read:", err);
    }
  };

  // Mark single as read
  const handleToggleRead = async (id: string, currentRead: boolean) => {
    if (currentRead) return; // already read
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.warn("Error marking read:", err);
    }
  };

  // Compute metrics
  const totalCount = notifications.length;
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const operationalCount = notifications.filter(
    (n) => n.type === "ORDER" || n.type === "DELIVERY"
  ).length;
  const totalSmsCount = smsLogs.length;

  // Filtered list
  const filteredNotifications = notifications.filter((n) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchMsg = n.message.toLowerCase().includes(q);
      if (!matchTitle && !matchMsg) return false;
    }

    // 2. Tab Filter
    if (activeTab === "UNREAD") return !n.isRead;
    if (activeTab === "ORDERS") return n.type === "ORDER" || n.type === "DELIVERY";
    if (activeTab === "DISPENSERS") return n.type === "DISPENSER" || n.type === "INVENTORY";
    if (activeTab === "REWARDS") return n.type === "REWARD";
    return true;
  });

  return (
    <AppLayout role={role}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Notification Center
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Live notifications, delivery alerts, and text message confirmation logs.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs cursor-pointer"
              >
                <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Mark All Read</span>
              </button>
            )}

            <button
              type="button"
              onClick={fetchData}
              aria-label="Refresh notifications"
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Alerts</span>
              <div className="size-8 rounded-xl bg-blue-50 dark:bg-brand-950 text-brand-600 dark:text-sky-400 flex items-center justify-center">
                <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {totalCount}
            </div>
            <p className="mt-1 text-[11px] text-gray-400">Received notifications</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Unread</span>
              <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {unreadCount}
            </div>
            <p className="mt-1 text-[11px] text-gray-400">Awaiting your review</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Orders & Deliveries</span>
              <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-2v4h4v-2a2 2 0 00-2-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {operationalCount}
            </div>
            <p className="mt-1 text-[11px] text-gray-400">Fulfillment events</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">SMS Dispatches</span>
              <div className="size-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {totalSmsCount}
            </div>
            <p className="mt-1 text-[11px] text-gray-400">Text message audit records</p>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              All Alerts ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("UNREAD")}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "UNREAD"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ORDERS")}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "ORDERS"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Orders & Deliveries
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("DISPENSERS")}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "DISPENSERS"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Dispensers & Stock
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("REWARDS")}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "REWARDS"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Rewards
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("SMS_LOGS")}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "SMS_LOGS"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              SMS Logs ({totalSmsCount})
            </button>
          </div>

          {activeTab !== "SMS_LOGS" && (
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alerts..."
                className="w-full px-3 py-1.5 pl-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-1 focus:ring-brand-500"
              />
              <svg
                className="size-3.5 absolute left-2.5 top-2.5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Content Body: Notifications List OR SMS Delivery Logs */}
        {activeTab === "SMS_LOGS" ? (
          /* SMS Audit Logs View */
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  SMS Text Message Dispatches
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Audit ledger of transactional messages sent to Ghanaian phone numbers.
                </p>
              </div>
              <span className="text-xs font-bold text-gray-500">
                {smsLogs.length} logged
              </span>
            </div>

            {smsLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-500">
                No SMS logs recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {smsLogs.map((log) => (
                  <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white font-mono">
                          {log.recipientPhone}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {log.status}
                        </span>
                        <span className="text-[10px] text-gray-400 uppercase font-mono">
                          {log.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {log.message}
                      </p>
                    </div>

                    <div className="text-right text-[11px] text-gray-400 shrink-0">
                      {new Date(log.sentAt).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} • {new Date(log.sentAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Notifications List View */
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-12 text-center text-xs text-gray-500">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="size-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <svg className="size-6" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                  No notifications match your filter
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  Try clearing your search query or selecting a different tab.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 sm:p-5 flex items-start gap-4 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition group ${
                      !notif.isRead ? "bg-brand-50/20 dark:bg-brand-950/20" : ""
                    }`}
                  >
                    {/* Unread dot / Type Icon */}
                    <div className="relative shrink-0 mt-0.5">
                      <div
                        className={`size-10 rounded-2xl flex items-center justify-center ${
                          notif.type === "ORDER"
                            ? "bg-brand-100 text-brand-600 dark:bg-brand-950 dark:text-sky-300"
                            : notif.type === "DELIVERY"
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300"
                            : notif.type === "REWARD"
                            ? "bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300"
                            : notif.type === "DISPENSER"
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300"
                            : notif.type === "INVENTORY"
                            ? "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {notif.type === "ORDER" && (
                          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                            <path
                              fillRule="evenodd"
                              d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {notif.type === "DELIVERY" && (
                          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-2v4h4v-2a2 2 0 00-2-2z" />
                          </svg>
                        )}
                        {notif.type === "REWARD" && (
                          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M10 2a1 1 0 01.894.553l2.991 5.982 6.603.96a1 1 0 01.554 1.705l-4.778 4.657 1.128 6.576a1 1 0 01-1.451 1.054L10 16.347l-5.921 3.14a1 1 0 01-1.451-1.054l1.128-6.576L-1.022 11.2a1 1 0 01.554-1.705l6.603-.96 2.991-5.982A1 1 0 0110 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {(notif.type === "DISPENSER" || notif.type === "INVENTORY") && (
                          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {(notif.type === "SYSTEM" || notif.type === "PAYMENT") && (
                          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      {!notif.isRead && (
                        <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-brand-500 ring-2 ring-white dark:ring-gray-900" />
                      )}
                    </div>

                    {/* Notification Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                            {notif.title}
                          </h4>
                          {!notif.isRead && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-sky-300">
                              New
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400 whitespace-nowrap">
                          {new Date(notif.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        {notif.message}
                      </p>

                      {/* Bottom Action Links */}
                      <div className="mt-3 flex items-center gap-3">
                        {notif.linkUrl && (
                          <Link
                            href={notif.linkUrl}
                            onClick={() => handleToggleRead(notif.id, notif.isRead)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-sky-400 hover:text-brand-800 dark:hover:text-sky-300 transition"
                          >
                            <span>Open Record</span>
                            <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </Link>
                        )}

                        {!notif.isRead && (
                          <button
                            type="button"
                            onClick={() => handleToggleRead(notif.id, notif.isRead)}
                            className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition cursor-pointer"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
