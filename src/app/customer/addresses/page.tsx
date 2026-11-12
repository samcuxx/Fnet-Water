"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/tailgrids/core/breadcrumbs";
import { Card } from "@/components/tailgrids/core/card";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import Modal from "@/components/ui/Modal";
import { SkeletonCard } from "@/components/ui/skeleton";
import { SearchIcon } from "@/components/common/header/icons";
import type { StoredAddress, AddressCategory } from "@/lib/customer-store";
import { X, Plus, Edit2, Trash2, MapPin, Check, Compass, Navigation, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<StoredAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Category filter
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeAddress, setActiveAddress] = useState<StoredAddress | null>(null);

  // Location mode: select current location OR type digital address
  const [locationMode, setLocationMode] = useState<"gps" | "manual">("gps");
  const [isLocating, setIsLocating] = useState(false);
  const [gpsCaptured, setGpsCaptured] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    category: AddressCategory;
    areaName: string;
    digitalAddress: string;
    deliveryInstructions: string;
    isDefault: boolean;
    gpsLatitude?: number;
    gpsLongitude?: number;
  }>({
    category: "HOME",
    areaName: "",
    digitalAddress: "",
    deliveryInstructions: "",
    isDefault: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GPS Geolocation Handler
  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setFormError("Geolocation is not supported by your browser or phone.");
      return;
    }

    setIsLocating(true);
    setFormError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setGpsCaptured({ lat: latitude, lng: longitude, accuracy });

        const autoDigitalCode = `GA-${Math.floor(Math.abs(latitude * 100)) % 900 + 100}-${Math.floor(Math.abs(longitude * 10000)) % 9000 + 1000}`;

        setFormData((prev) => ({
          ...prev,
          digitalAddress: prev.digitalAddress || autoDigitalCode,
          gpsLatitude: latitude,
          gpsLongitude: longitude,
        }));

        // Reverse geocoding via OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const road = data.address.road || data.address.street || "";
              const suburb = data.address.suburb || data.address.neighbourhood || data.address.residential || "";
              const city = data.address.city || data.address.town || data.address.county || "Accra";
              const areaParts = [road, suburb, city].filter(Boolean);
              if (areaParts.length > 0) {
                setFormData((prev) => ({
                  ...prev,
                  areaName: areaParts.join(", "),
                }));
              }
            }
          }
        } catch {
          // If reverse geocoding is unavailable, keep existing areaName
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setFormError("Location permission denied. Please allow GPS access or type your digital address below.");
        } else {
          setFormError("Unable to retrieve GPS position. Please type your digital address manually.");
        }
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  // Load addresses from API
  const loadAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/customer/addresses");
      const data = await res.json();
      if (data.success && data.addresses) {
        setAddresses(data.addresses);
      }
    } catch (err) {
      console.error("Failed to load addresses:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Client-side filtering
  const filteredAddresses = useMemo(() => {
    const q = search.toLowerCase().trim();
    return addresses.filter((addr) => {
      const matchesSearch =
        !q ||
        addr.areaName.toLowerCase().includes(q) ||
        addr.digitalAddress.toLowerCase().includes(q) ||
        addr.deliveryInstructions?.toLowerCase().includes(q);

      const matchesCat = categoryFilter === "ALL" || addr.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [addresses, search, categoryFilter]);

  // Add Address
  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to save address.");
        setIsSubmitting(false);
        return;
      }

      if (data.address.isDefault) {
        setAddresses((prev) => [
          data.address,
          ...prev.map((a) => ({ ...a, isDefault: false })),
        ]);
      } else {
        setAddresses((prev) => [...prev, data.address]);
      }

      setIsAddModalOpen(false);
      setFormData({
        category: "HOME",
        areaName: "",
        digitalAddress: "",
        deliveryInstructions: "",
        isDefault: false,
      });
      setFeedback({ type: "success", text: "New delivery location saved." });
    } catch {
      setFormError("Network connection error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (addr: StoredAddress) => {
    setActiveAddress(addr);
    setFormData({
      category: addr.category,
      areaName: addr.areaName,
      digitalAddress: addr.digitalAddress,
      deliveryInstructions: addr.deliveryInstructions || "",
      isDefault: addr.isDefault,
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAddress) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/customer/addresses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          addressId: activeAddress.id,
          ...formData,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.message || "Failed to update address.");
        setIsSubmitting(false);
        return;
      }

      setAddresses((prev) =>
        prev.map((a) => {
          if (a.id === activeAddress.id) return data.address;
          if (formData.isDefault) return { ...a, isDefault: false };
          return a;
        })
      );

      setIsEditModalOpen(false);
      setFeedback({ type: "success", text: "Address details updated." });
    } catch {
      setFormError("Network connection error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set Default
  const handleSetDefault = async (addr: StoredAddress) => {
    try {
      const res = await fetch("/api/customer/addresses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "setDefault",
          addressId: addr.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses((prev) =>
          prev.map((a) => ({
            ...a,
            isDefault: a.id === addr.id,
          }))
        );
        setFeedback({
          type: "success",
          text: `${addr.areaName} is now your default delivery address.`,
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to update default address." });
    }
  };

  // Open Delete Modal
  const openDeleteModal = (addr: StoredAddress) => {
    setActiveAddress(addr);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!activeAddress) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/customer/addresses?id=${activeAddress.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== activeAddress.id));
        setIsDeleteModalOpen(false);
        setFeedback({ type: "success", text: "Address removed successfully." });
      } else {
        setFeedback({
          type: "error",
          text: data.message || "Failed to delete address.",
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Network connection error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadgeColor = (category: AddressCategory): "primary" | "cyan" | "success" | "warning" | "neutral" => {
    switch (category) {
      case "HOME":
        return "primary";
      case "OFFICE":
        return "cyan";
      case "SHOP":
        return "success";
      case "SCHOOL":
        return "warning";
      case "WAREHOUSE":
      default:
        return "neutral";
    }
  };

  return (
    <AppLayout role="CUSTOMER">
      <div className="space-y-6">
        {/* Toast / Notification Banner */}
        {feedback && (
          <div
            className={`flex items-center justify-between rounded-xl p-4 text-xs font-semibold sm:text-sm ${
              feedback.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Check className="size-4 shrink-0" />
              <span>{feedback.text}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-text-tertiary hover:text-text-primary cursor-pointer p-0.5"
              aria-label="Dismiss message"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Breadcrumbs & Header Section */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Delivery Addresses
            </h1>
            <p className="mt-1 text-xs text-text-tertiary sm:text-sm">
              Manage saved GhanaPost GPS locations for quick doorstep delivery.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Breadcrumbs
              dividerType="chevron"
              items={[
                { label: "Home", href: "/customer" },
                { label: "Addresses" },
              ]}
            />
            <Button
              size="sm"
              onClick={() => {
                setFormData({
                  category: "HOME",
                  areaName: "",
                  digitalAddress: "",
                  deliveryInstructions: "",
                  isDefault: false,
                });
                setFormError(null);
                setIsAddModalOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="size-3.5" />
              <span>Add Address</span>
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <Card className="p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <InputGroup>
                <InputGroupAddon className="text-icon-secondary">
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  type="text"
                  placeholder="Search addresses or digital codes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="text-xs"
                />
              </InputGroup>
            </div>

            <div className="w-full sm:w-60">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by address category"
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="HOME">Home</option>
                <option value="OFFICE">Office</option>
                <option value="SHOP">Shop</option>
                <option value="WAREHOUSE">Warehouse</option>
                <option value="SCHOOL">School</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Address Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
          </div>
        ) : filteredAddresses.length === 0 ? (
          <Card className="p-12 text-center text-xs text-text-tertiary sm:text-sm">
            No delivery locations match your search criteria.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAddresses.map((addr) => (
              <Card
                key={addr.id}
                className={`flex flex-col justify-between p-5 sm:p-6 transition ${
                  addr.isDefault
                    ? "border-primary bg-blue-light-50/20 dark:bg-blue-light-950/20"
                    : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge color={getCategoryBadgeColor(addr.category)} size="sm">
                      {addr.category}
                    </Badge>

                    {addr.isDefault ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                        <span className="size-1.5 rounded-full bg-primary" />
                        Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr)}
                        className="text-[11px] text-text-tertiary hover:text-primary font-medium transition cursor-pointer"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-text-primary leading-snug">
                    {addr.areaName}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded bg-background-gray-secondary px-2 py-0.5 font-mono text-xs font-semibold text-text-secondary">
                      {addr.digitalAddress}
                    </span>
                  </div>

                  {addr.deliveryInstructions && (
                    <p className="mt-3 text-xs text-text-tertiary italic line-clamp-2">
                      &ldquo;{addr.deliveryInstructions}&rdquo;
                    </p>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-end gap-2 border-t border-card-border pt-4">
                  <Button
                    appearance="outline"
                    size="sm"
                    onClick={() => openEditModal(addr)}
                    className="gap-1.5 text-xs font-semibold"
                  >
                    <Edit2 className="size-3.5" />
                    <span>Edit</span>
                  </Button>

                  <Button
                    appearance="outline"
                    size="sm"
                    onClick={() => openDeleteModal(addr)}
                    className="gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* MODAL 1: Add Address */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Delivery Address"
        >
          {formError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateAddress} className="space-y-4">
            {/* Location Input Method Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-text-primary">
                Select Location Method
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-lg border border-card-border bg-background-gray-secondary/60">
                <button
                  type="button"
                  onClick={() => setLocationMode("gps")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-md transition cursor-pointer",
                    locationMode === "gps"
                      ? "bg-primary text-white shadow-xs"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  <Navigation className="size-3.5 shrink-0" />
                  <span>Use Current Location</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode("manual")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-md transition cursor-pointer",
                    locationMode === "manual"
                      ? "bg-primary text-white shadow-xs"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  <MapPin className="size-3.5 shrink-0" />
                  <span>Type Digital Address</span>
                </button>
              </div>
            </div>

            {locationMode === "gps" && (
              <div className="space-y-2.5 rounded-xl border border-primary/20 bg-blue-light-50/40 p-3.5 dark:bg-blue-light-950/20 dark:border-blue-900/40">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-text-primary">
                      Current GPS Location
                    </span>
                    <span className="text-[11px] text-text-tertiary">
                      Pinpoint your doorstep location automatically
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={isLocating}
                    onClick={handleUseCurrentLocation}
                    className="gap-1.5 bg-primary hover:bg-brand-600 text-white shadow-xs cursor-pointer shrink-0"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Detecting...</span>
                      </>
                    ) : (
                      <>
                        <Compass className="size-3.5" />
                        <span>Detect Location</span>
                      </>
                    )}
                  </Button>
                </div>

                {gpsCaptured ? (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 p-2 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <Check className="size-4 shrink-0 text-emerald-600" />
                    <div>
                      <div className="font-semibold">GPS Position Captured</div>
                      <div className="font-mono text-[11px] opacity-80">
                        {gpsCaptured.lat.toFixed(5)}° N, {gpsCaptured.lng.toFixed(5)}° W (±{Math.round(gpsCaptured.accuracy)}m)
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-text-tertiary">
                    Tap &quot;Detect Location&quot; to allow your phone or browser to locate your delivery spot.
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                GhanaPost Digital Address
              </label>
              <input
                type="text"
                required
                placeholder="e.g. GA-492-1029"
                value={formData.digitalAddress}
                onChange={(e) => setFormData({ ...formData, digitalAddress: e.target.value.toUpperCase() })}
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs font-mono text-text-primary focus:outline-hidden focus:border-primary transition"
              />
              <span className="text-[10px] text-text-tertiary mt-0.5 block">
                {gpsCaptured ? "Automatically derived from your GPS coordinates or enter specific postal code." : "Enter your Ghana Digital Address code (e.g. GA-492-1029)."}
              </span>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Street Name &amp; Area Landmark
              </label>
              <input
                type="text"
                required
                placeholder="e.g. House 14, Boundary Road, East Legon"
                value={formData.areaName}
                onChange={(e) => setFormData({ ...formData, areaName: e.target.value })}
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Location Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as AddressCategory })}
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
              >
                <option value="HOME">Residential Home</option>
                <option value="OFFICE">Office</option>
                <option value="SHOP">Shop / Retail</option>
                <option value="WAREHOUSE">Warehouse</option>
                <option value="SCHOOL">School</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Drop-Off &amp; Driver Instructions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Call 0244950505 upon arrival, leave with security reception..."
                value={formData.deliveryInstructions}
                onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                className="w-full rounded-lg border border-card-border bg-card-background p-2.5 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="size-4 rounded border-card-border text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-text-primary font-medium">Set as my default delivery location for water orders</span>
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-card-border">
              <Button
                type="button"
                appearance="outline"
                size="sm"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting ? "Saving..." : "Save Address"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* MODAL 2: Edit Address */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Delivery Address"
        >
          {formError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveEdit} className="space-y-4">
            {/* Quick GPS detect */}
            <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-blue-light-50/30 p-3 dark:bg-blue-light-950/20">
              <span className="text-xs font-semibold text-text-primary">
                Update Location via GPS
              </span>
              <Button
                type="button"
                size="sm"
                disabled={isLocating}
                onClick={handleUseCurrentLocation}
                className="gap-1.5 bg-primary hover:bg-brand-600 text-white shadow-xs cursor-pointer"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Detecting...</span>
                  </>
                ) : (
                  <>
                    <Compass className="size-3.5" />
                    <span>Detect Location</span>
                  </>
                )}
              </Button>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                GhanaPost Digital Address
              </label>
              <input
                type="text"
                required
                value={formData.digitalAddress}
                onChange={(e) => setFormData({ ...formData, digitalAddress: e.target.value.toUpperCase() })}
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs font-mono text-text-primary focus:outline-hidden focus:border-primary transition"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Street Name &amp; Area Landmark
              </label>
              <input
                type="text"
                required
                value={formData.areaName}
                onChange={(e) => setFormData({ ...formData, areaName: e.target.value })}
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Location Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as AddressCategory })}
                className="h-10 w-full rounded-lg border border-card-border bg-card-background px-3 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
              >
                <option value="HOME">Residential Home</option>
                <option value="OFFICE">Office</option>
                <option value="SHOP">Shop / Retail</option>
                <option value="WAREHOUSE">Warehouse</option>
                <option value="SCHOOL">School</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-text-primary">
                Delivery Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.deliveryInstructions}
                onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                className="w-full rounded-lg border border-card-border bg-card-background p-2.5 text-xs text-text-primary focus:outline-hidden focus:border-primary transition"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="size-4 rounded border-card-border text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-text-primary font-medium">Set as my primary delivery address</span>
              </label>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-card-border">
              <Button
                type="button"
                appearance="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* MODAL 3: Delete Confirmation */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Delivery Address"
        >
          <div className="space-y-4">
            <p className="text-xs text-text-secondary sm:text-sm">
              Are you sure you want to remove <strong>{activeAddress?.areaName}</strong>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-card-border">
              <Button
                type="button"
                appearance="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                size="sm"
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isSubmitting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
