"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Card, CardHeader, CardTitle } from "@/components/tailgrids/core/card";
import React from "react";

interface Vehicle {
  id: string;
  name: string;
  plate: string;
  driver: string;
  capacity: string;
  route: string;
  status: "On Route" | "Loading" | "Maintenance";
}

const fleet: Vehicle[] = [
  {
    id: "veh_1",
    name: "Refill Van 01",
    plate: "GT-4421-23",
    driver: "Kwame Mensah",
    capacity: "42 / 50 Bottles (84%)",
    route: "East Legon & Adjiringanor",
    status: "On Route",
  },
  {
    id: "veh_2",
    name: "Refill Van 02",
    plate: "GE-8812-24",
    driver: "Kojo Antwi",
    capacity: "38 / 50 Bottles (76%)",
    route: "Osu & Cantonments",
    status: "On Route",
  },
  {
    id: "veh_3",
    name: "Heavy Truck 01",
    plate: "GW-1049-22",
    driver: "Yaw Boateng",
    capacity: "120 / 150 Bottles (80%)",
    route: "Tema Heavy Industrial Area",
    status: "Loading",
  },
];

export default function DeliveryVehicle() {
  return (
    <Card className="p-5 sm:p-6">
      <CardHeader className="mb-4">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold">
            Delivery Fleet on Route
          </CardTitle>
          <p className="text-xs text-text-tertiary mt-0.5">
            Live GPS and bottle capacity tracking
          </p>
        </div>
        <span className="text-xs font-bold text-primary">
          3 Active Vehicles
        </span>
      </CardHeader>

      <div className="space-y-3">
        {fleet.map((v) => (
          <div
            key={v.id}
            className="p-3.5 rounded-lg border border-card-border bg-background-gray-primary text-xs transition-colors hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold text-text-primary">
                {v.name} •{" "}
                <span className="font-mono text-text-tertiary">{v.plate}</span>
              </div>
              <Badge
                color={v.status === "On Route" ? "success" : "warning"}
                size="sm"
              >
                {v.status}
              </Badge>
            </div>

            <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-text-secondary">
              <div>
                Driver: <strong className="text-text-primary">{v.driver}</strong> • {v.route}
              </div>
              <div className="font-medium text-primary">
                {v.capacity}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
