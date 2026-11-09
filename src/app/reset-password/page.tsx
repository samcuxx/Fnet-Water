"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthPageLayout from "@/components/layout/AuthPageLayout";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", ""]);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Reset Password
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {step === 1
            ? "Enter your phone number to receive a verification code."
            : `Enter the 5-digit code sent to ${phone} and choose a new password.`}
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

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
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
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-lg text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs disabled:opacity-50 mt-2"
          >
            {isLoading ? "Sending code..." : "Send Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-5">
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
            <label className="block text-center text-xs font-medium text-gray-700 dark:text-gray-300 mb-2.5">
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

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-11 px-3.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-11 px-3.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300 hover:underline"
            >
              <svg className="size-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M12.5 15L7.5 10L12.5 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Change number</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || otpDigits.join("").length < 5}
            className="w-full h-11 rounded-lg text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 transition shadow-theme-xs disabled:opacity-50"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}

      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-blue-light-400 hover:underline"
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
