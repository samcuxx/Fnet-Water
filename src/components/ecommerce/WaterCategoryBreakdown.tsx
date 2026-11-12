"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import Link from "next/link";
import React from "react";

export default function WaterCategoryBreakdown() {
  const categories = [
    { name: "19L Refill Bottles", percent: "52%", color: "#12b76a" },
    { name: "Smart Dispensers", percent: "22%", color: "#0057b8" },
    { name: "24-Pack Bottles", percent: "12%", color: "#00aeef" },
  ];

  return (
    <Card className="flex flex-col justify-between h-full">
      <CardHeader>
        <div>
          <CardTitle className="text-sm font-semibold">Water Category Share</CardTitle>
          <p className="text-xs text-text-tertiary mt-0.5">Primary sales distribution</p>
        </div>
      </CardHeader>

      <CardContent className="my-2">
        <div className="text-3xl font-black text-text-primary tracking-tight">
          86%
        </div>

        <div className="mt-4 space-y-2.5">
          {categories.map((c) => (
            <div key={c.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: c.color }}
                  className="size-2 rounded-full shrink-0"
                />
                <span className="font-medium text-text-secondary">
                  {c.name}
                </span>
              </div>
              <span className="font-bold text-text-primary">
                {c.percent}
              </span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-2 border-t border-border-primary">
        <Link
          href="/admin/bottles"
          className="w-full inline-flex items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold text-text-primary bg-background-gray-primary hover:bg-background-gray-secondary border border-card-border transition-colors"
        >
          View Bottle Inventory
        </Link>
      </CardFooter>
    </Card>
  );
}
