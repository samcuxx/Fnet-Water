"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession, useSession } from "next-auth/react";
import AuthPageLayout from "@/components/layout/AuthPageLayout";

interface DemoAccount {
  role: string;
  label: string;
  identifier: string;
  password: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { role: "ADMIN", label: "Admin", identifier: "admin@fnetwater.com", password: "admin123" },
  { role: "MANAGER", label: "Manager", identifier: "manager@fnetwater.com", password: "manager123" },
  { role: "DRIVER", label: "Driver", identifier: "driver@fnetwater.com", password: "driver123" },
  { role: "AGENT", label: "Agent", identifier: "agent@fnetwater.com", password: "agent123" },
  { role: "CUSTOMER", label: "Customer", identifier: "customer@fnetwater.com", password: "customer123" },
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const urlError = searchParams.get("error");
  const { data: session, status } = useSession();

  const [authMethod, setAuthMethod] = useState<"password" | "sms">("password");

  // Password Sign In state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // SMS Sign In state: 1 = Phone input, 2 = 5-box OTP input
  const [smsStep, setSmsStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(urlError || null);

  // If already authenticated, redirect immediately to assigned dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const destination = callbackUrl || getRoleDestination((session.user as { role?: string }).role);
      window.location.replace(destination);
    }
  }, [status, session, callbackUrl]);

  // Refs for 5-digit inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Focus first OTP box when entering Step 2
  useEffect(() => {
    if (smsStep === 2 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [smsStep]);

  const getRoleDestination = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "/admin";
      case "MANAGER":
        return "/manager";
      case "DRIVER":
        return "/driver";
      case "AGENT":
        return "/agent";
      case "CUSTOMER":
        return "/customer";
      default:
        return "/customer";
    }
  };

  const handleSelectDemo = (account: DemoAccount) => {
    setAuthMethod("password");
    setSmsStep(1);
    setIdentifier(account.identifier);
    setPassword(account.password);
    setErrorMsg(null);
  };

  // 1. Password Login Submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim() || !password) {
      setErrorMsg("Please enter your email or phone number and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        identifier: identifier.trim(),
        password,
        isOtp: "false",
      });

      if (res?.error) {
        setErrorMsg(res.error);
        setIsLoading(false);
        return;
      }

      const session = await getSession();
      const destination = callbackUrl || getRoleDestination(session?.user?.role);
      window.location.replace(destination);
    } catch {
      setErrorMsg("An unexpected sign in error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // 2. SMS Step 1: Send Code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setDevOtp(null);

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setErrorMsg("Please enter your phone number.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: trimmedPhone }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Failed to send verification code.");
        setIsLoading(false);
        return;
      }

      setSmsStep(2);
      setCountdown(60);
      if (data.devOtp) setDevOtp(data.devOtp);
      setOtpDigits(["", "", "", "", ""]);
    } catch {
      setErrorMsg("Failed to dispatch code. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle 5-box OTP change
  const handleDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) {
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
      return;
    }

    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 5).split("");
      const newDigits = [...otpDigits];
      for (let i = 0; i < 5; i++) {
        newDigits[i] = pasted[i] || "";
      }
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 4);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned[0];
    setOtpDigits(newDigits);

    if (index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 5; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setOtpDigits(newDigits);
    const nextIndex = Math.min(pasted.length, 4);
    inputRefs.current[nextIndex]?.focus();
  };

  // 3. SMS Step 2: Verify & Sign In
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const fullCode = otpDigits.join("");
    if (fullCode.length < 5) {
      setErrorMsg("Please enter the complete 5-digit verification code.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        identifier: phone.trim(),
        otpCode: fullCode,
        isOtp: "true",
      });

      if (res?.error) {
        setErrorMsg(res.error);
        setIsLoading(false);
        return;
      }

      const session = await getSession();
      const destination = callbackUrl || getRoleDestination(session?.user?.role);
      window.location.replace(destination);
    } catch {
      setErrorMsg("Failed to verify code. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      {/* Title & Description */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          {smsStep === 2 && authMethod === "sms"
            ? "Enter verification code"
            : "Sign In"}
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {smsStep === 2 && authMethod === "sms"
            ? `Enter the 5-digit code sent to ${phone}`
            : "Access your water refills, orders, and account portal."}
        </p>
      </div>

      {/* Method Tabs (Only in Step 1) */}
      {smsStep === 1 && (
        <div className="grid grid-cols-2 gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setAuthMethod("password");
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition ${
              authMethod === "password"
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-theme-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod("sms");
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition ${
              authMethod === "sms"
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-theme-xs"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            SMS Code
          </button>
        </div>
      )}

      {/* Feedback Alert */}
      {errorMsg && (
        <div className="mb-5 p-3 rounded-lg text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      {/* VIEW A: Password Authentication */}
      {authMethod === "password" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Email or Phone Number
            </label>
            <input
              type="text"
              required
              placeholder="name@example.com or 024 123 4567"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full h-11 px-3.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Link
                href="/reset-password"
                className="text-xs text-brand-600 dark:text-blue-light-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3.5 pr-10 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-medium"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-lg text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs disabled:opacity-50 mt-2"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      )}

      {/* VIEW B - STEP 1: Enter Phone Number */}
      {authMethod === "sms" && smsStep === 1 && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              required
              placeholder="024 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 px-3.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
            />
            <span className="block mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              We will send a 5-digit verification code to this number.
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-lg text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs disabled:opacity-50 mt-2"
          >
            {isLoading ? "Sending code..." : "Send Code"}
          </button>
        </form>
      )}

      {/* VIEW B - STEP 2: Enter 5-Box Verification Code */}
      {authMethod === "sms" && smsStep === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          {devOtp && (
            <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs">
              <span className="text-blue-700 dark:text-blue-300">
                Test Code: <strong className="font-mono font-bold">{devOtp}</strong>
              </span>
              <button
                type="button"
                onClick={() => setOtpDigits(devOtp.split(""))}
                className="text-[11px] font-semibold text-brand-600 dark:text-blue-light-400 underline"
              >
                Auto-Fill
              </button>
            </div>
          )}

          <div>
            <label className="block text-center text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">
              Type your 5-digit security code
            </label>
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {[0, 1, 2, 3, 4].map((index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otpDigits[index]}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <button
              type="button"
              onClick={() => {
                setSmsStep(1);
                setErrorMsg(null);
              }}
              className="font-medium text-gray-700 dark:text-gray-300 hover:underline"
            >
              &larr; Change number
            </button>

            {countdown > 0 ? (
              <span>Resend in {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleSendCode}
                className="font-semibold text-brand-600 dark:text-blue-light-400 hover:underline"
              >
                Resend code
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || otpDigits.join("").length < 5}
            className="w-full h-11 rounded-lg text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify & Sign In"}
          </button>
        </form>
      )}

      {/* Quick Demo Switcher (Discreet for testing) */}
      <div className="mt-8 pt-5 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-gray-400">
            Quick Test Accounts:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => handleSelectDemo(acc)}
              className="text-[11px] px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium transition"
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-600 dark:text-blue-light-400 hover:underline"
          >
            Sign Up
          </Link>
        </span>
      </div>
    </AuthPageLayout>
  );
}
