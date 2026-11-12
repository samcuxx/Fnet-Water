"use client";

import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Card } from "@/components/tailgrids/core/card";
import { Badge } from "@/components/tailgrids/core/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import type { StoredProduct } from "@/lib/product-store";
import { Package, Droplets, CheckCircle, Shield } from "lucide-react";

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
        {/* Breadcrumbs & Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Water Products Catalog
              </h1>
              <Badge color="primary" size="sm">
                Pricing &amp; SKUs
              </Badge>
            </div>
            <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
              Active pure water products, bottle deposit rates, and packaging specifications in GH₵.
            </p>
          </div>
          <div>
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: "/admin" },
                { label: "Products Catalog" },
              ]}
            />
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {products.map((p, idx) => (
              <Card
                key={p.id}
                beamIndex={idx}
                className="flex flex-col justify-between transition-all hover:border-card-border/80"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge color="cyan" size="sm">
                      {p.type.replace("_", " ")}
                    </Badge>
                    <div className="flex size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-light-100 text-primary dark:bg-blue-light-950/60 dark:text-blue-light-400">
                      <Droplets className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-text-primary">
                        {p.name}
                      </h3>
                      <span className="text-[11px] font-mono text-text-tertiary uppercase">
                        SKU: {p.id}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2">
                    {p.description}
                  </p>
                </div>

                <div className="mt-4 space-y-2.5 border-t border-card-border pt-4 text-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="text-text-tertiary">Unit Price</span>
                    <span className="text-lg font-bold text-primary">
                      GH₵ {p.price.toFixed(2)}
                    </span>
                  </div>

                  {p.depositFee > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-tertiary">Bottle Deposit</span>
                      <span className="font-semibold text-text-secondary">
                        GH₵ {p.depositFee.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-text-tertiary">Inventory Status</span>
                    <Badge color="success" size="sm">
                      In Stock
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
