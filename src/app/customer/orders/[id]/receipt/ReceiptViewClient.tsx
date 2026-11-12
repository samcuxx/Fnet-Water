"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Card } from "@/components/tailgrids/core/card";
import { Button } from "@/components/tailgrids/core/button";
import OrderReceipt from "@/components/invoice/OrderReceipt";
import { SkeletonReceipt } from "@/components/ui/skeleton";
import type { StoredOrder } from "@/lib/order-store";
import { ArrowLeft } from "lucide-react";

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
      <div className="max-w-3xl mx-auto space-y-5 pb-12">
        {/* Breadcrumbs & Back Link */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <Button asChild appearance="outline" size="sm" className="gap-2">
            <Link href="/customer/orders">
              <ArrowLeft className="size-3.5" />
              <span>Back to My Orders</span>
            </Link>
          </Button>

          <Breadcrumbs
            dividerType="chevron"
            items={[
              { label: "Home", href: "/customer" },
              { label: "My Orders", href: "/customer/orders" },
              { label: order ? order.orderNumber : "Receipt" },
            ]}
          />
        </div>

        {loading ? (
          <SkeletonReceipt />
        ) : error || !order ? (
          <Card className="p-8 text-center text-xs text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20">
            {error || "Receipt not found."}
          </Card>
        ) : (
          <OrderReceipt order={order} />
        )}
      </div>
    </AppLayout>
  );
}
