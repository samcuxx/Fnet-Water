"use client";

import { cn } from "@/utils/cn";
import { StatCardBeam } from "@/components/ui/stat-card-beam";
import type { ComponentProps } from "react";

export interface CardProps extends ComponentProps<"div"> {
  beamIndex?: number;
  beam?: boolean | number;
}

export function Card({ children, className, beam, beamIndex, ...props }: CardProps) {
  const showBeam = beam !== undefined || beamIndex !== undefined;
  const activeIndex = beamIndex ?? (typeof beam === "number" ? beam : 0);

  return (
    <div
      className={cn(
        "rounded-xl border-[0.5px] border-card-border bg-card-background p-3.5 sm:p-5",
        showBeam && "relative overflow-hidden",
        className,
      )}
      {...props}
    >
      {showBeam && <StatCardBeam index={activeIndex} />}
      <div className={cn(showBeam && "relative z-10 w-full")}>{children}</div>
    </div>
  );
}

export function CardHeader({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("relative flex w-full flex-wrap items-center justify-between gap-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      className={cn("leading-6 font-semibold tracking-[-0.2px] text-text-primary", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("mt-0.5 text-sm leading-5 tracking-[-0.2px] text-text-secondary", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardAction({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("absolute top-5 right-5 text-text-tertiary", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("p-0 text-text-primary", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("mt-4 flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
}
