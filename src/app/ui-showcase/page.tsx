"use client";

import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import ComponentCard from "@/components/common/ComponentCard";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import Alert from "@/components/ui/alert/Alert";
import ProgressBar from "@/components/ui/progressbar/ProgressBar";
import Modal from "@/components/ui/modal/Modal";
import Tabs from "@/components/ui/tabs/Tabs";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import Pagination from "@/components/ui/pagination/Pagination";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import Switch from "@/components/form/switch/Switch";
import Checkbox from "@/components/form/input/Checkbox";
import Radio from "@/components/form/input/Radio";
import DatePicker from "@/components/form/date-picker";
import MultiSelect from "@/components/form/MultiSelect";

export default function UiShowcasePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [switchActive, setSwitchActive] = useState(true);
  const [checkboxState, setCheckboxState] = useState(true);
  const [radioValue, setRadioValue] = useState("momo");
  const [multiSelectValues, setMultiSelectValues] = useState(["refill", "dispenser"]);

  // Sample Ghana water orders
  const sampleOrders = [
    {
      id: "ORD-7819",
      date: "Today, 10:30 AM",
      customer: "Kofi Owusu-Ansah",
      location: "East Legon, Accra",
      bottles: "4x 19L Refill (4 Returned)",
      amount: "GH₵ 180.00",
      paymentMethod: "MTN MoMo",
      status: "COMPLETED",
    },
    {
      id: "ORD-7820",
      date: "Today, 09:15 AM",
      customer: "Ama Serwaa",
      location: "Airport Residential",
      bottles: "2x 19L Refill (2 Returned)",
      amount: "GH₵ 90.00",
      paymentMethod: "Vodafone Cash",
      status: "IN_TRANSIT",
    },
    {
      id: "ORD-7821",
      date: "Yesterday, 04:00 PM",
      customer: "Kwabena Boateng",
      location: "Osu / Oxford Street",
      bottles: "Smart Dispenser (1/4 Plan)",
      amount: "GH₵ 450.00",
      paymentMethod: "Visa Card",
      status: "DISPATCHED",
    },
    {
      id: "ORD-7822",
      date: "Yesterday, 02:20 PM",
      customer: "Esi Mensah",
      location: "Spintex Road, Batsonaa",
      bottles: "6x 19L Refill (1 Owed)",
      amount: "GH₵ 270.00",
      paymentMethod: "MTN MoMo",
      status: "PENDING",
    },
  ];

  return (
    <AppLayout role="ADMIN">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Component Design System & Library
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              TailAdmin React 2.3 components ported to Next.js App Router for F Net Water Hub.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsModalOpen(true)}
            >
              Open Test Modal
            </Button>
            <Button size="sm" variant="primary">
              Ghana Cedis (GH₵)
            </Button>
          </div>
        </div>

        {/* Showcase Tabs */}
        <Tabs
          tabs={[
            { id: "overview", label: "Core UI", badge: "6" },
            { id: "forms", label: "Form Controls", badge: "8" },
            { id: "tables", label: "Data Tables", badge: "4" },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab 1: Core UI */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Buttons Card */}
            <ComponentCard
              title="Buttons"
              desc="Primary Brand Blue (#0057B8), Outline, sizes and icon states."
            >
              <div className="flex flex-wrap items-center gap-3">
                <Button size="md" variant="primary">
                  Primary Button
                </Button>
                <Button size="sm" variant="primary">
                  Small Primary
                </Button>
                <Button size="md" variant="outline">
                  Outline
                </Button>
                <Button size="sm" variant="outline" disabled>
                  Disabled
                </Button>
                <Button
                  size="md"
                  variant="primary"
                  startIcon={
                    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                  }
                >
                  Create Order
                </Button>
              </div>
            </ComponentCard>

            {/* Badges Card */}
            <ComponentCard
              title="Badges"
              desc="Status tags for order, payment, and dispenser states."
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="light" color="primary">
                    Refill Order
                  </Badge>
                  <Badge variant="light" color="success">
                    Paid via MoMo
                  </Badge>
                  <Badge variant="light" color="warning">
                    Pending Dispatch
                  </Badge>
                  <Badge variant="light" color="error">
                    Empty Owed
                  </Badge>
                  <Badge variant="light" color="info">
                    Dispenser Active
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="solid" color="primary">
                    Admin
                  </Badge>
                  <Badge variant="solid" color="success">
                    Delivered
                  </Badge>
                  <Badge variant="solid" color="warning">
                    In Transit
                  </Badge>
                  <Badge variant="solid" color="error">
                    Cancelled
                  </Badge>
                </div>
              </div>
            </ComponentCard>

            {/* Alert Banners Card */}
            <ComponentCard
              title="Alert Notifications"
              desc="Operational alerts for delivery dispatch and payment webhooks."
            >
              <div className="space-y-3">
                <Alert
                  variant="success"
                  title="Payment Received via Mobile Money"
                  message="GH₵ 180.00 confirmed for Kofi Owusu-Ansah (Ref: PAY_GH_8921)."
                  showLink
                  linkText="View Receipt"
                />
                <Alert
                  variant="warning"
                  title="Bottle Deficit Detected"
                  message="Driver run recorded 1 missing empty bottle at Cantonments stop."
                />
                <Alert
                  variant="info"
                  title="Smart Dispenser Telemetry"
                  message="Dispenser #DISP-042 temperature set to 8°C cold / 88°C hot."
                />
              </div>
            </ComponentCard>

            {/* Progress Bars Card */}
            <ComponentCard
              title="Progress Bars"
              desc="Used for delivery route completion and bottle return quota."
            >
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Assigned Route Deliveries Completed</span>
                    <span>75%</span>
                  </div>
                  <ProgressBar progress={75} size="md" color="brand" />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Empty Bottle Return Compliance</span>
                    <span>92%</span>
                  </div>
                  <ProgressBar progress={92} size="md" color="success" />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Dispenser Installment Repaid</span>
                    <span>50%</span>
                  </div>
                  <ProgressBar progress={50} size="md" color="warning" />
                </div>
              </div>
            </ComponentCard>
          </div>
        )}

        {/* Tab 2: Form Controls */}
        {activeTab === "forms" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComponentCard title="Text Inputs & Labels">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cust-name" required>
                    Customer Name
                  </Label>
                  <Input
                    id="cust-name"
                    placeholder="e.g. Kwesi Mensah"
                    defaultValue="Kwesi Mensah"
                  />
                </div>

                <div>
                  <Label htmlFor="cust-phone" required>
                    Ghana Phone Number (SMS &amp; Mobile Money)
                  </Label>
                  <Input
                    id="cust-phone"
                    placeholder="024XXXXXXX or +233..."
                    defaultValue="+233 24 123 4567"
                    success
                    hint="Phone number verified with SMS code."
                  />
                </div>

                <div>
                  <Label htmlFor="ghana-post">
                    Ghana Post GPS Digital Address
                  </Label>
                  <Input
                    id="ghana-post"
                    placeholder="e.g. GA-183-9024"
                    defaultValue="GA-183-9024"
                  />
                </div>

                <div>
                  <Label htmlFor="delivery-notes">Delivery Instructions</Label>
                  <TextArea
                    id="delivery-notes"
                    placeholder="Gate code, landmark, or specific instructions for the driver..."
                    defaultValue="Call customer upon arrival at East Legon police station junction."
                  />
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="Selects, Switches, & Pickers">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="product-select">Water Product Refill</Label>
                  <Select
                    id="product-select"
                    options={[
                      { value: "refill-19l", label: "19L Standard Bottle Refill (GH₵ 45.00)" },
                      { value: "refill-bulk", label: "Bulk Pack (10x 19L Refills - GH₵ 400.00)" },
                      { value: "dispenser-hot-cold", label: "Smart Hot/Cold Water Dispenser" },
                    ]}
                    defaultValue="refill-19l"
                  />
                </div>

                <div>
                  <Label htmlFor="delivery-date">Scheduled Delivery Date</Label>
                  <DatePicker
                    id="delivery-date"
                    defaultDate="2026-11-10"
                    placeholder="Select delivery day"
                  />
                </div>

                <div>
                  <Label>Multi-Product Order Selection</Label>
                  <MultiSelect
                    options={[
                      { value: "refill", text: "19L Bottle Refill" },
                      { value: "dispenser", text: "Smart Dispenser Contract" },
                      { value: "cup-dispenser", text: "Paper Cup Dispenser Attachment" },
                      { value: "cleaning", text: "Dispenser Sanitation Kit" },
                    ]}
                    value={multiSelectValues}
                    onChange={setMultiSelectValues}
                  />
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  <div>
                    <Switch
                      label="Enable Auto-SMS Order Updates"
                      checked={switchActive}
                      onChange={setSwitchActive}
                    />
                  </div>

                  <div>
                    <Checkbox
                      id="terms-check"
                      label="Customer agrees to empty bottle exchange policy"
                      checked={checkboxState}
                      onChange={setCheckboxState}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Preferred Payment Method</Label>
                    <div className="flex items-center gap-4">
                      <Radio
                        name="payMethod"
                        value="momo"
                        label="MTN / Telecel MoMo"
                        checked={radioValue === "momo"}
                        onChange={setRadioValue}
                      />
                      <Radio
                        name="payMethod"
                        value="card"
                        label="Debit / Credit Card"
                        checked={radioValue === "card"}
                        onChange={setRadioValue}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>
        )}

        {/* Tab 3: Tables & Modals */}
        {activeTab === "tables" && (
          <div className="space-y-6">
            <ComponentCard
              title="Recent Water Orders & Exchanges"
              desc="Live orders manifest in Accra dispatch hubs."
              action={
                <Button size="sm" variant="primary">
                  New Order
                </Button>
              }
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader nowrap className="w-32">
                      Order ID
                    </TableCell>
                    <TableCell isHeader>Customer & Location</TableCell>
                    <TableCell isHeader>Bottles / Exchange</TableCell>
                    <TableCell isHeader nowrap className="w-28">
                      Amount
                    </TableCell>
                    <TableCell isHeader nowrap align="right" className="w-48">
                      Status & Payment
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell nowrap>
                        <div className="font-semibold text-brand-600 dark:text-blue-light-400">
                          {order.id}
                        </div>
                        <div className="text-[11px] text-gray-400 dark:text-gray-500">
                          {order.date}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {order.customer}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {order.location}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs text-gray-800 dark:text-gray-200">
                          {order.bottles}
                        </div>
                      </TableCell>

                      <TableCell nowrap className="font-semibold text-gray-900 dark:text-white">
                        {order.amount}
                      </TableCell>

                      <TableCell nowrap align="right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Badge
                            size="sm"
                            variant="light"
                            color={
                              order.status === "COMPLETED"
                                ? "success"
                                : order.status === "IN_TRANSIT"
                                ? "warning"
                                : order.status === "DISPATCHED"
                                ? "primary"
                                : "error"
                            }
                          >
                            {order.status}
                          </Badge>
                          <Badge size="sm" variant="light" color="info">
                            {order.paymentMethod}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination
                currentPage={currentPage}
                totalPages={3}
                onPageChange={setCurrentPage}
              />
            </ComponentCard>
          </div>
        )}

        {/* Test Modal Component */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Ghana Water Refill Order"
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Dispatch a driver run and record bottle deposit expectations.
            </p>

            <div>
              <Label required>Customer Name</Label>
              <Input placeholder="e.g. Yaw Preko" defaultValue="Yaw Preko" />
            </div>

            <div>
              <Label required>Delivery Destination</Label>
              <Input
                placeholder="Residential Area / GPS Code"
                defaultValue="East Legon Hills, Accra"
              />
            </div>

            <div>
              <Label>Bottles to Refill</Label>
              <Select
                options={[
                  { value: "2", label: "2 Bottles (GH₵ 90.00)" },
                  { value: "4", label: "4 Bottles (GH₵ 180.00)" },
                  { value: "10", label: "10 Bottles (GH₵ 400.00)" },
                ]}
                defaultValue="4"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsModalOpen(false)}
              >
                Confirm Dispatch
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
