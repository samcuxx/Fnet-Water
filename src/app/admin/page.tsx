"use client";

import AccraDeliveryZones from "@/components/ecommerce/AccraDeliveryZones";
import EcommerceMetrics from "@/components/ecommerce/EcommerceMetrics";
import FactoryBufferCard from "@/components/ecommerce/FactoryBufferCard";
import FleetEfficiencyPill from "@/components/ecommerce/FleetEfficiencyPill";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import NetworkCommunityCard from "@/components/ecommerce/NetworkCommunityCard";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import WaterCategoryBreakdown from "@/components/ecommerce/WaterCategoryBreakdown";
import AppLayout from "@/components/layout/AppLayout";
import Breadcrumbs from "@/components/tailgrids/core/breadcrumbs";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 17) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  const userName = session?.user?.name
    ? session.user.name.split(" ")[0]
    : "Kwaku";

  return (
    <AppLayout role="ADMIN">
      <div className="mt-4 space-y-6">
        {/* NextAdmin Page Header Section */}
        <div className="px-2 lg:px-4">
          <div className="mb-2">
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: "/admin" },
                { label: "Dashboard", href: "/admin" },
                { label: "Overview" },
              ]}
            />
          </div>
          <h1 className="mb-1 text-[28px] leading-8 font-semibold text-text-primary tracking-tight">
            {greeting}, {userName}
          </h1>
          <p className="text-sm leading-5 text-text-tertiary">
            Track water sales, monitor bottle exchanges, and analyze fleet delivery performance across Ghana.
          </p>
        </div>

        {/* Dashboard Grid Composition */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-6 px-2 lg:px-4"
        >
          {/* Row 1: 4-Card NextAdmin Overview Stats */}
          <motion.div variants={fadeInUp}>
            <EcommerceMetrics />
          </motion.div>

          {/* Row 2: Daily Area Chart */}
          <motion.div variants={fadeInUp}>
            <StatisticsChart />
          </motion.div>

          {/* Row 3: Target Radial Gauge & Category Share & Accra Delivery Zones */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
            <motion.div variants={fadeInUp} className="lg:col-span-4">
              <MonthlyTarget />
            </motion.div>

            <motion.div variants={fadeInUp} className="lg:col-span-4">
              <WaterCategoryBreakdown />
            </motion.div>

            <motion.div variants={fadeInUp} className="lg:col-span-4">
              <AccraDeliveryZones />
            </motion.div>
          </div>

          {/* Row 4: Fleet Dispatch & Factory Buffer & Community Hero */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
            <motion.div variants={fadeInUp} className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex-1">
                <FleetEfficiencyPill />
              </div>
              <div className="flex-1">
                <FactoryBufferCard />
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="lg:col-span-6">
              <NetworkCommunityCard />
            </motion.div>
          </div>

          {/* Row 5: Recent Orders NextAdmin Pro Table */}
          <motion.div variants={fadeInUp}>
            <RecentOrders />
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
