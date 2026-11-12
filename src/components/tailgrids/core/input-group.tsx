"use client";

import { cn } from "@/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, InputHTMLAttributes } from "react";
import { Input, type InputProps } from "./input";

export interface InputGroupProps extends ComponentProps<"div"> {}

export function InputGroup({ className, ...props }: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group flex w-full items-center rounded-lg border border-card-border bg-input-background transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
        className,
      )}
      {...props}
    />
  );
}

export interface InputGroupInputProps extends InputProps {}

export function InputGroupInput({ className, ...props }: InputGroupInputProps) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "w-full min-w-0 flex-1 rounded-none border-none bg-transparent px-2.5 py-1.5 shadow-none focus-visible:ring-0 focus-visible:border-transparent text-sm",
        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonStyles = cva(
  "flex shrink-0 items-center justify-center px-3 text-sm text-text-tertiary",
  {
    variants: {
      align: {
        "inline-start": "order-first",
        "inline-end": "order-last",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
);

export interface InputGroupAddonProps
  extends ComponentProps<"div">,
    VariantProps<typeof inputGroupAddonStyles> {}

export function InputGroupAddon({ className, align, ...props }: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn(inputGroupAddonStyles({ align }), className)}
      {...props}
    />
  );
}
