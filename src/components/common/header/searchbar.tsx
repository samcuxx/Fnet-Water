"use client";

import { SearchIcon } from "@/components/common/header/icons";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface SearchItem {
  id: string;
  title: string;
  section: string;
  url: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  { id: "/admin", title: "Overview Dashboard", section: "OPERATIONS", url: "/admin" },
  { id: "/admin/orders", title: "Orders Management", section: "OPERATIONS", url: "/admin/orders" },
  { id: "/admin/bottles", title: "Bottle Tracking & Inventory", section: "OPERATIONS", url: "/admin/bottles" },
  { id: "/admin/customers", title: "Customers Directory", section: "OPERATIONS", url: "/admin/customers" },
  { id: "/admin/drivers", title: "Drivers & Fleet", section: "OPERATIONS", url: "/admin/drivers" },
  { id: "/admin/users", title: "User Management", section: "SYSTEM", url: "/admin/users" },
  { id: "/admin/reports", title: "Reports & Analytics", section: "OPERATIONS", url: "/admin/reports" },
  { id: "/admin/finance/revenue", title: "Revenue & Ledger", section: "FINANCE", url: "/admin/finance/revenue" },
  { id: "/admin/finance/remittances", title: "Cash Collected", section: "FINANCE", url: "/admin/finance/remittances" },
  { id: "/admin/finance/security-deposits", title: "Bottle Deposits", section: "FINANCE", url: "/admin/finance/security-deposits" },
  { id: "/customer", title: "Customer Portal", section: "PORTALS", url: "/customer" },
  { id: "/driver", title: "Driver Dispatch Portal", section: "PORTALS", url: "/driver" },
  { id: "/agent", title: "Field Agent Portal", section: "PORTALS", url: "/agent" },
  { id: "/manager", title: "Operations Manager Portal", section: "PORTALS", url: "/manager" },
  { id: "/profile", title: "Profile Settings", section: "ACCOUNT", url: "/profile" },
  { id: "/notifications", title: "Notifications", section: "ACCOUNT", url: "/notifications" },
];

export const OPEN_SEARCH_EVENT = "open-search-modal";

export function openSearchModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
  }
}

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    const handleCustomOpen = () => setOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener(OPEN_SEARCH_EVENT, handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener(OPEN_SEARCH_EVENT, handleCustomOpen);
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return SEARCH_ITEMS;
    const q = query.toLowerCase();
    return SEARCH_ITEMS.filter(
      (item) => item.title.toLowerCase().includes(q) || item.section.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (url: string) => {
    setOpen(false);
    setQuery("");
    router.push(url);
  };

  return (
    <>
      {/* Mobile trigger button (< xl) */}
      <button
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center rounded-lg border border-card-border bg-card-background text-icon-primary shadow-xs transition-colors outline-none hover:bg-background-gray-primary xl:hidden"
        aria-label="Open search modal"
      >
        <SearchIcon />
      </button>

      {/* Desktop trigger button (xl+) */}
      <div className="hidden xl:block">
        <button
          onClick={() => setOpen(true)}
          className="w-full text-left outline-none focus:outline-none cursor-pointer"
          type="button"
        >
          <InputGroup className="h-10 cursor-pointer">
            <InputGroupAddon align="inline-start" className="pr-0 text-icon-tertiary">
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search portals..."
              className="pointer-events-none cursor-pointer pl-2 text-sm select-none"
              readOnly
            />
            <InputGroupAddon align="inline-end">
              <div className="rounded-md border border-card-border bg-background-gray-primary/50 px-2 py-0.5 text-xs text-text-tertiary">
                <span className="font-medium">⌘</span> K
              </div>
            </InputGroupAddon>
          </InputGroup>
        </button>
      </div>

      {/* Search Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-card-border bg-card-background text-text-primary shadow-2xl">
            {/* Input Header */}
            <div className="border-b border-card-border p-3.5">
              <InputGroup className="h-10">
                <InputGroupAddon align="inline-start" className="pr-0 text-icon-tertiary">
                  <SearchIcon />
                </InputGroupAddon>
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type to search pages, orders, reports..."
                  className="w-full min-w-0 flex-1 border-none bg-transparent pl-2 text-sm text-text-primary outline-none placeholder:text-input-placeholder-text-color focus:ring-0"
                />
                <InputGroupAddon align="inline-end">
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-md border border-card-border bg-background-gray-primary/50 px-2 py-0.5 text-xs text-text-tertiary hover:bg-background-gray-secondary"
                  >
                    ESC
                  </button>
                </InputGroupAddon>
              </InputGroup>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredItems.length === 0 ? (
                <div className="py-8 text-center text-sm text-text-tertiary">
                  No matching results found.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.url)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-background-gray-primary hover:text-text-primary text-left"
                    >
                      <span className="font-medium">{item.title}</span>
                      <span className="text-[11px] font-semibold text-text-tertiary uppercase">
                        {item.section}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
