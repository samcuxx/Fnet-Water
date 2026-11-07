import React, { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
}

interface TableCellProps {
  children?: ReactNode;
  isHeader?: boolean;
  className?: string;
  align?: "left" | "center" | "right";
}

const Table: React.FC<TableProps> = ({ children, className = "" }) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className={`min-w-full text-left text-sm text-gray-700 dark:text-gray-300 ${className}`}>
        {children}
      </table>
    </div>
  );
};

const TableHeader: React.FC<TableHeaderProps> = ({ children, className = "" }) => {
  return (
    <thead
      className={`border-b border-gray-200 dark:border-gray-800 bg-gray-50/75 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${className}`}
    >
      {children}
    </thead>
  );
};

const TableBody: React.FC<TableBodyProps> = ({ children, className = "" }) => {
  return (
    <tbody
      className={`divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900 ${className}`}
    >
      {children}
    </tbody>
  );
};

const TableRow: React.FC<TableRowProps> = ({ children, className = "" }) => {
  return (
    <tr
      className={`hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors ${className}`}
    >
      {children}
    </tr>
  );
};

const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className = "",
  align = "left",
}) => {
  const alignClass =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  if (isHeader) {
    return (
      <th
        scope="col"
        className={`px-4 py-3 sm:px-6 sm:py-3.5 text-xs font-semibold text-gray-600 dark:text-gray-300 ${alignClass} ${className}`}
      >
        {children}
      </th>
    );
  }

  return (
    <td
      className={`px-4 py-3.5 sm:px-6 sm:py-4 text-xs sm:text-sm whitespace-nowrap ${alignClass} ${className}`}
    >
      {children}
    </td>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
