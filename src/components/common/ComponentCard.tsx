"use client";

import React from "react";
import { motion } from "framer-motion";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
  spacing?: boolean;
  action?: React.ReactNode;
  hoverable?: boolean;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  spacing = true,
  action,
  hoverable = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={
        hoverable
          ? { y: -3, transition: { duration: 0.2, ease: "easeOut" } }
          : undefined
      }
      className={`rounded-xl border border-border bg-card text-card-foreground shadow-xs overflow-hidden transition-shadow ${className}`}
    >
      {/* Card Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-border">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-card-foreground">
            {title}
          </h3>
          {desc && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {desc}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6">
        <div className={spacing ? "space-y-4" : ""}>{children}</div>
      </div>
    </motion.div>
  );
};

export default ComponentCard;
export { ComponentCard };
