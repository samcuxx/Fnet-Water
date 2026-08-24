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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to your F Net Water Hub account.
        </p>
      </div>

      <LoginForm next={redirectTo} />
    </div>
  );
}
