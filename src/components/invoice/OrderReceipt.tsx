"use client";

import React from "react";
import Badge from "@/components/ui/badge/Badge";
import type { StoredOrder } from "@/lib/order-store";

interface OrderReceiptProps {
  order: StoredOrder;
  onClose?: () => void;
  showPrintButton?: boolean;
}

export default function OrderReceipt({
  order,
  onClose,
  showPrintButton = true,
}: OrderReceiptProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-theme-md text-gray-900 dark:text-white print:border-none print:shadow-none print:bg-white print:text-black">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 print:bg-transparent print:border-b-2 print:border-black">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold text-sm tracking-tight print:bg-blue-600">
            FNW
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white print:text-black leading-tight">
              F-Net Water Hub
            </h3>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 print:text-gray-600 block">
              Official Delivery Receipt &amp; Tax Invoice
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-brand-600 dark:text-blue-light-400 print:text-black block">
            {order.orderNumber}
          </span>
          <span className="text-[11px] text-gray-400 print:text-gray-600">
            {formattedDate}
          </span>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* From & To Two-Column Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-gray-100 dark:border-gray-800 print:border-gray-300">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Issued By:
            </span>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white print:text-black">
              F-Net Water Hub Ghana Ltd.
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 print:text-gray-700 mt-1 leading-relaxed">
              Central Bottling &amp; Distribution Plant<br />
              Boundary Road, East Legon, Accra<br />
              Ghana Digital Address: GA-183-9021<br />
              Phone: +233 30 200 0000 / +233 24 100 0005
            </p>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Delivered &amp; Billed To:
            </span>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white print:text-black">
              {order.customerName}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-300 print:text-gray-700 mt-1 leading-relaxed">
              {order.deliveryAddressText}<br />
              Digital Address: {order.deliveryDigitalAddress}<br />
              Phone: {order.customerPhone}<br />
              Delivery Slot: {order.deliverySlot}
            </p>
          </div>
        </div>

        {/* Payment & Settlement Summary */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 print:bg-gray-100 print:border-gray-300 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Payment Channel</span>
            <span className="font-semibold text-gray-900 dark:text-white print:text-black">
              {order.paymentMethod === "MOBILE_MONEY"
                ? "Mobile Money (MTN / Telecel / AT)"
                : order.paymentMethod === "CARD"
                ? "Credit or Debit Card"
                : "Cash on Delivery"}
            </span>
          </div>

          <div>
            <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Payment Reference</span>
            <span className="font-mono text-gray-700 dark:text-gray-300 print:text-black font-semibold">
              {order.paymentReference || `FNW-REF-${order.id.slice(0, 8).toUpperCase()}`}
            </span>
          </div>

          <div>
            <span className="text-gray-500 dark:text-gray-400 block text-[11px]">Settlement Status</span>
            {order.paymentStatus === "PAID" ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <svg className="size-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                PAID • VERIFIED
              </span>
            ) : (
              <Badge color="warning" size="sm">
                Awaiting Payment
              </Badge>
            )}
          </div>
        </div>

        {/* Itemized Order Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 print:border-black text-gray-500 uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Price</th>
                <th className="py-2.5 px-3 text-right">Bottle Deposit</th>
                <th className="py-2.5 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 print:divide-gray-200">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-gray-900 dark:text-white print:text-black block">
                      {item.productName}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Standard pure drinking water formulation
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    GH₵ {item.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    {order.hasEmptyBottleExchange ? (
                      <span className="text-emerald-600 font-semibold">Waived (Exchange)</span>
                    ) : item.depositPrice > 0 ? (
                      `GH₵ ${(item.depositPrice * item.quantity).toFixed(2)}`
                    ) : (
                      "None"
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-gray-900 dark:text-white print:text-black">
                    GH₵ {item.totalPrice.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Calculation Breakdown */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 print:border-gray-300 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="text-xs text-gray-500 space-y-1 max-w-sm">
            <span className="font-semibold text-gray-700 dark:text-gray-300 print:text-black block">
              Bottle Return Policy:
            </span>
            <p className="text-[11px] leading-relaxed">
              Standard 18.9L bottles remain the property of F-Net Water Hub or are exchanged on a 1-for-1 basis upon delivery. Empties returned in clean, undamaged condition waive all bottle deposit charges.
            </p>
          </div>

          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal:</span>
              <span className="font-mono text-gray-900 dark:text-white print:text-black">
                GH₵ {order.subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-gray-500">
              <span>Bottle Deposit:</span>
              <span className="font-mono text-gray-900 dark:text-white print:text-black">
                {order.hasEmptyBottleExchange || order.depositFee === 0 ? (
                  <span className="text-emerald-600 font-semibold">GH₵ 0.00 (Exchanged)</span>
                ) : (
                  `GH₵ ${order.depositFee.toFixed(2)}`
                )}
              </span>
            </div>

            <div className="flex justify-between text-gray-500">
              <span>Delivery Fee:</span>
              <span className="font-mono text-gray-900 dark:text-white print:text-black">
                {order.deliveryFee === 0 ? (
                  <span className="text-emerald-600 font-semibold">FREE</span>
                ) : (
                  `GH₵ ${order.deliveryFee.toFixed(2)}`
                )}
              </span>
            </div>

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Referral Discount:</span>
                <span className="font-mono font-bold">
                  - GH₵ {order.discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700 print:border-black flex justify-between items-baseline">
              <span className="text-sm font-bold text-gray-900 dark:text-white print:text-black">
                Total Paid:
              </span>
              <span className="text-lg font-bold text-brand-600 dark:text-blue-light-400 print:text-black font-mono">
                GH₵ {order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Footer & Paid Stamp */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 print:border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center font-mono text-[9px] text-gray-400">
              QR
            </div>
            <span>
              Verified digital invoice. Scan or reference order number for customer care support.
            </span>
          </div>

          <div className="px-3 py-1 rounded-full border border-emerald-500 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-wider uppercase">
            Official F-Net Receipt
          </div>
        </div>

        {/* Action Controls (Hidden on Print) */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 print:hidden flex items-center justify-end gap-2.5">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
            >
              Close
            </button>
          )}

          {showPrintButton && (
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs cursor-pointer"
            >
              <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              <span>Print Official Receipt</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
