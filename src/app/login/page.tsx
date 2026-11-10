"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
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

function LoginContent() {
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
  const [rememberMe, setRememberMe] = useState(false);

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
      {/* Title & Description with Smooth Transition */}
      <motion.div
        key={smsStep === 2 && authMethod === "sms" ? "title-verify" : "title-signin"}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-6 sm:mb-8 text-left"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          {smsStep === 2 && authMethod === "sms"
            ? "Enter Verification Code"
            : "Sign In to your Account"}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-gray-500">
          {smsStep === 2 && authMethod === "sms"
            ? `Enter the 5-digit code sent to ${phone}`
            : "Welcome back! Enter your details to access your account."}
        </p>
      </motion.div>

      {/* Segmented Method Switcher with Sliding Active Pill */}
      {smsStep === 1 && (
        <div className="relative grid grid-cols-2 p-1 bg-[#F1F4FA] rounded-2xl mb-6 border border-gray-200/60 select-none">
          <button
            type="button"
            onClick={() => {
              setAuthMethod("password");
              setErrorMsg(null);
            }}
            className={`relative py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer z-10 ${
              authMethod === "password"
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {authMethod === "password" && (
              <motion.div
                layoutId="authTabIndicator"
                className="absolute inset-0 bg-white rounded-xl shadow-xs -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod("sms");
              setErrorMsg(null);
            }}
            className={`relative py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer z-10 ${
              authMethod === "sms"
                ? "text-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {authMethod === "sms" && (
              <motion.div
                layoutId="authTabIndicator"
                className="absolute inset-0 bg-white rounded-xl shadow-xs -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            SMS Code
          </button>
        </div>
      )}

      {/* Feedback Alert with Animated Presence */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-5"
          >
            <div className="p-3.5 rounded-2xl text-xs bg-red-50 border border-red-200 text-red-600 font-medium">
              {errorMsg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* VIEW A: Password Authentication */}
        {authMethod === "password" && (
          <motion.div
            key="password-view"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <form onSubmit={handlePasswordSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Email or Phone Number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl sm:rounded-2xl bg-[#F6F8FC] border border-gray-200/90 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-hidden"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs sm:text-sm font-bold text-gray-800">
                    Password
                  </label>
                  <Link
                    href="/reset-password"
                    className="text-xs font-semibold text-brand-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 px-4 pr-11 rounded-xl sm:rounded-2xl bg-[#F6F8FC] border border-gray-200/90 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition"
                  >
                    {showPassword ? (
                      <svg className="size-4.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    ) : (
                      <svg className="size-4.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-gray-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-4.5 rounded-md border-gray-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full h-12 sm:h-13 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold tracking-wider uppercase text-white bg-[#3B66FF] hover:bg-[#2753F0] active:scale-[0.99] shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoading ? "Signing In..." : "SIGN IN"}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* VIEW B - STEP 1: Enter Phone Number */}
        {authMethod === "sms" && smsStep === 1 && (
          <motion.div
            key="sms-step-1"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <form onSubmit={handleSendCode} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="024 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl sm:rounded-2xl bg-[#F6F8FC] border border-gray-200/90 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-hidden font-mono"
                />
                <span className="block mt-2 text-xs text-gray-500">
                  We will send a 5-digit verification code to this number.
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full h-12 sm:h-13 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold tracking-wider uppercase text-white bg-[#3B66FF] hover:bg-[#2753F0] active:scale-[0.99] shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoading ? "Sending Code..." : "SEND CODE"}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* VIEW B - STEP 2: Enter 5-Box Verification Code */}
        {authMethod === "sms" && smsStep === 2 && (
          <motion.div
            key="sms-step-2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <form onSubmit={handleVerifyOtp} className="space-y-5 sm:space-y-6">
              {devOtp && (
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                  <span className="text-blue-700">
                    Test Code: <strong className="font-mono font-bold">{devOtp}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpDigits(devOtp.split(""))}
                    className="text-[11px] font-bold text-brand-600 underline cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <div>
                <label className="block text-center text-xs sm:text-sm font-bold text-gray-800 mb-3">
                  Type your 5-digit security code
                </label>
                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                  {[0, 1, 2, 3, 4].map((index) => (
                    <motion.input
                      key={index}
                      whileFocus={{ scale: 1.06 }}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otpDigits[index]}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold font-mono rounded-2xl border border-gray-200/90 bg-[#F6F8FC] text-gray-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-hidden"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <button
                  type="button"
                  onClick={() => {
                    setSmsStep(1);
                    setErrorMsg(null);
                  }}
                  className="inline-flex items-center gap-1 font-semibold text-gray-700 hover:underline cursor-pointer"
                >
                  <svg className="size-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                    <path d="M12.5 15L7.5 10L12.5 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Change number</span>
                </button>

                {countdown > 0 ? (
                  <span>Resend in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    className="font-bold text-brand-600 hover:underline cursor-pointer"
                  >
                    Resend code
                  </button>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading || otpDigits.join("").length < 5}
                className="w-full h-12 sm:h-13 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold tracking-wider uppercase text-white bg-[#3B66FF] hover:bg-[#2753F0] active:scale-[0.99] shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? "Verifying..." : "VERIFY & SIGN IN"}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Registration Link */}
      <div className="mt-6 sm:mt-8 text-center">
        <span className="text-xs sm:text-sm text-gray-500">
          Not registered yet?{" "}
          <Link
            href="/register"
            className="font-bold text-brand-600 hover:underline ml-1"
          >
            Create an account
          </Link>
        </span>
      </div>

      {/* Quick Demo Switcher with Gentle Micro-Interaction */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-gray-400">
            Quick Test Accounts:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DEMO_ACCOUNTS.map((acc) => (
            <motion.button
              key={acc.role}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => handleSelectDemo(acc)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold transition cursor-pointer"
            >
              {acc.label}
            </motion.button>
          ))}
        </div>
      </div>
    </AuthPageLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#071E3D] flex items-center justify-center text-white text-sm">
          Loading sign in...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
