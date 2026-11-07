"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AuthPageLayout from "@/components/layout/AuthPageLayout";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in, redirect to assigned portal
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userRole = (session.user as { role?: string }).role;
      const dest =
        userRole === "ADMIN"
          ? "/admin"
          : userRole === "MANAGER"
          ? "/manager"
          : userRole === "DRIVER"
          ? "/driver"
          : userRole === "AGENT"
          ? "/agent"
          : "/customer";
      window.location.replace(dest);
    }
  }, [status, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          referralCode: formData.referralCode || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Failed to create account.");
        setIsLoading(false);
        return;
      }

      setSuccessMsg("Account registered successfully! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setErrorMsg("Network error during registration. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Create Account
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Sign up to order 19L refills, track dispensers, and manage deliveries.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3 rounded-lg text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3 rounded-lg text-xs bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/60 text-green-700 dark:text-green-300">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Kwabena Mensah"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-11 px-3.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            required
            placeholder="024 123 4567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full h-11 px-3.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            placeholder="name@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full h-11 px-3.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="At least 6 chars"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full h-11 px-3.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              required
              placeholder="Repeat password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full h-11 px-3.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Referral Code (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. FNW-REF-101"
            value={formData.referralCode}
            onChange={(e) =>
              setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })
            }
            className="w-full h-11 px-3.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-lg text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs disabled:opacity-50 mt-4"
        >
          {isLoading ? "Creating Account..." : "Register Account"}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-600 dark:text-blue-light-400 hover:underline"
          >
            Sign In
          </Link>
        </span>
      </div>
    </AuthPageLayout>
  );
}
