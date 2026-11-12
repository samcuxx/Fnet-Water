"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AppLayout from "@/components/layout/AppLayout";
import { useToast } from "@/context/ToastContext";
import type { NotificationItem } from "@/components/header/NotificationDropdown";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Card } from "@/components/tailgrids/core/card";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { SearchIcon } from "@/components/common/header/icons";
import {
  CheckCheck,
  RotateCw,
  Bell,
  AlertCircle,
  Truck,
  MessageSquare,
  CheckCircle2,
  Package,
  Gift,
  AlertTriangle,
  Info,
  ArrowRight,
} from "lucide-react";

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
  const homeHref =
    role === "ADMIN"
      ? "/admin"
      : role === "MANAGER"
      ? "/manager"
      : role === "DRIVER"
      ? "/driver"
      : role === "AGENT"
      ? "/agent"
      : "/customer";

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
    if (currentRead) return;
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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title.toLowerCase().includes(q);
      const matchMsg = n.message.toLowerCase().includes(q);
      if (!matchTitle && !matchMsg) return false;
    }

    if (activeTab === "UNREAD") return !n.isRead;
    if (activeTab === "ORDERS") return n.type === "ORDER" || n.type === "DELIVERY";
    if (activeTab === "DISPENSERS") return n.type === "DISPENSER" || n.type === "INVENTORY";
    if (activeTab === "REWARDS") return n.type === "REWARD";
    return true;
  });

  return (
    <AppLayout role={role}>
      <div className="space-y-6">
        {/* Breadcrumbs & Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Notification Center
            </h1>
            <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
              Live notifications, delivery alerts, and SMS confirmation audit logs.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: homeHref },
                { label: "Notifications" },
              ]}
            />
            {unreadCount > 0 && (
              <Button
                appearance="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="gap-2 text-xs font-semibold"
              >
                <CheckCheck className="size-3.5" />
                <span>Mark All Read</span>
              </Button>
            )}
            <Button
              appearance="outline"
              size="sm"
              iconOnly
              onClick={fetchData}
              aria-label="Refresh notifications"
              className="text-icon-secondary"
            >
              <RotateCw className="size-4" />
            </Button>
          </div>
        </div>

        {/* 4 KPI Overview Cards (NextAdmin Pro Style) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
          {/* Card 1: Total Alerts */}
          <Card beamIndex={0}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-text-secondary">
                  Total Alerts
                </span>
                <h3 className="mt-1 text-lg font-bold text-text-primary sm:text-2xl lg:text-3xl">
                  {totalCount}
                </h3>
              </div>
              <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-blue-light-100 text-primary dark:bg-blue-light-950/60 dark:text-blue-light-400">
                <Bell className="size-4 sm:size-5" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-text-tertiary">All received notifications</p>
          </Card>

          {/* Card 2: Unread */}
          <Card beamIndex={3}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-text-secondary">
                  Awaiting Review
                </span>
                <h3 className="mt-1 text-lg font-bold text-amber-600 dark:text-amber-400 sm:text-2xl lg:text-3xl">
                  {unreadCount}
                </h3>
              </div>
              <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <AlertCircle className="size-4 sm:size-5" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-text-tertiary">Unread alerts requiring action</p>
          </Card>

          {/* Card 3: Orders & Deliveries */}
          <Card beamIndex={1}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-text-secondary">
                  Orders &amp; Dispatch
                </span>
                <h3 className="mt-1 text-lg font-bold text-text-primary sm:text-2xl lg:text-3xl">
                  {operationalCount}
                </h3>
              </div>
              <div className="flex size-9 sm:size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Truck className="size-4 sm:size-5" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-text-tertiary">Fulfillment and delivery events</p>
          </Card>

          {/* Card 4: SMS Logs */}
          <Card beamIndex={2}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-text-secondary">
                  SMS Dispatches
                </span>
                <h3 className="mt-1 text-lg font-bold text-text-primary sm:text-2xl lg:text-3xl">
                  {totalSmsCount}
                </h3>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <MessageSquare className="size-5" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-text-tertiary">SMS confirmation ledger entries</p>
          </Card>
        </div>

        {/* Tab Filter & Search Bar */}
        <Card className="p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
              {[
                { id: "ALL", label: `All Alerts (${totalCount})` },
                { id: "UNREAD", label: `Unread (${unreadCount})` },
                { id: "ORDERS", label: "Orders & Deliveries" },
                { id: "DISPENSERS", label: "Dispensers & Stock" },
                { id: "REWARDS", label: "Rewards" },
                { id: "SMS_LOGS", label: `SMS Logs (${totalSmsCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-xs"
                      : "text-text-secondary hover:bg-background-gray-secondary hover:text-text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab !== "SMS_LOGS" && (
              <div className="w-full sm:w-64">
                <InputGroup>
                  <InputGroupAddon className="text-icon-secondary">
                    <SearchIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search alerts..."
                    className="text-xs"
                  />
                </InputGroup>
              </div>
            )}
          </div>
        </Card>

        {/* Content Body: Notifications List OR SMS Delivery Logs */}
        {activeTab === "SMS_LOGS" ? (
          <Card className="overflow-hidden p-0">
            <div className="border-b border-card-border p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  SMS Confirmation Dispatches
                </h3>
                <p className="text-xs text-text-tertiary">
                  Transactional messages sent to Ghanaian phone numbers.
                </p>
              </div>
              <Badge color="neutral" size="sm">
                {smsLogs.length} logged
              </Badge>
            </div>

            {smsLogs.length === 0 ? (
              <div className="p-12 text-center text-xs text-text-tertiary">
                No SMS logs recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-card-border">
                {smsLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-background-gray-secondary/50 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-primary font-mono">
                          {log.recipientPhone}
                        </span>
                        <Badge
                          color={log.status === "DELIVERED" ? "success" : log.status === "FAILED" ? "error" : "warning"}
                          size="sm"
                        >
                          {log.status}
                        </Badge>
                        <span className="text-[10px] text-text-tertiary uppercase font-mono">
                          {log.type}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary">
                        {log.message}
                      </p>
                    </div>

                    <div className="text-right text-[11px] text-text-tertiary shrink-0">
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
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            {isLoading ? (
              <div className="p-12 text-center text-xs text-text-tertiary">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="size-12 rounded-full bg-background-gray-secondary flex items-center justify-center mx-auto mb-3 text-emerald-500">
                  <CheckCircle2 className="size-6" />
                </div>
                <h4 className="text-sm font-bold text-text-primary">
                  No notifications match your filter
                </h4>
                <p className="text-xs text-text-tertiary mt-1">
                  Try clearing your search query or selecting a different tab.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-card-border">
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 sm:p-5 flex items-start gap-4 hover:bg-background-gray-secondary/40 transition group ${
                      !notif.isRead ? "bg-blue-light-50/30 dark:bg-blue-light-950/20" : ""
                    }`}
                  >
                    <div className="relative shrink-0 mt-0.5">
                      <div
                        className={`size-10 rounded-xl flex items-center justify-center ${
                          notif.type === "ORDER"
                            ? "bg-blue-light-100 text-primary dark:bg-blue-light-950/60 dark:text-blue-light-400"
                            : notif.type === "DELIVERY"
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : notif.type === "REWARD"
                            ? "bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400"
                            : notif.type === "DISPENSER"
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                            : notif.type === "INVENTORY"
                            ? "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                            : "bg-background-gray-secondary text-icon-secondary"
                        }`}
                      >
                        {notif.type === "ORDER" && <Package className="size-5" />}
                        {notif.type === "DELIVERY" && <Truck className="size-5" />}
                        {notif.type === "REWARD" && <Gift className="size-5" />}
                        {(notif.type === "DISPENSER" || notif.type === "INVENTORY") && (
                          <AlertTriangle className="size-5" />
                        )}
                        {(notif.type === "SYSTEM" || notif.type === "PAYMENT") && (
                          <Info className="size-5" />
                        )}
                      </div>
                      {!notif.isRead && (
                        <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-2 ring-card-background" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-text-primary">
                            {notif.title}
                          </h4>
                          {!notif.isRead && (
                            <Badge color="primary" size="sm">
                              New
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-text-tertiary whitespace-nowrap">
                          {new Date(notif.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-text-secondary leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="mt-3 flex items-center gap-3">
                        {notif.linkUrl && (
                          <Link
                            href={notif.linkUrl}
                            onClick={() => handleToggleRead(notif.id, notif.isRead)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition"
                          >
                            <span>Open Details</span>
                            <ArrowRight className="size-3.5" />
                          </Link>
                        )}

                        {!notif.isRead && (
                          <button
                            type="button"
                            onClick={() => handleToggleRead(notif.id, notif.isRead)}
                            className="text-xs font-medium text-text-tertiary hover:text-text-primary transition cursor-pointer"
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
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
