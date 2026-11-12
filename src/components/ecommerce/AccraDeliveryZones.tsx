"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import Link from "next/link";
import React from "react";

export default function AccraDeliveryZones() {
  const zones = [
    { name: "East Legon", percent: 89, level: "High Volume" },
    { name: "Cantonments", percent: 82 },
    { name: "Osu", percent: 85 },
    { name: "Airport Res.", percent: 80 },
    { name: "Ridge", percent: 79 },
    { name: "Spintex", percent: 76 },
  ];

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <div>
          <CardTitle className="text-sm font-semibold">Greater Accra Delivery Zones</CardTitle>
          <p className="mt-0.5 text-xs text-text-tertiary">
            Fulfillment density and active route coverage across Accra
          </p>
        </div>
      </CardHeader>

      <CardContent className="my-2">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Zone list */}
          <div className="sm:col-span-7 space-y-2.5">
            {zones.map((z) => (
              <div key={z.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-medium text-text-primary">
                    {z.name}
                  </span>
                  {z.level && (
                    <Badge color="success" size="sm">
                      {z.level}
                    </Badge>
                  )}
                </div>
                <span className="font-bold text-text-primary">
                  {z.percent}%
                </span>
              </div>
            ))}
          </div>

          {/* Route Map Visual Indicator */}
          <div className="sm:col-span-5 relative rounded-xl bg-background-gray-primary border border-card-border p-4 flex flex-col items-center justify-center text-center">
            <div className="relative size-14 flex items-center justify-center mb-2">
              <span className="absolute inset-0 rounded-full bg-primary/15 animate-ping" />
              <div className="size-11 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs shadow-xs">
                89%
              </div>
            </div>
            <span className="text-xs font-bold text-text-primary">
              Accra Metro
            </span>
            <span className="text-[10px] text-text-tertiary mt-0.5">
              18 Vans En Route
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border-primary flex justify-end">
        <Link
          href="/admin/drivers"
          className="text-xs font-semibold text-primary hover:underline"
        >
          View Fleet Dispatch →
        </Link>
      </CardFooter>
    </Card>
  );
}
