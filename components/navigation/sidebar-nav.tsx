"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

import { NAV_ICONS } from "./icons";
import { isActive, type NavSection } from "./nav-config";

/**
 * The navigation list itself, shared by the desktop sidebar and the mobile
 * drawer so both always show the same destinations.
 */
export function SidebarNav({
  sections,
  onNavigate,
}: {
  sections: NavSection[];
  /** Lets the mobile drawer close itself once a destination is chosen. */
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 scrollbar-slim">
      {sections.map((section, index) => (
        <div key={section.title ?? `section-${index}`}>
          {section.title && (
            <p className="px-3 pb-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-white/40">
              {section.title}
            </p>
          )}

          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = NAV_ICONS[item.icon];
              const active = isActive(pathname, item);

              // Sections that arrive in a later phase are shown but inert, so
              // the navigation never links to a route that does not exist.
              if (item.soon) {
                return (
                  <li key={item.href}>
                    <span
                      aria-disabled
                      title="Available in an upcoming release"
                      className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/35"
                    >
                      <Icon className="size-[1.125rem] shrink-0" aria-hidden />
                      <span className="truncate">{item.label}</span>
                      <span className="ml-auto rounded bg-white/10 px-1.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-wide">
                        Soon
                      </span>
                    </span>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-active text-white shadow-sm"
                        : "text-white/70 hover:bg-sidebar-hover hover:text-white",
                    )}
                  >
                    <Icon className="size-[1.125rem] shrink-0" aria-hidden />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
