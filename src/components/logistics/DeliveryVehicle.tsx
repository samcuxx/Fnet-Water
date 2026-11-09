"use client";

import React from "react";
import Badge from "@/components/ui/badge/Badge";

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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
            Delivery Fleet on Route
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Live GPS and bottle capacity tracking
          </p>
        </div>
        <span className="text-xs font-semibold text-brand-600 dark:text-blue-light-400">
          3 Active Vehicles
        </span>
      </div>

      <div className="space-y-3">
        {fleet.map((v) => (
          <div
            key={v.id}
            className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-900 dark:text-white">
                {v.name} •{" "}
                <span className="font-mono text-gray-500">{v.plate}</span>
              </div>
              <Badge
                color={v.status === "On Route" ? "success" : "warning"}
                size="sm"
              >
                {v.status}
              </Badge>
            </div>

            <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-gray-600 dark:text-gray-400">
              <div>
                Driver: <strong className="text-gray-800 dark:text-gray-200">{v.driver}</strong> • {v.route}
              </div>
              <div className="font-medium text-brand-600 dark:text-blue-light-400">
                {v.capacity}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
