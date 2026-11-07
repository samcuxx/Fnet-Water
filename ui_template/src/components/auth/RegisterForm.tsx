import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

export default function RegisterForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Define explicit criteria for the password
  const criteria = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special symbol", met: /[^A-Za-z0-9]/.test(password) },
  ];

  // Count how many criteria are currently achieved
  const metCount = criteria.filter((c) => c.met).length;
  const allCriteriaMet = metCount === criteria.length;
  const passwordsMatch = password === confirmPassword;

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Back to home
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign up!
            </p>
          </div>
          <div>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-5">
                
                {/* Email */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                  />
                </div>
                
                {/* Password */}
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                  
                  {/* Visual Indicator Pills */}
                  <div className="flex gap-2 mt-3">
                    {criteria.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 flex-1 rounded-lg transition-all duration-300 border ${
                          index < metCount
                            ? "bg-success-500 border-success-500 dark:bg-success-500 dark:border-success-500"
                            : "bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Requirements Text Guide Below the Pills */}
                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Password requirements:
                    </p>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-400 dark:text-gray-500">
                      {criteria.map((criterion, index) => (
                        <li 
                          key={index} 
                          className={`flex items-center gap-2 transition-colors duration-200 ${
                            criterion.met ? "text-gray-800 dark:text-white/90 font-medium" : ""
                          }`}
                        >
                          <span className={`text-[10px] leading-none ${criterion.met ? "text-success-500" : "text-gray-300 dark:text-gray-700"}`}>
                            {criterion.met ? "✓" : "•"}
                          </span>
                          {criterion.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <Label>
                    Confirm Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Re-type your password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p className="mt-1 text-xs font-medium text-error-500">
                      Passwords do not match.
                    </p>
                  )}
                </div>

                {/* Checkbox & Shrunk Consent Text */}
                <div className="flex items-start gap-2.5">
                  <Checkbox
                    className="mt-0.5 w-4 h-4 shrink-0"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="text-xs font-normal leading-normal text-gray-500 dark:text-gray-400">
                    By creating an account means you agree to the{" "}
                    <span className="font-medium text-gray-800 dark:text-white/90">
                      Terms and Conditions,
                    </span>{" "}
                    and our{" "}
                    <span className="font-medium text-gray-800 dark:text-white">
                      Privacy Policy
                    </span>
                  </p>
                </div>
                
                {/* Button */}
                <div>
                  <button 
                    disabled={!allCriteriaMet || !passwordsMatch}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Already have an account? {""}
                <Link
                  to="/login"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}