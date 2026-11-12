import React from "react";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  success?: boolean;
  hint?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  id,
  name,
  placeholder,
  value,
  onChange,
  rows = 3,
  disabled = false,
  error = false,
  success = false,
  hint,
  className = "",
  ...props
}) => {
  let textareaClasses = `w-full rounded-lg border appearance-none px-3.5 py-2.5 text-xs sm:text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-2 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500 transition-colors ${className}`;

  if (disabled) {
    textareaClasses += ` text-gray-500 border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60`;
  } else if (error) {
    textareaClasses += ` border-error-500 focus:border-error-500 focus:ring-error-500/20 text-error-900 dark:text-error-400`;
  } else if (success) {
    textareaClasses += ` border-success-500 focus:border-success-500 focus:ring-success-500/20 text-success-900 dark:text-success-400`;
  } else {
    textareaClasses += ` bg-white dark:bg-gray-900 text-gray-800 border-gray-300 dark:border-gray-700 focus:border-brand-500 focus:ring-brand-500/20 dark:focus:border-brand-400`;
  }

  return (
    <div className="relative w-full">
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        disabled={disabled}
        className={textareaClasses}
        {...props}
      />
      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
              ? "text-success-500"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default TextArea;
