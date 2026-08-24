import * as React from "react";

import { cn } from "@/lib/utils/cn";

const FIELD_BASE =
  "w-full rounded-lg border bg-white px-3 text-sm text-slate-900 transition-colors " +
  "placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600/20 " +
  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

function stateClasses(hasError: boolean): string {
  return hasError
    ? "border-danger-500 focus:border-danger-600 focus:ring-danger-500/20"
    : "border-slate-300 focus:border-brand-600";
}

export type InputProps = React.ComponentPropsWithoutRef<"input"> & {
  hasError?: boolean;
};

export function Input({ className, hasError = false, ...props }: InputProps) {
  return (
    <input
      // Surfaces the invalid state to assistive technology, not just visually.
      aria-invalid={hasError || undefined}
      className={cn(FIELD_BASE, "h-10", stateClasses(hasError), className)}
      {...props}
    />
  );
}

export function Textarea({
  className,
  hasError = false,
  rows = 3,
  ...props
}: React.ComponentPropsWithoutRef<"textarea"> & { hasError?: boolean }) {
  return (
    <textarea
      rows={rows}
      aria-invalid={hasError || undefined}
      className={cn(FIELD_BASE, "py-2", stateClasses(hasError), className)}
      {...props}
    />
  );
}

export function Select({
  className,
  hasError = false,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"select"> & { hasError?: boolean }) {
  return (
    <select
      aria-invalid={hasError || undefined}
      className={cn(
        FIELD_BASE,
        "h-10 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%2364748b%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:1.1rem] bg-[right_0.6rem_center] bg-no-repeat pr-9",
        stateClasses(hasError),
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

/**
 * A labelled field wrapper.
 *
 * Always renders a real `<label htmlFor>` and wires `aria-describedby` to the
 * hint and error text, so screen readers announce the reason a field failed.
 */
export function Field({
  id,
  label,
  hint,
  errors,
  required = false,
  className,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  errors?: string[];
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const hasError = Boolean(errors && errors.length > 0);
  const hintId = hint && !hasError ? `${id}-hint` : undefined;
  const errorId = hasError ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  // Injecting aria-describedby here keeps every call site from having to
  // remember the id convention for hint and error text.
  const control =
    describedBy && React.isValidElement(children)
      ? React.cloneElement(
          children as React.ReactElement<{ "aria-describedby"?: string }>,
          { "aria-describedby": describedBy },
        )
      : children;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-danger-600" aria-hidden>
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>

      {control}

      {hint && !hasError && (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      )}

      {hasError && (
        <p id={errorId} className="text-xs font-medium text-danger-600" role="alert">
          {errors![0]}
        </p>
      )}
    </div>
  );
}

export function Checkbox({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"input">) {
  return (
    <input
      type="checkbox"
      className={cn(
        "size-4 rounded border-slate-300 text-brand-600 focus:ring-2 focus:ring-brand-600/30",
        className,
      )}
      {...props}
    />
  );
}
