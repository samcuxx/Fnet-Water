"use client";

import { cn } from "@/utils/cn";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";

export function SheetOverlay({
  isOpen,
  onOpenChange,
  children,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <AnimatePresence>{isOpen && children}</AnimatePresence>
    </DialogPrimitive.Root>
  );
}

export function SheetContent({
  side = "left",
  showCloseButton = false,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  side?: "left" | "right" | "top" | "bottom";
  showCloseButton?: boolean;
}) {
  const isLeft = side === "left";
  const initialX = isLeft ? "-100%" : side === "right" ? "100%" : 0;
  const initialY = side === "top" ? "-100%" : side === "bottom" ? "100%" : 0;

  return (
    <DialogPrimitive.Portal forceMount>
      <DialogPrimitive.Overlay asChild forceMount>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
        />
      </DialogPrimitive.Overlay>
      <DialogPrimitive.Content asChild forceMount {...props}>
        <motion.div
          initial={{ x: initialX, y: initialY }}
          animate={{ x: 0, y: 0 }}
          exit={{ x: initialX, y: initialY }}
          transition={{
            type: "spring",
            damping: 32,
            stiffness: 340,
            mass: 0.8,
          }}
          className={cn(
            "fixed top-0 bottom-0 z-50 h-full w-67.5 max-w-full bg-card-surface-area shadow-2xl focus:outline-none",
            side === "left" && "left-0",
            side === "right" && "right-0",
            side === "top" && "top-0 left-0 right-0 h-auto",
            side === "bottom" && "bottom-0 left-0 right-0 h-auto",
            className,
          )}
        >
          {children}
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

