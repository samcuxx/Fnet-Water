import React from "react";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
  spacing?: boolean;
  action?: React.ReactNode;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  spacing = true,
  action,
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      {/* Card Header */}
      <div className="px-6 py-4.5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
            {title}
          </h3>
          {desc && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {desc}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-6">
        <div className={spacing ? "space-y-4" : ""}>{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
export { ComponentCard };
