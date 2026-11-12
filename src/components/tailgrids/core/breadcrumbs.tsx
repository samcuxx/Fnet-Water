import { cn } from "@/utils/cn";
import Link from "next/link";
import React from "react";

type PropsType = {
  items: {
    href?: string;
    label: string;
    icon?: React.ReactNode;
  }[];
  dividerType?: "slash" | "chevron" | "dot";
  activeHref?: string;
  className?: string;
};

export function Breadcrumbs({ items, className, dividerType = "chevron" }: PropsType) {
  return (
    <ol className={cn("flex items-center gap-1.5 sm:gap-2", dividerType === "dot" && "gap-2", className)}>
      {items.map((item, index) => {
        const isLast = index + 1 === items.length;
        const itemClass = cn(
          "flex items-center gap-1 text-xs sm:text-sm font-medium transition-colors hover:text-text-primary [&>svg]:size-4",
          isLast ? "text-text-primary font-semibold pointer-events-none" : "text-text-tertiary",
        );

        return (
          <li key={`${item.label}-${index}`} className="contents text-text-tertiary [&_svg]:text-current">
            {index > 0 && <Divider type={dividerType} />}

            {item.href ? (
              <Link href={item.href} className={itemClass}>
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <span className={itemClass}>
                {item.icon}
                {item.label}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Divider({ type }: { type: PropsType["dividerType"] }) {
  switch (type) {
    case "chevron":
      return (
        <svg
          className="size-3.5 text-text-tertiary"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7.5 4.167L12.5 10l-5 5.833" />
        </svg>
      );

    case "dot":
      return <span className="size-1 rounded-full bg-text-200" />;

    default:
      return <span className="text-text-tertiary">/</span>;
  }
}

export default Breadcrumbs;
