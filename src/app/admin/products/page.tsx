"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/badge/Badge";
import type { StoredProduct } from "@/lib/product-store";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<StoredProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const d = await res.json();
        setProducts(d.products || []);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <AppLayout role="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Water Products Catalog
              </h1>
              <Badge color="primary" size="sm">
                Pricing &amp; SKUs
              </Badge>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Active pure water products, bottle deposit rates, and packaging specifications in GH₵.
            </p>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-theme-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge color="info" size="sm">
                    {p.type.replace("_", " ")}
                  </Badge>
                  <span className="size-2 rounded-full bg-emerald-500" />
                </div>

                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1">
                  {p.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {p.description}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-gray-500">Unit Price:</span>
                  <span className="text-lg font-bold text-brand-600 dark:text-blue-light-400">
                    GH₵ {p.price.toFixed(2)}
                  </span>
                </div>
                {p.depositFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bottle Deposit:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      GH₵ {p.depositFee.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Inventory Status:</span>
                  <span className="text-emerald-600 font-semibold">In Stock</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
