"use client";

import { BorderBeam } from "@/components/ui/border-beam";
import React from "react";

export interface BeamTheme {
  id: string;
  name: string;
  colorFrom: string;
  colorTo: string;
  duration: number; // Duration in seconds (speed)
  delay: number;
}

/**
 * Unique border beam palettes with distinct colors and speeds.
 * Mapped to F Net Water brand aesthetics and dashboard metric types.
 */
export const BEAM_THEMES: BeamTheme[] = [
  // 0: F Net Water Signature Azure -> Sky (7s duration)
  {
    id: "brand-blue",
    name: "F Net Water Azure",
    colorFrom: "#0057b8",
    colorTo: "#38bdf8",
    duration: 7,
    delay: 0,
  },
  // 1: Emerald -> Mint (8.5s duration) - Revenue, financial growth, completed orders
  {
    id: "emerald-growth",
    name: "Emerald Growth",
    colorFrom: "#10b981",
    colorTo: "#34d399",
    duration: 8.5,
    delay: 2,
  },
  // 2: Royal Purple -> Indigo (6s duration) - Fleet circulation, subscribers, high speed
  {
    id: "royal-indigo",
    name: "Royal Circulation",
    colorFrom: "#6366f1",
    colorTo: "#a855f7",
    duration: 6,
    delay: 4,
  },
  // 3: Sunset Amber -> Tangerine (9.5s duration) - Logistics, active vans, alerts
  {
    id: "amber-dispatch",
    name: "Amber Dispatch",
    colorFrom: "#f59e0b",
    colorTo: "#f97316",
    duration: 9.5,
    delay: 1,
  },
  // 4: Coral -> Bright Rose (7.5s duration) - Customer referrals & milestone awards
  {
    id: "rose-rewards",
    name: "Rose Rewards",
    colorFrom: "#f43f5e",
    colorTo: "#fb7185",
    duration: 7.5,
    delay: 3,
  },
  // 5: Electric Cyan -> Aquamarine (5.5s duration) - High priority, live sensor telemetry
  {
    id: "electric-cyan",
    name: "Electric Hydro",
    colorFrom: "#06b6d4",
    colorTo: "#0ea5e9",
    duration: 5.5,
    delay: 1.5,
  },
  // 6: Golden Bronze -> Honey (8s duration) - Field sales, agent commissions
  {
    id: "golden-commission",
    name: "Golden Commission",
    colorFrom: "#eab308",
    colorTo: "#fbbf24",
    duration: 8,
    delay: 2.5,
  },
  // 7: Deep Violet -> Fuchsia (10s duration) - Smart dispenser rent-to-own payoff
  {
    id: "violet-dispenser",
    name: "Smart IoT Violet",
    colorFrom: "#8b5cf6",
    colorTo: "#ec4899",
    duration: 10,
    delay: 0.5,
  },
];

export interface StatCardBeamProps {
  /**
   * Theme index to select preset color and speed (0 - 7, cycles automatically).
   */
  index?: number;
  /**
   * Override colorFrom.
   */
  colorFrom?: string;
  /**
   * Override colorTo.
   */
  colorTo?: string;
  /**
   * Override animation speed/duration in seconds.
   */
  duration?: number;
  /**
   * Override animation delay in seconds.
   */
  delay?: number;
  /**
   * Length/size of the glowing light beam in pixels.
   */
  size?: number;
  /**
   * Border width in pixels.
   */
  borderWidth?: number;
  /**
   * Additional CSS classes.
   */
  className?: string;
}

/**
 * StatCardBeam: Drop-in component for stat & metric cards.
 * Automatically gives every card a unique speed, delay, and gradient color.
 */
export function StatCardBeam({
  index = 0,
  colorFrom,
  colorTo,
  duration,
  delay,
  size = 64,
  borderWidth = 1.5,
  className,
}: StatCardBeamProps) {
  const theme = BEAM_THEMES[Math.abs(index) % BEAM_THEMES.length];

  return (
    <BorderBeam
      size={size}
      duration={duration ?? theme.duration}
      delay={delay ?? theme.delay}
      colorFrom={colorFrom ?? theme.colorFrom}
      colorTo={colorTo ?? theme.colorTo}
      borderWidth={borderWidth}
      className={className}
    />
  );
}
