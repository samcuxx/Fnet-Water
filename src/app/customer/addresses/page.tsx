"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import type { StoredAddress, AddressCategory } from "@/lib/customer-store";

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

  // Form state
  const [formData, setFormData] = useState({
    category: "HOME" as AddressCategory,
    areaName: "",
    digitalAddress: "",
    deliveryInstructions: "",
    isDefault: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Client-side filtering (0ms lag)
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

      // Update state
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
      setFormError("Network error occurred.");
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
      setFormError("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set Default
  const handleSetDefault = async (addr: StoredAddress) => {
    if (addr.isDefault) return;

    // Optimistic update
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === addr.id,
      }))
    );

    try {
      const res = await fetch("/api/customer/addresses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "default", addressId: addr.id }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: "success", text: `${addr.areaName} set as primary delivery location.` });
      } else {
        loadAddresses();
      }
    } catch {
      loadAddresses();
    }
  };

  // Open Delete
  const openDeleteModal = (addr: StoredAddress) => {
    setActiveAddress(addr);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!activeAddress) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/customer/addresses?addressId=${activeAddress.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== activeAddress.id));
        setIsDeleteModalOpen(false);
        setFeedback({ type: "success", text: "Delivery location removed." });
      } else {
        setFeedback({ type: "error", text: data.message || "Failed to delete address." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryBadgeColor = (category: AddressCategory): "primary" | "info" | "success" | "warning" | "dark" => {
    switch (category) {
      case "HOME":
        return "primary";
      case "OFFICE":
        return "info";
      case "SHOP":
        return "warning";
      case "WAREHOUSE":
        return "dark";
      default:
        return "dark";
    }
  };

  return (
    <AppLayout role="CUSTOMER">
      <div className="space-y-5 max-w-5xl mx-auto">
        {/* Toast / Notification Banner */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-all ${
              feedback.type === "success"
                ? "bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 text-green-700 dark:text-green-300"
                : "bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300"
            }`}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-0.5 rounded-lg"
              aria-label="Dismiss message"
            >
              <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Delivery Addresses
            </h1>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Saved locations for water deliveries.
            </p>
          </div>

          <button
            type="button"
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
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs self-start sm:self-auto cursor-pointer"
          >
            <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add Address
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2 relative">
            <input
              type="text"
              placeholder="Search addresses or digital codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9.5 pl-8.5 pr-3 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
            <svg
              className="size-3.5 text-gray-400 absolute left-3 top-3 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition cursor-pointer"
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

        {/* Address Cards Grid */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="size-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Loading delivery addresses...</span>
          </div>
        ) : filteredAddresses.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No delivery locations match your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAddresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-5 rounded-2xl border transition shadow-theme-xs flex flex-col justify-between ${
                  addr.isDefault
                    ? "border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 ring-1 ring-brand-500/30"
                    : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge color={getCategoryBadgeColor(addr.category)} variant="light" size="sm">
                      {addr.category}
                    </Badge>

                    {addr.isDefault ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-blue-light-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                        Default Location
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr)}
                        className="text-[11px] text-gray-500 hover:text-brand-600 dark:hover:text-blue-light-400 font-medium transition cursor-pointer"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-snug">
                    {addr.areaName}
                  </h3>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                      {addr.digitalAddress}
                    </span>
                    <span className="text-[11px] text-gray-400">GhanaPost GPS</span>
                  </div>

                  {addr.deliveryInstructions && (
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-800/60 leading-relaxed italic">
                      "{addr.deliveryInstructions}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    Added {new Date(addr.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(addr)}
                      title="Edit Address"
                      className="p-1.5 rounded-lg text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>

                    <button
                      type="button"
                      onClick={() => openDeleteModal(addr)}
                      title="Delete Address"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL: Add Delivery Address */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Delivery Address"
        >
          {formError && (
            <div className="mb-4 p-3 rounded-lg text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateAddress} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location Type
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as AddressCategory })
                  }
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
                >
                  <option value="HOME">Residential Home</option>
                  <option value="OFFICE">Corporate Office</option>
                  <option value="SHOP">Commercial Shop / Store</option>
                  <option value="WAREHOUSE">Warehouse / Facility</option>
                  <option value="SCHOOL">School / Institution</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ghana Digital Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GA-492-1029"
                  value={formData.digitalAddress}
                  onChange={(e) => setFormData({ ...formData, digitalAddress: e.target.value })}
                  className="w-full h-9 px-3 text-sm font-mono rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Street Name &amp; Area Landmark
              </label>
              <input
                type="text"
                required
                placeholder="e.g. House 14, Boundary Road"
                value={formData.areaName}
                onChange={(e) => setFormData({ ...formData, areaName: e.target.value })}
                className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Drop-Off &amp; Driver Instructions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Call 0241000005 upon arrival, leave with security reception."
                value={formData.deliveryInstructions}
                onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isDefaultAdd"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="isDefaultAdd" className="text-xs text-gray-700 dark:text-gray-300">
                Set as my default delivery location for water orders
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Saving..." : "Save Location"}
              </button>
            </div>
          </form>
        </Modal>

        {/* MODAL: Edit Delivery Address */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Delivery Address"
        >
          {formError && (
            <div className="mb-4 p-3 rounded-lg text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location Type
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as AddressCategory })
                  }
                  className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
                >
                  <option value="HOME">Residential Home</option>
                  <option value="OFFICE">Corporate Office</option>
                  <option value="SHOP">Commercial Shop / Store</option>
                  <option value="WAREHOUSE">Warehouse / Facility</option>
                  <option value="SCHOOL">School / Institution</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ghana Digital Address
                </label>
                <input
                  type="text"
                  required
                  value={formData.digitalAddress}
                  onChange={(e) => setFormData({ ...formData, digitalAddress: e.target.value })}
                  className="w-full h-9 px-3 text-sm font-mono rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Street Name &amp; Area Landmark
              </label>
              <input
                type="text"
                required
                value={formData.areaName}
                onChange={(e) => setFormData({ ...formData, areaName: e.target.value })}
                className="w-full h-9 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Drop-Off &amp; Driver Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.deliveryInstructions}
                onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                className="w-full p-2.5 text-xs sm:text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 transition"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isDefaultEdit"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="isDefaultEdit" className="text-xs text-gray-700 dark:text-gray-300">
                Primary delivery location
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-medium rounded-lg text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>

        {/* MODAL: Delete Address */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Address Removal"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to remove{" "}
              <strong className="text-gray-900 dark:text-white">{activeAddress?.areaName}</strong>{" "}
              ({activeAddress?.digitalAddress}) from your delivery address book?
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition shadow-theme-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Removing..." : "Remove Location"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
