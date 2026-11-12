import * as React from "react";
import { cn } from "@/lib/utils";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-xs sm:text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "border-b border-border bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground [&_tr]:border-b",
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "divide-y divide-border bg-card text-card-foreground [&_tr:last-child]:border-0",
      className
    )}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-border bg-muted/50 font-medium text-muted-foreground [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  isHeader?: boolean;
  align?: "left" | "center" | "right";
  nowrap?: boolean;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, align = "left", nowrap = false, ...props }, ref) => {
    const alignClass =
      align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
    const nowrapClass = nowrap ? "whitespace-nowrap" : "";

    return (
      <th
        ref={ref}
        className={cn(
          "h-10 px-3.5 py-3 text-xs font-semibold text-muted-foreground align-middle [&:has([role=checkbox])]:pr-0",
          alignClass,
          nowrapClass,
          className
        )}
        {...props}
      />
    );
  }
);
TableHead.displayName = "TableHead";

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  isHeader?: boolean;
  align?: "left" | "center" | "right";
  nowrap?: boolean;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, isHeader = false, align = "left", nowrap = false, children, ...props }, ref) => {
    const alignClass =
      align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
    const nowrapClass = nowrap ? "whitespace-nowrap" : "";

    if (isHeader) {
      return (
        <th
          ref={ref as any}
          className={cn(
            "px-3.5 py-3 text-xs font-semibold text-muted-foreground",
            alignClass,
            nowrapClass,
            className
          )}
          {...props}
        >
          {children}
        </th>
      );
    }

    return (
      <td
        ref={ref}
        className={cn(
          "px-3.5 py-3 text-xs sm:text-sm text-foreground align-middle [&:has([role=checkbox])]:pr-0",
          alignClass,
          nowrapClass,
          className
        )}
        {...props}
      >
        {children}
      </td>
    );
  }
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-xs text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
