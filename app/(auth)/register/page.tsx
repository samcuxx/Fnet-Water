import type { Metadata } from "next";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create an account · F Net Water Hub",
  description:
    "Register as an F Net Water Hub customer to order water, track deliveries and earn rewards.",
};

export default async function RegisterPage(props: PageProps<"/register">) {
  // `ref` lets a referral link pre-fill the code: /register?ref=FNW-ABC123
  const { ref } = await props.searchParams;
  const referralCode = typeof ref === "string" ? ref.toUpperCase() : undefined;

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-200 pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0056D2]">
          Join us
        </p>
        <h1 className="mt-3 text-[1.75rem] font-bold tracking-tight text-[#0A1931] sm:text-[2rem]">
          Create your account
        </h1>
        <div className="mt-5 h-px w-12 bg-[#0056D2]/40" aria-hidden />
        <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-600">
          Register as a customer to order water, track deliveries and manage
          payments — all in one place.
        </p>
      </header>

      <RegisterForm referralCode={referralCode} />
    </div>
  );
}
