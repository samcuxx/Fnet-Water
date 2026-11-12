"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function NetworkCommunityCard() {
  return (
    <div className="relative rounded-xl overflow-hidden p-6 text-white shadow-md bg-gradient-to-br from-[#004C99] via-[#0057B8] to-[#0284C7] flex flex-col justify-between h-full group">
      {/* Subtle background glow/water drops pattern */}
      <div className="absolute -right-8 -bottom-8 size-48 rounded-full bg-sky-400/20 blur-2xl pointer-events-none" />
      <div className="absolute top-0 right-0 p-5 z-10">
        <Link
          href="/admin/orders"
          aria-label="View network orders"
          className="size-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all group-hover:scale-105"
        >
          <ArrowUpRight className="size-4 text-white" />
        </Link>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-200">
            F Net Water Network
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight max-w-[240px]">
          Universal Bottle Exchange
        </h3>
      </div>

      <div className="mt-5 pt-3 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Avatar Stack */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            <div className="inline-block size-7 rounded-full ring-2 ring-brand-700 bg-sky-200 text-[10px] font-bold text-brand-900 flex items-center justify-center">
              AO
            </div>
            <div className="inline-block size-7 rounded-full ring-2 ring-brand-700 bg-amber-200 text-[10px] font-bold text-amber-900 flex items-center justify-center">
              KA
            </div>
            <div className="inline-block size-7 rounded-full ring-2 ring-brand-700 bg-emerald-200 text-[10px] font-bold text-emerald-900 flex items-center justify-center">
              EM
            </div>
          </div>
          <span className="text-[11px] font-bold text-sky-100">
            +18 Drivers Active
          </span>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-white/90">
            Greater Accra Fleet
          </span>
        </div>
      </div>
    </div>
  );
}
