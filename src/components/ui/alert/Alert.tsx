import React from "react";
import Link from "next/link";

interface AlertProps {
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  showLink?: boolean;
  linkHref?: string;
  linkText?: string;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  variant,
  title,
  message,
  showLink = false,
  linkHref = "#",
  linkText = "Learn more",
  className = "",
}) => {
  const variantClasses = {
    success: {
      container:
        "border-success-500/30 bg-success-50 dark:border-success-500/30 dark:bg-success-500/10 text-success-900 dark:text-success-200",
      icon: "text-success-600 dark:text-success-400",
      title: "text-success-900 dark:text-success-200",
      message: "text-success-700 dark:text-success-300",
      link: "text-success-700 dark:text-success-300 underline font-semibold",
    },
    error: {
      container:
        "border-error-500/30 bg-error-50 dark:border-error-500/30 dark:bg-error-500/10 text-error-900 dark:text-error-200",
      icon: "text-error-600 dark:text-error-400",
      title: "text-error-900 dark:text-error-200",
      message: "text-error-700 dark:text-error-300",
      link: "text-error-700 dark:text-error-300 underline font-semibold",
    },
    warning: {
      container:
        "border-warning-500/30 bg-warning-50 dark:border-warning-500/30 dark:bg-warning-500/10 text-warning-900 dark:text-warning-200",
      icon: "text-warning-600 dark:text-warning-400",
      title: "text-warning-900 dark:text-warning-200",
      message: "text-warning-700 dark:text-warning-300",
      link: "text-warning-700 dark:text-warning-300 underline font-semibold",
    },
    info: {
      container:
        "border-blue-light-500/30 bg-blue-light-50 dark:border-blue-light-500/30 dark:bg-blue-light-500/10 text-blue-light-900 dark:text-blue-light-200",
      icon: "text-blue-light-600 dark:text-blue-light-400",
      title: "text-blue-light-900 dark:text-blue-light-200",
      message: "text-blue-light-700 dark:text-blue-light-300",
      link: "text-blue-light-700 dark:text-blue-light-300 underline font-semibold",
    },
  };

  const currentVariant = variantClasses[variant];

  return (
    <div
      className={`rounded-2xl border p-4 flex items-start gap-3.5 ${currentVariant.container} ${className}`}
      role="alert"
    >
      <div className={`shrink-0 mt-0.5 ${currentVariant.icon}`}>
        {variant === "success" && (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {variant === "error" && (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {variant === "warning" && (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {variant === "info" && (
          <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>

      <div className="flex-1">
        <h4 className={`text-xs font-semibold ${currentVariant.title}`}>{title}</h4>
        <p className={`mt-0.5 text-xs leading-normal ${currentVariant.message}`}>
          {message}
          {showLink && (
            <Link href={linkHref} className={`ml-1.5 ${currentVariant.link}`}>
              {linkText}
            </Link>
          )}
        </p>
      </div>
    </div>
  );
};

export default Alert;
export { Alert };
