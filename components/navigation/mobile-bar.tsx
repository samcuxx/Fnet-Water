"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

import { NAV_ICONS } from "./icons";
import { isActive, type NavItem } from "./nav-config";

/**
 * Fixed bottom bar for the phone-first portals (driver and customer).
 *
 * Targets are 56px tall and evenly divided so they stay comfortable for a
 * thumb, and the bar sits above the iOS home indicator via safe-area padding.
 */
export function MobileBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((item) => {
          const Icon = NAV_ICONS[item.icon];
          const active = isActive(pathname, item);

          if (item.soon) {
            return (
              <li key={item.href}>
                <span
                  aria-disabled
                  className="flex h-14 cursor-not-allowed flex-col items-center justify-center gap-1 text-slate-300"
                >
                  <Icon className="size-5" aria-hidden />
                  <span className="text-[0.6875rem] font-medium">{item.label}</span>
                </span>
              </li>
            );
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 transition-colors",
                  active ? "text-brand-600" : "text-slate-500 hover:text-slate-900",
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span className="text-[0.6875rem] font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
