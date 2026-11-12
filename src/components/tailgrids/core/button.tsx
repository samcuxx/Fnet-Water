"use client";

import { cn } from "@/utils/cn";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export const buttonStyles = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-brand-600 focus-visible:ring-primary",
        danger: "bg-destructive text-white hover:bg-red-700 focus-visible:ring-destructive",
        success: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600",
        ghost: "bg-transparent text-text-secondary hover:bg-background-gray-primary hover:text-text-primary",
        outline: "border border-card-border bg-card-background text-text-primary hover:bg-background-gray-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
      appearance: {
        fill: "",
        outline: "border border-card-border bg-card-background text-text-primary hover:bg-background-gray-primary",
        ghost: "border-transparent bg-transparent text-text-secondary hover:bg-background-gray-primary hover:text-text-primary",
      },
      size: {
        xs: "h-7 px-2.5 text-xs [&>svg]:size-3.5",
        sm: "h-8 px-3 text-xs [&>svg]:size-4",
        md: "h-9 px-4 text-sm [&>svg]:size-4.5",
        lg: "h-10 px-5 text-sm [&>svg]:size-5",
        xl: "h-11 px-6 text-base [&>svg]:size-5.5",
      },
      iconOnly: {
        true: "p-0 aspect-square",
        false: "",
      },
    },
    compoundVariants: [
      {
        iconOnly: true,
        size: "xs",
        className: "w-7 h-7",
      },
      {
        iconOnly: true,
        size: "sm",
        className: "w-8 h-8",
      },
      {
        iconOnly: true,
        size: "md",
        className: "w-9 h-9",
      },
      {
        iconOnly: true,
        size: "lg",
        className: "w-10 h-10",
      },
      {
        appearance: "outline",
        variant: "primary",
        className: "border-primary text-primary bg-transparent hover:bg-primary/5",
      },
    ],
    defaultVariants: {
      variant: "primary",
      appearance: "fill",
      size: "md",
      iconOnly: false,
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  children?: ReactNode;
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  appearance,
  size,
  iconOnly,
  children,
  type = "button",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type={asChild ? undefined : type}
      className={cn(buttonStyles({ variant, appearance, size, iconOnly }), className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
