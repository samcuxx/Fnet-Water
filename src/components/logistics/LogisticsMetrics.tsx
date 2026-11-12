"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/tailgrids/core/card";
import { InvoiceIcon, TableIcon, TaskIcon, Widget4Icon } from "@/components/common/sidebar/icon";
import { ArrowUpIcon } from "@/utils/icon";
import React from "react";

export default function LogisticsMetrics() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {/* Metric 1 */}
      <Card beamIndex={0}>
        <CardHeader className="justify-between">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-light-50 text-primary dark:bg-blue-light-950">
            <Widget4Icon />
          </div>
        </CardHeader>
        <CardContent className="mt-3.5 sm:mt-5 p-0">
          <div className="text-lg leading-6 font-bold text-text-primary sm:text-xl md:text-2xl tracking-tight">
            18 Orders
          </div>
        </CardContent>
        <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between p-0">
          <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Active Runs</span>
          <span className="text-[11px] leading-4 sm:text-xs font-semibold text-primary">4 vans en route</span>
        </CardFooter>
      </Card>

      {/* Metric 2 */}
      <Card beamIndex={1}>
        <CardHeader className="justify-between">
          <div className="flex size-8 items-center justify-center rounded-lg bg-success-50 text-green-600 dark:bg-success-950">
            <TaskIcon />
          </div>
        </CardHeader>
        <CardContent className="mt-3.5 sm:mt-5 p-0">
          <div className="text-lg leading-6 font-bold text-green-600 sm:text-xl md:text-2xl tracking-tight">
            97.8%
          </div>
        </CardContent>
        <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between p-0">
          <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">On-Time Dispatch</span>
          <div className="flex items-center gap-1 text-[11px] leading-4 sm:text-xs font-semibold text-green-600">
            <span>+2.4%</span>
            <ArrowUpIcon />
          </div>
        </CardFooter>
      </Card>

      {/* Metric 3 */}
      <Card beamIndex={2}>
        <CardHeader className="justify-between">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-950">
            <TableIcon />
          </div>
        </CardHeader>
        <CardContent className="mt-3.5 sm:mt-5 p-0">
          <div className="text-lg leading-6 font-bold text-brand-600 dark:text-brand-400 sm:text-xl md:text-2xl tracking-tight">
            1,420
          </div>
        </CardContent>
        <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between p-0">
          <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Bottles Exchanged</span>
          <span className="text-[11px] leading-4 sm:text-xs font-semibold text-brand-600">Returned empties</span>
        </CardFooter>
      </Card>

      {/* Metric 4 */}
      <Card beamIndex={3}>
        <CardHeader className="justify-between">
          <div className="flex size-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500 dark:bg-orange-950">
            <InvoiceIcon />
          </div>
        </CardHeader>
        <CardContent className="mt-3.5 sm:mt-5 p-0">
          <div className="text-lg leading-6 font-bold text-orange-600 dark:text-orange-400 sm:text-xl md:text-2xl tracking-tight">
            GH₵ 2,840
          </div>
        </CardContent>
        <CardFooter className="mt-2.5 sm:mt-3 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between p-0">
          <span className="text-[11px] leading-4 sm:text-xs font-medium text-text-tertiary">Cash Collected</span>
          <span className="text-[11px] leading-4 sm:text-xs font-semibold text-orange-500">Route payments</span>
        </CardFooter>
      </Card>
    </div>
  );
}
