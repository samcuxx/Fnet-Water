"use client";

import { cn } from "@/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import React, { createContext, useContext, useState } from "react";

interface CollapsibleGroupContextType {
  expandedKeys: Set<string>;
  toggleKey: (key: string) => void;
}

const CollapsibleGroupContext = createContext<CollapsibleGroupContextType | null>(null);

export function CollapsibleGroup({
  children,
  expandedKeys: controlledKeys,
  onExpandedChange,
}: {
  children: React.ReactNode;
  expandedKeys?: Set<string | any>;
  onExpandedChange?: (keys: Set<any>) => void;
}) {
  const [uncontrolledKeys, setUncontrolledKeys] = useState<Set<string>>(new Set());
  const activeKeys = (controlledKeys as Set<string>) ?? uncontrolledKeys;

  const toggleKey = (key: string) => {
    const next = new Set(activeKeys);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    if (onExpandedChange) {
      onExpandedChange(next);
    } else {
      setUncontrolledKeys(next);
    }
  };

  return (
    <CollapsibleGroupContext.Provider value={{ expandedKeys: activeKeys, toggleKey }}>
      {children}
    </CollapsibleGroupContext.Provider>
  );
}

interface CollapsibleContextType {
  isExpanded: boolean;
  toggle: () => void;
}

const CollapsibleContext = createContext<CollapsibleContextType>({
  isExpanded: false,
  toggle: () => {},
});

export function Collapsible({
  id,
  children,
  className,
  defaultOpen = false,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  const group = useContext(CollapsibleGroupContext);
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const isExpanded = id && group ? group.expandedKeys.has(id) : isOpen;
  const toggle = () => {
    if (id && group) {
      group.toggleKey(id);
    } else {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <CollapsibleContext.Provider value={{ isExpanded, toggle }}>
      <div
        data-expanded={isExpanded ? "" : undefined}
        className={cn("group/collapsible", className)}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

export function CollapsibleTrigger({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggle, isExpanded } = useContext(CollapsibleContext);
  return (
    <button
      type="button"
      onClick={toggle}
      data-expanded={isExpanded ? "" : undefined}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function CollapsibleContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { isExpanded } = useContext(CollapsibleContext);

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          key="collapsible-content"
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: "auto",
            opacity: 1,
            transition: {
              height: { duration: 0.25, ease: [0.04, 0.62, 0.23, 0.98] },
              opacity: { duration: 0.2, delay: 0.05 },
            },
          }}
          exit={{
            height: 0,
            opacity: 0,
            transition: {
              height: { duration: 0.2, ease: [0.04, 0.62, 0.23, 0.98] },
              opacity: { duration: 0.15 },
            },
          }}
          data-expanded=""
          className={cn("overflow-hidden", className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
