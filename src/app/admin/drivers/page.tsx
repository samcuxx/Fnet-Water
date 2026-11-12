"use client";

import AppLayout from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback } from "@/components/tailgrids/core/avatar";
import { Badge } from "@/components/tailgrids/core/badge";
import Breadcrumbs from "@/components/tailgrids/core/breadcrumbs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import { SkeletonCard } from "@/components/ui/skeleton";
import type { DriverProfile } from "@/lib/dispatch-store";
import { PhoneCall } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDrivers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dispatch/drivers");
      if (res.ok) {
        const d = await res.json();
        setDrivers(d.drivers || []);
      }
    } catch (err) {
      console.error("Failed to load drivers:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  return (
    <AppLayout role="ADMIN">
      <div className="mt-4 space-y-6 px-2 lg:px-4">
        {/* NextAdmin Page Header */}
        <div>
          <div className="mb-2">
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: "/admin" },
                { label: "Operations", href: "/admin/orders" },
                { label: "Drivers & Fleet" },
              ]}
            />
          </div>
          <h1 className="mb-1 text-[28px] leading-8 font-semibold text-text-primary tracking-tight">
            Fleet Drivers &amp; Delivery Vans
          </h1>
          <p className="text-sm leading-5 text-text-tertiary">
            Assigned van drivers, vehicle registrations, and real-time delivery workloads across Accra.
          </p>
        </div>

        {/* Drivers Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
            <SkeletonCard lines={4} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {drivers.map((drv, idx) => (
              <Card key={drv.id} beamIndex={idx} className="transition-all hover:border-primary/40 hover:shadow-xs">
                <CardHeader className="border-b border-border-primary pb-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar size="md">
                      <AvatarFallback className="border border-card-border bg-primary/10 text-primary font-bold">
                        {drv.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-sm font-semibold">{drv.name}</CardTitle>
                      <span className="text-xs text-text-tertiary font-mono">{drv.phone}</span>
                    </div>
                  </div>
                  <Badge color={drv.isAvailable ? "success" : "primary"} size="sm">
                    {drv.isAvailable ? "Available" : "On Duty"}
                  </Badge>
                </CardHeader>

                <CardContent className="mt-3.5 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border-primary">
                    <span className="text-text-tertiary">Van &amp; Reg:</span>
                    <span className="font-semibold text-text-primary">{drv.vanNumber}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border-primary">
                    <span className="text-text-tertiary">License Plate:</span>
                    <span className="font-mono font-medium text-text-secondary">{drv.licensePlate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border-primary">
                    <span className="text-text-tertiary">Current Route:</span>
                    <span className="font-medium text-text-primary">{"Accra - " + (drv.vanNumber || "Fleet Van")}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-text-tertiary">Active Runs:</span>
                    <span className="font-bold text-primary">{drv.completedStopsCount} deliveries completed</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 border-t border-border-primary">
                  <a
                    href={`tel:${drv.phone}`}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <PhoneCall className="size-3.5" />
                    <span>Call Driver</span>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
