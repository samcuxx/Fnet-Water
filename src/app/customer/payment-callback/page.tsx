"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import Badge from "@/components/ui/badge/Badge";

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
      } catch (err) {
        setSuccess(false);
        setErrorDetails("Network connection failed during verification.");
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [reference]);

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      {loading ? (
        <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-theme-md space-y-4">
          <div className="size-14 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto" />
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Verifying Payment
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Please wait while we confirm your payment and settle your transaction.
            </p>
          </div>
          <span className="font-mono text-[11px] text-gray-400 block">
            Reference: {reference}
          </span>
        </div>
      ) : success ? (
        <div className="p-6 sm:p-8 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-theme-md space-y-5">
          <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-950/30">
            <svg className="size-8" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div>
            <Badge color="success" size="sm">
              Settled &amp; Verified
            </Badge>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mt-2">
              Payment Confirmed!
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {message}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-xs space-y-2 text-left">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Payment Reference:</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                {reference}
              </span>
            </div>
            {transactionData && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  GH₵ {transactionData.amount.toFixed(2)}
                </span>
              </div>
            )}
            {orderData && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Order ID:</span>
                <span className="font-mono font-bold text-brand-600 dark:text-blue-light-400">
                  {orderData.orderNumber}
                </span>
              </div>
            )}
            {transactionData?.type === "DISPENSER_INSTALLMENT" && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Payment Category:</span>
                <span className="font-bold text-brand-600 dark:text-blue-light-400">
                  Smart Dispenser Installment
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-2">
            {orderData && (
              <Link
                href={`/customer/orders/${orderData.id}/receipt`}
                className="w-full py-3 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition flex items-center justify-center gap-1.5 shadow-theme-xs cursor-pointer"
              >
                <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>View Official Tax Receipt</span>
              </Link>
            )}

            {transactionData?.type === "DISPENSER_INSTALLMENT" && (
              <Link
                href="/customer/dispenser"
                className="w-full py-3 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition flex items-center justify-center gap-1.5 shadow-theme-xs cursor-pointer"
              >
                <span>Return to Smart Dispenser</span>
              </Link>
            )}

            {orderData && (
              <Link
                href="/customer/orders"
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition block"
              >
                Go to My Deliveries
              </Link>
            )}

            <Link
              href="/customer"
              className="w-full py-2 text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 block"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-6 sm:p-8 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-theme-md space-y-5">
          <div className="size-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto ring-8 ring-rose-50 dark:ring-rose-950/30">
            <svg className="size-8" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div>
            <Badge color="error" size="sm">
              Payment Incomplete
            </Badge>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mt-2">
              Payment Not Completed
            </h2>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 max-w-sm mx-auto">
              {errorDetails}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full py-3 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 transition shadow-theme-xs cursor-pointer"
            >
              Try Again
            </button>

            <Link
              href="/customer/order"
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition block"
            >
              Return to Refill Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <AppLayout role="CUSTOMER">
      <Suspense
        fallback={
          <div className="max-w-lg mx-auto py-16 text-center text-xs text-gray-400">
            Loading payment verification...
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </AppLayout>
  );
}
