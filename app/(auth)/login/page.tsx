import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in · F Net Water Hub",
  description: "Sign in to manage your water orders, deliveries and payments.",
};

export default async function LoginPage(props: PageProps<"/login">) {
  // searchParams is a Promise in Next.js 16.
  const { next } = await props.searchParams;
  const redirectTo = typeof next === "string" ? next : undefined;

  return (
    <div className="space-y-8">
      <header className="border-b border-slate-200 pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0056D2]">
          Welcome back
        </p>
        <h1 className="mt-3 text-[1.75rem] font-bold tracking-tight text-[#0A1931] sm:text-[2rem]">
          Sign in
        </h1>
        <div className="mt-5 h-px w-12 bg-[#0056D2]/40" aria-hidden />
        <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-600">
          Access your F Net Water Hub account to manage orders, deliveries and
          payments.
        </p>
      </header>

      <LoginForm next={redirectTo} />
    </div>
  );
}
