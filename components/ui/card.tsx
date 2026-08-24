import * as React from "react";

import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-card border border-slate-200/70 bg-white shadow-card",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  as: Component = "h2",
  ...props
}: React.ComponentPropsWithoutRef<"h2"> & { as?: "h1" | "h2" | "h3" | "h4" }) {
  return (
    <Component
      className={cn("text-base font-semibold text-slate-900", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  return (
    <p className={cn("text-sm text-slate-500", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 border-t border-slate-100 px-5 py-3",
        className,
      )}
      {...props}
    />
  );
}
