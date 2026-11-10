"use client";

import React from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import EcommerceMetrics from "@/components/ecommerce/EcommerceMetrics";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import WaterCategoryBreakdown from "@/components/ecommerce/WaterCategoryBreakdown";
import AccraDeliveryZones from "@/components/ecommerce/AccraDeliveryZones";
import FleetEfficiencyPill from "@/components/ecommerce/FleetEfficiencyPill";
import FactoryBufferCard from "@/components/ecommerce/FactoryBufferCard";
import NetworkCommunityCard from "@/components/ecommerce/NetworkCommunityCard";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import { staggerContainer, fadeInUp } from "@/lib/animations";

export default function AdminDashboardPage() {
  return (
    <AppLayout role="ADMIN">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* Top Header Row matching screenshot */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Real-time water fulfillment, bottle exchange, and fleet logistics across Ghana.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition shadow-xs dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100 cursor-pointer"
            >
              <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Add Custom Widget</span>
            </button>
          </div>
        </motion.div>

        {/* Dashboard Grid Composition matching reference screenshot */}
        <div className="grid grid-cols-12 gap-4 sm:gap-6">
          {/* Row 1: 3 Minimal KPI Metric Cards */}
          <motion.div variants={fadeInUp} className="col-span-12">
            <EcommerceMetrics />
          </motion.div>

          {/* Row 2: Radial Gauge (72%), Breakdown (86%), Regional Delivery Zones */}
          <motion.div variants={fadeInUp} className="col-span-12 md:col-span-6 xl:col-span-3">
            <MonthlyTarget />
          </motion.div>

          <motion.div variants={fadeInUp} className="col-span-12 md:col-span-6 xl:col-span-4">
            <WaterCategoryBreakdown />
          </motion.div>

          <motion.div variants={fadeInUp} className="col-span-12 xl:col-span-5">
            <AccraDeliveryZones />
          </motion.div>

          {/* Row 3: Dark contrast pill + Factory Buffer + Community Hero Card */}
          <motion.div variants={fadeInUp} className="col-span-12 xl:col-span-6 flex flex-col gap-4 sm:gap-6">
            <div className="flex-1">
              <FleetEfficiencyPill />
            </div>
            <div className="flex-1">
              <FactoryBufferCard />
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="col-span-12 xl:col-span-6">
            <NetworkCommunityCard />
          </motion.div>

          {/* Row 4: Daily Revenue & Fulfillment Trend (Area Chart) */}
          <motion.div variants={fadeInUp} className="col-span-12">
            <StatisticsChart />
          </motion.div>

          {/* Row 5: Recent Orders High-Fidelity Table */}
          <motion.div variants={fadeInUp} className="col-span-12">
            <RecentOrders />
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
