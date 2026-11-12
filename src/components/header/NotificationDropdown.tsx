"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/context/ToastContext";

export interface NotificationItem {
  id: string;
  userId?: string | null;
  role?: string | null;
  title: string;
  message: string;
  type: "ORDER" | "DELIVERY" | "DISPENSER" | "INVENTORY" | "REWARD" | "SYSTEM" | "PAYMENT";
  linkUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

function formatRelativeTime(dateString: string): string {
  try {
    const now = Date.now();
    const past = new Date(dateString).getTime();
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 172800) return "Yesterday";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "Recent";
  }
}

export default function NotificationDropdown() {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "ORDERS" | "ALERTS">("ALL");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [session?.user]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Toggle open
  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
  };

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
        setUnreadCount(0);
        showToast({
          type: "success",
          title: "All Caught Up",
          message: "All notifications marked as read.",
        });
      }
    } catch (err) {
      console.warn("Mark all read failed:", err);
    }
  };

  // Mark single as read
  const handleMarkSingleRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.warn("Mark single read failed:", err);
    }
  };

  // Click notification to navigate
  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.isRead) {
      // Mark read in background
      fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notif.id }),
      }).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setIsOpen(false);
    if (notif.linkUrl) {
      router.push(notif.linkUrl);
    }
  };

  // Filtered list
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "UNREAD") return !n.isRead;
    if (activeTab === "ORDERS") return n.type === "ORDER" || n.type === "DELIVERY";
    if (activeTab === "ALERTS") return n.type === "DISPENSER" || n.type === "INVENTORY";
    return true;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        aria-label="View notifications"
        className="relative flex items-center justify-center size-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition shadow-xs focus:outline-hidden cursor-pointer"
      >
        <svg
          className="size-4.5"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-gray-200/90 dark:border-gray-800/90 bg-white/95 dark:bg-gray-900/95 shadow-2xl backdrop-blur-xl z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-950/40">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Notification Center
              </h4>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-sky-300">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-brand-600 dark:text-sky-400 hover:text-brand-800 dark:hover:text-sky-300 transition cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 dark:border-gray-800/80 bg-white dark:bg-gray-900 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === "ALL"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("UNREAD")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === "UNREAD"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ORDERS")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === "ORDERS"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Orders
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ALERTS")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === "ALERTS"
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Alerts
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 dark:text-gray-400">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="size-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-2 text-gray-400">
                  <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  No notifications
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  You are all caught up on alerts.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition cursor-pointer group ${
                    !notif.isRead
                      ? "bg-brand-50/25 dark:bg-brand-950/20"
                      : "bg-transparent"
                  }`}
                >
                  {/* Type Icon Badge */}
                  <div
                    className={`size-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
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
                      <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                        <path
                          fillRule="evenodd"
                          d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {notif.type === "DELIVERY" && (
                      <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-2v4h4v-2a2 2 0 00-2-2z" />
                      </svg>
                    )}
                    {notif.type === "REWARD" && (
                      <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 2a1 1 0 01.894.553l2.991 5.982 6.603.96a1 1 0 01.554 1.705l-4.778 4.657 1.128 6.576a1 1 0 01-1.451 1.054L10 16.347l-5.921 3.14a1 1 0 01-1.451-1.054l1.128-6.576L-1.022 11.2a1 1 0 01.554-1.705l6.603-.96 2.991-5.982A1 1 0 0110 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {(notif.type === "DISPENSER" || notif.type === "INVENTORY") && (
                      <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {(notif.type === "SYSTEM" || notif.type === "PAYMENT") && (
                      <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {notif.title}
                      </h5>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap shrink-0">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  {/* Mark Read Check Action */}
                  {!notif.isRead && (
                    <button
                      type="button"
                      title="Mark as read"
                      onClick={(e) => handleMarkSingleRead(notif.id, e)}
                      className="size-5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition cursor-pointer text-gray-400 hover:text-gray-700 dark:hover:text-white"
                    >
                      <svg className="size-3" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Bottom Footer Link */}
          <div className="p-2.5 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-950/40 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-brand-600 dark:text-sky-400 hover:text-brand-800 dark:hover:text-sky-300 transition"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
