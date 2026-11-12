"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Bell,
  CheckCircle2,
  ShoppingBag,
  Truck,
  Gift,
  Cpu,
  AlertTriangle,
  Info,
  CreditCard,
  Check,
  ChevronRight,
} from "lucide-react";
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

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      try {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: notif.id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.warn("Failed marking notification read on click", err);
      }
    }
    setIsOpen(false);
    if (notif.linkUrl) {
      router.push(notif.linkUrl);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "UNREAD") return !notif.isRead;
    if (activeTab === "ORDERS") return notif.type === "ORDER" || notif.type === "DELIVERY";
    if (activeTab === "ALERTS")
      return (
        notif.type === "DISPENSER" ||
        notif.type === "INVENTORY" ||
        notif.type === "SYSTEM"
      );
    return true;
  });

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "ORDER":
        return <ShoppingBag className="size-4" />;
      case "DELIVERY":
        return <Truck className="size-4" />;
      case "REWARD":
        return <Gift className="size-4" />;
      case "DISPENSER":
        return <Cpu className="size-4" />;
      case "INVENTORY":
        return <AlertTriangle className="size-4" />;
      case "PAYMENT":
        return <CreditCard className="size-4" />;
      case "SYSTEM":
      default:
        return <Info className="size-4" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        aria-label="View notifications"
        className="relative flex items-center justify-center size-9 rounded-xl border border-border bg-card text-foreground hover:bg-muted transition shadow-xs focus:outline-hidden cursor-pointer"
      >
        <Bell className="size-4.5" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-lg border border-border bg-popover/95 text-popover-foreground shadow-2xl backdrop-blur-xl z-50 overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Notification Center
              </h4>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-primary hover:underline transition cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-popover overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === "ALL"
                  ? "bg-primary text-primary-foreground font-bold"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("UNREAD")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === "UNREAD"
                  ? "bg-primary text-primary-foreground font-bold"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Unread
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ORDERS")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === "ORDERS"
                  ? "bg-primary text-primary-foreground font-bold"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Orders
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ALERTS")}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                activeTab === "ALERTS"
                  ? "bg-primary text-primary-foreground font-bold"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Alerts
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border custom-scrollbar">
            {isLoading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="size-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-muted-foreground">
                  <CheckCircle2 className="size-5 text-emerald-500" />
                </div>
                <p className="text-xs font-semibold text-foreground">
                  No notifications
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  You are all caught up on alerts.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-muted/50 transition cursor-pointer group ${
                    !notif.isRead
                      ? "bg-accent/40"
                      : "bg-transparent"
                  }`}
                >
                  {/* Type Icon Badge */}
                  <div
                    className={`size-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.type === "ORDER"
                        ? "bg-primary/10 text-primary"
                        : notif.type === "DELIVERY"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : notif.type === "REWARD"
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                        : notif.type === "DISPENSER"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : notif.type === "INVENTORY"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="text-xs font-bold text-foreground truncate">
                        {notif.title}
                      </h5>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>

                  {/* Mark Read Check Action */}
                  {!notif.isRead && (
                    <button
                      type="button"
                      title="Mark as read"
                      onClick={(e) => handleMarkSingleRead(notif.id, e)}
                      className="size-5 rounded-full hover:bg-muted flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      <Check className="size-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Bottom Footer Link */}
          <div className="p-2.5 border-t border-border bg-muted/30 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline transition"
            >
              <span>View all notifications</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
