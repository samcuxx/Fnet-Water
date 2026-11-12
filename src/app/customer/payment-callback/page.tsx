"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Card } from "@/components/tailgrids/core/card";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import Skeleton from "@/components/ui/skeleton";
import { Check, FileText, X } from "lucide-react";

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [transactionData, setTransactionData] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      setErrorDetails("No payment reference detected in the return URL.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(`/api/payments/verify?reference=${encodeURIComponent(reference!)}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setSuccess(true);
          setMessage(data.message || "Payment verified successfully.");
          setTransactionData(data.transaction);
          setOrderData(data.order);
        } else {
          setSuccess(false);
          setErrorDetails(data.error || "Payment was not verified. Please try again.");
        }
      } catch {
        setSuccess(false);
        setErrorDetails("Network connection failed during verification.");
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [reference]);

  return (
    <div className="max-w-lg mx-auto py-8">
      {loading ? (
        <Card className="p-8 text-center space-y-4">
          <div className="size-16 rounded-full mx-auto relative flex items-center justify-center">
            <div className="size-16 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-text-primary">
              Verifying Payment
            </h2>
            <p className="text-xs text-text-tertiary">
              Please wait while we confirm your payment and settle your transaction.
            </p>
          </div>
        </Card>
      ) : success ? (
        <Card className="p-6 sm:p-8 text-center space-y-5">
          <div className="size-16 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
            <Check className="size-8" />
          </div>

          <div>
            <Badge color="success" size="sm">
              Settled &amp; Verified
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary mt-2">
              Payment Confirmed!
            </h2>
            <p className="text-xs text-text-tertiary mt-1">
              {message}
            </p>
          </div>

          <div className="rounded-xl bg-background-gray-secondary p-4 text-xs space-y-2 text-left border border-card-border">
            <div className="flex justify-between items-center">
              <span className="text-text-tertiary">Payment Reference:</span>
              <span className="font-mono font-bold text-text-primary">
                {reference}
              </span>
            </div>
            {transactionData && (
              <div className="flex justify-between items-center">
                <span className="text-text-tertiary">Amount Paid:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  GH₵ {transactionData.amount.toFixed(2)}
                </span>
              </div>
            )}
            {orderData && (
              <div className="flex justify-between items-center">
                <span className="text-text-tertiary">Order Number:</span>
                <span className="font-mono font-bold text-primary">
                  {orderData.orderNumber}
                </span>
              </div>
            )}
            {transactionData?.type === "DISPENSER_INSTALLMENT" && (
              <div className="flex justify-between items-center">
                <span className="text-text-tertiary">Payment Category:</span>
                <span className="font-bold text-primary">
                  Smart Dispenser Installment
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2.5 pt-2">
            {orderData && (
              <Button asChild className="w-full justify-center gap-1.5">
                <Link href={`/customer/orders/${orderData.id}/receipt`}>
                  <FileText className="size-4" />
                  <span>View Official Receipt</span>
                </Link>
              </Button>
            )}

            {transactionData?.type === "DISPENSER_INSTALLMENT" && (
              <Button asChild className="w-full justify-center">
                <Link href="/customer/dispenser">
                  <span>Return to Smart Dispenser</span>
                </Link>
              </Button>
            )}

            {orderData && (
              <Button asChild appearance="outline" className="w-full justify-center">
                <Link href="/customer/orders">
                  Go to My Orders
                </Link>
              </Button>
            )}

            <Button asChild appearance="ghost" className="w-full justify-center text-xs text-text-tertiary">
              <Link href="/customer">
                Return to Dashboard
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6 sm:p-8 text-center space-y-5">
          <div className="size-16 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center mx-auto shadow-xs">
            <X className="size-8" />
          </div>

          <div>
            <Badge color="error" size="sm">
              Payment Incomplete
            </Badge>
            <h2 className="text-xl font-bold tracking-tight text-text-primary mt-2">
              Payment Not Completed
            </h2>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 max-w-sm mx-auto">
              {errorDetails}
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <Button
              type="button"
              onClick={() => router.back()}
              className="w-full justify-center"
            >
              Try Again
            </Button>

            <Button asChild appearance="outline" className="w-full justify-center">
              <Link href="/customer/order">
                Return to Checkout
              </Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <AppLayout role="CUSTOMER">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Breadcrumbs
            dividerType="chevron"
            items={[
              { label: "Home", href: "/customer" },
              { label: "Payment Verification" },
            ]}
          />
        </div>

        <Suspense
          fallback={
            <div className="max-w-lg mx-auto py-16 text-center text-xs text-text-tertiary">
              Loading payment verification...
            </div>
          }
        >
          <CallbackContent />
        </Suspense>
      </div>
    </AppLayout>
  );
}
