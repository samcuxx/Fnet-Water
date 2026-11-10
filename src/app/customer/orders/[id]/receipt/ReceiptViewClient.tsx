"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import OrderReceipt from "@/components/invoice/OrderReceipt";
import { SkeletonReceipt } from "@/components/ui/skeleton";
import { fadeInUp } from "@/lib/animations";
import type { StoredOrder } from "@/lib/order-store";

export default function ReceiptViewClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setError(data.message || data.error || "Order not found.");
        }
      } catch {
        setError("Failed to load invoice receipt.");
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  return (
    <AppLayout role="CUSTOMER">
      <div className="max-w-3xl mx-auto space-y-4 pb-12">
        {/* Back Link */}
        <div className="print:hidden">
          <Link
            href="/customer/orders"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-600 dark:hover:text-blue-light-400 transition"
          >
            <span>&larr;</span>
            <span>Back to My Orders</span>
          </Link>
        </div>

        {loading ? (
          <SkeletonReceipt />
        ) : error || !order ? (
          <div className="p-8 text-center text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/20 rounded-[28px] border border-rose-200 dark:border-rose-800">
            {error || "Receipt not found."}
          </div>
        ) : (
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <OrderReceipt order={order} />
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
