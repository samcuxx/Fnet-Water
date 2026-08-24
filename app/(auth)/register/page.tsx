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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Order water, track deliveries and manage payments in one place.
        </p>
      </div>

      <RegisterForm referralCode={referralCode} />
    </div>
  );
}
