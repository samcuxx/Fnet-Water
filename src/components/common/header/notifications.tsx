"use client";

import {
  BellIcon,
  CreditCardIcon,
  LetterIcon,
  PrinterIcon,
} from "@/components/common/header/icons";
import { Button } from "@/components/tailgrids/core/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHeader,
  DropdownMenuItem,
  DropdownMenuSection,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/tailgrids/core/dropdown";
import { cn } from "@/utils/cn";
import Link from "next/link";
import React, { useState } from "react";

interface NotificationItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  timestamp: string;
  isUnread?: boolean;
}

const WATER_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    icon: <CreditCardIcon />,
    title: "Payment Received",
    description: "GH₵ 110.00 received via Mobile Money for Order #FN-8429",
    timestamp: "10m ago",
    isUnread: true,
  },
  {
    id: "2",
    icon: <PrinterIcon />,
    title: "Dispatch Completed",
    description: "Van #3 delivered 20 bottles to East Legon Residential",
    timestamp: "1h ago",
    isUnread: true,
  },
  {
    id: "3",
    icon: <LetterIcon />,
    title: "Empty Bottles Returned",
    description: "15 empty 19L bottles collected from Airport Hills depot",
    timestamp: "3h ago",
    isUnread: false,
  },
];

export function NotificationsButton() {
  const [notifications, setNotifications] = useState(WATER_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => n.isUnread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex size-10 items-center justify-center rounded-lg border border-card-border bg-card-background text-icon-primary shadow-xs outline-none hover:bg-background-gray-primary cursor-pointer"
          aria-label="Open notifications"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent placement="bottom end" className="w-80 p-0 shadow-2xl">
        <DropdownMenuHeader className="flex items-center justify-between border-b border-card-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-text-tertiary hover:text-primary transition-colors cursor-pointer"
            >
              Mark all as read
            </button>
          )}
        </DropdownMenuHeader>

        <DropdownMenuSection className="max-h-72 overflow-y-auto p-1.5">
          {notifications.map((item) => (
            <DropdownMenuItem
              key={item.id}
              className={cn(
                "flex items-start gap-3 rounded-lg p-3 transition-colors",
                item.isUnread && "bg-background-gray-primary/60 font-medium"
              )}
            >
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-card-border bg-card-background text-icon-secondary">
                {item.icon}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-text-primary">{item.title}</p>
                  <span className="text-[10px] text-text-tertiary">{item.timestamp}</span>
                </div>
                <p className="text-xs text-text-secondary leading-normal">{item.description}</p>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuSection>

        <DropdownMenuSeparator />

        <div className="p-2 text-center">
          <Link
            href="/notifications"
            className="block text-xs font-medium text-primary hover:underline py-1"
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
