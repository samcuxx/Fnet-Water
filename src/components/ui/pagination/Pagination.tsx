import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className={`flex items-center justify-between border-t border-gray-200 dark:border-gray-800 px-4 py-3 sm:px-6 ${className}`}
      aria-label="Pagination"
    >
      <div className="flex flex-1 justify-between sm:justify-end gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-2xl border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-800 px-3.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
        >
          Previous
        </button>

        <div className="hidden sm:flex items-center gap-1.5">
          {pages.map((p) => {
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`relative inline-flex items-center justify-center size-8 rounded-2xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? "bg-brand-500 text-white font-bold shadow-xs"
                    : "border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-2xs"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center rounded-2xl border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-800 px-3.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-2xs cursor-pointer"
        >
          Next
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
