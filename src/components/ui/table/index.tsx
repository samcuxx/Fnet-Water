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
  nowrap?: boolean;
}

const Table: React.FC<TableProps> = ({ children, className = "" }) => {
  return (
    <div className="w-full overflow-hidden">
      <table className={`w-full text-left text-xs sm:text-sm text-gray-700 dark:text-gray-300 table-auto ${className}`}>
        {children}
      </table>
    </div>
  );
};

const TableHeader: React.FC<TableHeaderProps> = ({ children, className = "" }) => {
  return (
    <thead
      className={`border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${className}`}
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
      className={`hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors ${className}`}
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
  nowrap = false,
}) => {
  const alignClass =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  const nowrapClass = nowrap ? "whitespace-nowrap" : "";

  if (isHeader) {
    return (
      <th
        scope="col"
        className={`px-3.5 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 ${alignClass} ${nowrapClass} ${className}`}
      >
        {children}
      </th>
    );
  }

  return (
    <td
      className={`px-3.5 py-3 text-xs sm:text-sm text-gray-800 dark:text-gray-200 ${alignClass} ${nowrapClass} ${className}`}
    >
      {children}
    </td>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
