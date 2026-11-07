"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";

interface DeliveryStop {
  id: string;
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  digitalAddress: string;
  bottlesDelivering: number;
  expectedEmpty: number;
  status: "PENDING" | "COMPLETED";
}

const INITIAL_STOPS: DeliveryStop[] = [
  {
    id: "del_01",
    orderId: "FNW-ORD-8821",
    customerName: "Kwesi Appiah",
    phone: "0244123456",
    address: "House 14, Boundary Road, East Legon",
    digitalAddress: "GA-492-1029",
    bottlesDelivering: 4,
    expectedEmpty: 4,
    status: "PENDING",
  },
  {
    id: "del_02",
    orderId: "FNW-ORD-8824",
    customerName: "Dr. Mensah Clinic",
    phone: "0208112233",
    address: "Near Shell Station, Osu",
    digitalAddress: "GA-041-8821",
    bottlesDelivering: 6,
    expectedEmpty: 6,
    status: "PENDING",
  },
  {
    id: "del_03",
    orderId: "FNW-ORD-8819",
    customerName: "Grace Osei",
    phone: "0277998877",
    address: "Plot 8, Roman Ridge",
    digitalAddress: "GA-112-9904",
    bottlesDelivering: 2,
    expectedEmpty: 2,
    status: "COMPLETED",
  },
];

export default function DriverDashboardPage() {
  const [stops, setStops] = useState(INITIAL_STOPS);
  const [activeStop, setActiveStop] = useState<DeliveryStop | null>(null);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [deliveredCount, setDeliveredCount] = useState(4);
  const [collectedEmpty, setCollectedEmpty] = useState(4);
  const [damagedCount, setDamagedCount] = useState(0);

  const handleOpenExchange = (stop: DeliveryStop) => {
    setActiveStop(stop);
    setDeliveredCount(stop.bottlesDelivering);
    setCollectedEmpty(stop.expectedEmpty);
    setDamagedCount(0);
    setExchangeModalOpen(true);
  };

  const handleConfirmExchange = () => {
    if (!activeStop) return;

    setStops((prev) =>
      prev.map((s) => (s.id === activeStop.id ? { ...s, status: "COMPLETED" } : s))
    );
    setExchangeModalOpen(false);
    setActiveStop(null);
  };

  const completedCount = stops.filter((s) => s.status === "COMPLETED").length;

  return (
    <AppLayout role="DRIVER">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Driver Header */}
        <div className="pb-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Driver Delivery Run
                </h1>
                <Badge color="success" variant="light" size="sm">
                  Driver Active
                </Badge>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Vehicle: Van 02 (GT-4421-23) &bull; Route: East Legon / Osu
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
              <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {completedCount} / {stops.length} Stops
              </div>
            </div>
          </div>
        </div>

        {/* Truck Inventory Quick Tally */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3.5 rounded-xl text-center shadow-theme-xs">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Full 19L on Van</span>
            <div className="text-xl font-bold text-brand-600 dark:text-blue-light-400 mt-0.5">
              22
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3.5 rounded-xl text-center shadow-theme-xs">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Empties Collected</span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              18
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3.5 rounded-xl text-center shadow-theme-xs">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Damaged Bottles</span>
            <div className="text-xl font-bold text-red-600 dark:text-red-400 mt-0.5">
              1
            </div>
          </div>
        </div>

        {/* Delivery Stop Cards */}
        <div className="space-y-4">
          <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Assigned Delivery Stops
          </h2>

          {stops.map((stop, index) => (
            <div
              key={stop.id}
              className={`p-4 sm:p-5 rounded-xl border transition ${
                stop.status === "COMPLETED"
                  ? "bg-gray-50/70 dark:bg-gray-900/40 border-gray-200 dark:border-gray-800 opacity-70"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-theme-xs"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">Stop #{index + 1}</span>
                    <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                      {stop.customerName}
                    </h3>
                    <Badge
                      color={stop.status === "COMPLETED" ? "success" : "warning"}
                      variant="light"
                      size="sm"
                    >
                      {stop.status}
                    </Badge>
                  </div>

                  <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {stop.address}
                  </p>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-blue-light-400 font-mono font-medium">
                      GPS: {stop.digitalAddress}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      Tel: <strong>{stop.phone}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-gray-800">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Drop: <strong>{stop.bottlesDelivering} full</strong> &bull; Take:{" "}
                    <strong>{stop.expectedEmpty} empty</strong>
                  </div>

                  {stop.status === "PENDING" ? (
                    <button
                      type="button"
                      onClick={() => handleOpenExchange(stop)}
                      className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs"
                    >
                      Record 1:1 Exchange
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      &check; Delivered &amp; Exchanged
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 1:1 Bottle Exchange Record Modal */}
        <Modal
          isOpen={exchangeModalOpen}
          onClose={() => setExchangeModalOpen(false)}
          title={`Confirm 1:1 Bottle Exchange — ${activeStop?.customerName}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              Verify the exact bottle counts exchanged at customer premises for order{" "}
              <strong>{activeStop?.orderId}</strong>.
            </p>

            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Full 19L Bottles Delivered:
                </span>
                <input
                  type="number"
                  min={1}
                  value={deliveredCount}
                  onChange={(e) => setDeliveredCount(parseInt(e.target.value) || 0)}
                  className="w-20 h-8 px-2 text-center rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Empty Bottles Collected (1:1):
                </span>
                <input
                  type="number"
                  min={0}
                  value={collectedEmpty}
                  onChange={(e) => setCollectedEmpty(parseInt(e.target.value) || 0)}
                  className="w-20 h-8 px-2 text-center rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  Damaged / Leaking Bottles:
                </span>
                <input
                  type="number"
                  min={0}
                  value={damagedCount}
                  onChange={(e) => setDamagedCount(parseInt(e.target.value) || 0)}
                  className="w-20 h-8 px-2 text-center rounded border border-red-300 dark:border-red-700 bg-white dark:bg-gray-900 text-red-600 dark:text-red-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setExchangeModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExchange}
                className="px-4 py-2 text-xs font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs"
              >
                Confirm &amp; Complete Stop
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
