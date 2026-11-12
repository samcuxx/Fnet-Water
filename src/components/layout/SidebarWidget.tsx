import React from "react";

export const SidebarWidget: React.FC = () => {
  return (
    <div className="mx-3 mt-auto mb-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-3.5 text-xs">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-semibold text-gray-800 dark:text-gray-200">
          Support & Refills
        </span>
        <span className="text-[10px] font-bold text-brand-600 dark:text-blue-light-400">
          Ghana
        </span>
      </div>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
        Need emergency bulk water or bottle exchange support?
      </p>
      <div className="mt-2 text-[11px] font-semibold text-brand-600 dark:text-sky-400">
        0244 95 05 05 / 0550 222 888
      </div>
    </div>
  );
};

export default SidebarWidget;
