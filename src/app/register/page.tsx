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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      <div className="mb-6 sm:mb-8 text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          Create an Account
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-gray-500">
          Sign up to order pure 19L refills, track dispensers, and manage deliveries.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-2xl text-xs bg-red-50 border border-red-200 text-red-600 font-medium">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3.5 rounded-2xl text-xs bg-green-50 border border-green-200 text-green-700 font-medium">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Kwabena Mensah"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl bg-[#F6F8FC] border border-gray-200/90 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              required
              placeholder="024 123 4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl bg-[#F6F8FC] border border-gray-200/90 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl bg-[#F6F8FC] border border-gray-200/90 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="At least 6 chars"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full h-11 sm:h-12 px-4 pr-10 rounded-xl sm:rounded-2xl bg-[#F6F8FC] border border-gray-200/90 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition"
              >
                {showPassword ? (
                  <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full h-11 sm:h-12 px-4 pr-10 rounded-xl sm:rounded-2xl bg-[#F6F8FC] border border-gray-200/90 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition"
              >
                {showConfirmPassword ? (
                  <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
            Referral Code (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. FNW-REF-101"
            value={formData.referralCode}
            onChange={(e) =>
              setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })
            }
            className="w-full h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl bg-[#F6F8FC] border border-gray-200/90 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-hidden"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 sm:h-13 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold tracking-wider uppercase text-white bg-[#3B66FF] hover:bg-[#2753F0] active:scale-[0.99] shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 mt-4 cursor-pointer"
        >
          {isLoading ? "Creating Account..." : "CREATE ACCOUNT"}
        </button>
      </form>

      <div className="mt-6 sm:mt-8 text-center">
        <span className="text-xs sm:text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-brand-600 hover:underline ml-1"
          >
            Sign In
          </Link>
        </span>
      </div>
    </AuthPageLayout>
  );
}
