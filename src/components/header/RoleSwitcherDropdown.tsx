"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { usePathname } from "next/navigation";

interface RoleOption {
  role: string;
  title: string;
  name: string;
  email: string;
  password: string;
  href: string;
  badgeColor: string;
}

const ROLES: RoleOption[] = [
  {
    role: "CUSTOMER",
    title: "Customer Portal",
    name: "Ama Osei",
    email: "customer@fnetwater.com",
    password: "customer123",
    href: "/customer",
    badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  },
  {
    role: "MANAGER",
    title: "Logistics Manager",
    name: "Operations Manager",
    email: "manager@fnetwater.com",
    password: "manager123",
    href: "/manager",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    role: "DRIVER",
    title: "Fleet Driver",
    name: "Kwame Asante",
    email: "driver@fnetwater.com",
    password: "driver123",
    href: "/driver",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    role: "AGENT",
    title: "Zone Supervisor",
    name: "Kofi Boateng",
    email: "agent@fnetwater.com",
    password: "agent123",
    href: "/agent",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  {
    role: "ADMIN",
    title: "Executive Admin",
    name: "System Admin",
    email: "admin@fnetwater.com",
    password: "admin123",
    href: "/admin",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
];

export default function RoleSwitcherDropdown() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentRole = (session?.user as { role?: string })?.role || "CUSTOMER";
  const activeRoleOption = ROLES.find((r) => r.role === currentRole) || ROLES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitch = async (target: RoleOption) => {
    if (target.role === currentRole) {
      setIsOpen(false);
      if (pathname !== target.href) {
        window.location.href = target.href;
      }
      return;
    }

    setSwitchingTo(target.role);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        identifier: target.email,
        password: target.password,
        isOtp: "false",
      });

      if (!res?.error) {
        window.location.href = target.href;
      } else {
        console.error("Role switch error:", res.error);
        setSwitchingTo(null);
      }
    } catch (err) {
      console.error("Role switch network error:", err);
      setSwitchingTo(null);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={switchingTo !== null}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/80 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800/80 transition cursor-pointer text-xs font-semibold"
        title="Switch portal role for testing"
      >
        <span
          className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${activeRoleOption.badgeColor}`}
        >
          {switchingTo ? "Switching..." : activeRoleOption.role}
        </span>
        <span className="hidden md:inline text-gray-700 dark:text-gray-200 text-xs">
          {switchingTo ? "Please wait..." : activeRoleOption.name}
        </span>
        <svg
          className={`size-3 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-xl z-50">
          <div className="px-2.5 py-1.5 mb-1 border-b border-gray-100 dark:border-gray-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Switch Test Role / Portal
            </span>
          </div>

          <div className="space-y-1">
            {ROLES.map((r) => {
              const isSelected = r.role === currentRole;
              const isSwitchingThis = switchingTo === r.role;

              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => handleSwitch(r)}
                  disabled={switchingTo !== null}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer text-xs ${
                    isSelected
                      ? "bg-brand-50/70 dark:bg-brand-950/40 text-brand-700 dark:text-sky-300 font-bold"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/60 text-gray-700 dark:text-gray-300 font-medium"
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span>{r.title}</span>
                      {isSelected && (
                        <span className="size-1.5 rounded-full bg-brand-500" />
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">
                      {r.name}
                    </span>
                  </div>

                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${r.badgeColor}`}
                  >
                    {isSwitchingThis ? "..." : r.role}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}