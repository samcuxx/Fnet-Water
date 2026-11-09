"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AuthPageLayout from "@/components/layout/AuthPageLayout";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", ""]);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 2 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!phone.trim()) {
      setErrorMsg("Please enter your registered phone number.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Could not dispatch reset code.");
        setIsLoading(false);
        return;
      }

      setStep(2);
      setSuccessMsg(`Verification code sent to ${data.phone}.`);
      if (data.devOtp) setDevOtp(data.devOtp);
      setOtpDigits(["", "", "", "", ""]);
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  // Step 2: Verify & Update
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const fullCode = otpDigits.join("");
    if (fullCode.length < 5) {
      setErrorMsg("Please enter the complete 5-digit verification code.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const verifyRes = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), otpCode: fullCode }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.verified) {
        setErrorMsg(verifyData.message || "Invalid or expired verification code.");
        setIsLoading(false);
        return;
      }

      setSuccessMsg("Password reset successfully. Redirecting to sign in...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setErrorMsg("Error resetting password.");
      setIsLoading(false);
    }
  };

  return (
    <AuthPageLayout>
      <motion.div
        key={step === 1 ? "title-step-1" : "title-step-2"}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-6 sm:mb-8 text-left"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          {step === 1 ? "Reset Password" : "Create New Password"}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-gray-500">
          {step === 1
            ? "Enter your phone number to receive a verification code."
            : `Enter the 5-digit code sent to ${phone} and choose a new password.`}
        </p>
      </motion.div>

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

      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-5"
          >
            <div className="p-3.5 rounded-2xl text-xs bg-green-50 border border-green-200 text-green-700 font-medium">
              {successMsg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="reset-step-1"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="024 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 sm:h-12 px-4 rounded-xl sm:rounded-2xl bg-[#F6F8FC] border border-gray-200/90 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#3B66FF] focus:ring-4 focus:ring-[#3B66FF]/10 transition-all outline-hidden"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-[#3B66FF] hover:bg-[#2F54DB] active:scale-[0.99] transition shadow-md shadow-[#3B66FF]/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? "Sending code..." : "Send Verification Code"}
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="reset-step-2"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <form onSubmit={handleResetPassword} className="space-y-4">
              {devOtp && (
                <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between text-xs">
                  <span className="text-blue-700">
                    Test Code: <strong className="font-mono font-bold">{devOtp}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpDigits(devOtp.split(""))}
                    className="text-[11px] font-bold text-[#3B66FF] hover:underline cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <div>
                <label className="block text-center text-xs font-semibold text-gray-600 mb-2">
                  Type your 5-digit verification code
                </label>
                <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
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
                      className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl sm:rounded-2xl border border-gray-200 bg-[#F6F8FC] text-gray-900 focus:outline-hidden focus:border-[#3B66FF] focus:bg-white focus:ring-4 focus:ring-[#3B66FF]/15 transition-all shadow-inner"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 sm:h-12 pl-4 pr-11 rounded-xl sm:rounded-2xl bg-[#F6F8FC] border border-gray-200/90 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#3B66FF] focus:ring-4 focus:ring-[#3B66FF]/10 transition-all outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 sm:h-12 pl-4 pr-11 rounded-xl sm:rounded-2xl bg-[#F6F8FC] border border-gray-200/90 text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#3B66FF] focus:ring-4 focus:ring-[#3B66FF]/10 transition-all outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition p-1"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#3B66FF] transition cursor-pointer"
                >
                  <svg className="size-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                    <path d="M12.5 15L7.5 10L12.5 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Change phone number</span>
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading || otpDigits.join("").length < 5}
                className="w-full h-11 sm:h-12 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-[#3B66FF] hover:bg-[#2F54DB] active:scale-[0.99] transition shadow-md shadow-[#3B66FF]/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? "Updating..." : "Update Password"}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3B66FF] hover:underline"
        >
          <svg className="size-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path d="M12.5 15L7.5 10L12.5 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back to Sign In</span>
        </Link>
      </div>
    </AuthPageLayout>
  );
}
