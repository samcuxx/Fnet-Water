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
  let textareaClasses = `w-full rounded-lg border appearance-none px-3.5 py-2.5 text-xs sm:text-sm shadow-theme-xs placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 transition-colors ${className}`;

  if (disabled) {
    textareaClasses += ` text-muted-foreground border-border bg-muted cursor-not-allowed opacity-60`;
  } else if (error) {
    textareaClasses += ` border-destructive focus:border-destructive focus:ring-destructive/20 text-destructive`;
  } else if (success) {
    textareaClasses += ` border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20 text-emerald-600 dark:text-emerald-400`;
  } else {
    textareaClasses += ` bg-background text-foreground border-input focus:border-ring focus:ring-ring/20`;
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
              ? "text-destructive"
              : success
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default TextArea;
