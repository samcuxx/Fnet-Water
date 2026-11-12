import React from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

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
      className={`rounded-lg border p-4 flex items-start gap-3.5 ${currentVariant.container} ${className}`}
      role="alert"
    >
      <div className={`shrink-0 mt-0.5 ${currentVariant.icon}`}>
        {variant === "success" && <CheckCircle2 className="size-5" />}
        {variant === "error" && <XCircle className="size-5" />}
        {variant === "warning" && <AlertTriangle className="size-5" />}
        {variant === "info" && <Info className="size-5" />}
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
