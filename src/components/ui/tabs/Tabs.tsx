"use client";

import React, { useState } from "react";

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  activeTab: controlledActiveTab,
  onChange,
  className = "",
}) => {
  const [internalTab, setInternalTab] = useState(defaultTab || tabs[0]?.id || "");
  const currentTab = controlledActiveTab !== undefined ? controlledActiveTab : internalTab;

  const handleSelect = (id: string) => {
    if (controlledActiveTab === undefined) {
      setInternalTab(id);
    }
    onChange?.(id);
  };

  return (
    <div className={`border-b border-gray-200 dark:border-gray-800 ${className}`}>
      <nav className="flex space-x-6 -mb-px" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`inline-flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.icon && <span className="inline-flex shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;
