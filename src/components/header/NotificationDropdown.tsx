"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "order" | "delivery" | "payment" | "alert";
}

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Payment Received",
    message: "GH₵ 180.00 paid via MTN MoMo for 4x 19L refills.",
    time: "10 mins ago",
    read: false,
    type: "payment",
  },
  {
    id: "notif-2",
    title: "Delivery Dispatched",
    message: "Driver Kwesi Mensah started delivery run to East Legon.",
    time: "45 mins ago",
    read: false,
    type: "delivery",
  },
  {
    id: "notif-3",
    title: "Empty Bottle Exchange Logged",
    message: "2 empty bottles collected at Cantonments client site.",
    time: "2 hours ago",
    read: true,
    type: "order",
  },
];

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleDropdown}
        aria-label="View notifications"
        className="dropdown-toggle relative flex items-center justify-center size-9 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-hidden"
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
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-gray-900" />
        )}
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="w-80 sm:w-96 p-4 right-0 top-full mt-2"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
              Notifications
            </h4>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
                {unreadCount} new
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-[11px] font-medium text-brand-600 hover:text-brand-700 dark:text-blue-light-400"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-2.5 rounded-lg border text-left transition-colors ${
                notif.read
                  ? "border-transparent bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  : "border-brand-100 bg-brand-25/50 dark:border-brand-900/30 dark:bg-brand-500/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {notif.title}
                </span>
                <span className="text-[10px] text-gray-400">{notif.time}</span>
              </div>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-normal">
                {notif.message}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 text-center">
          <Link
            href="/notifications"
            onClick={closeDropdown}
            className="text-xs font-medium text-brand-600 dark:text-blue-light-400 hover:underline"
          >
            View all notifications
          </Link>
        </div>
      </Dropdown>
    </div>
  );
}
