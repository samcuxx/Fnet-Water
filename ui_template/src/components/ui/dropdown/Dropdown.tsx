import type React from "react";
import { useEffect, useRef } from "react";
import { cn } from "../../../utils";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element | null;

      if (!target) return;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        !target.closest(".dropdown-toggle") &&
        !target.closest(".mobile-dropdown-sheet") 
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={cn(
        "absolute z-40 right-0 mt-2 rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark",
        className
      )}
    >
      {children}
    </div>
  );
};
