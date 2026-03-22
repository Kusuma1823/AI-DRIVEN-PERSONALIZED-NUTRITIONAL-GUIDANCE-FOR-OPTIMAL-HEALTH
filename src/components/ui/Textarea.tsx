import React from "react";
import clsx from "clsx";

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string; hint?: string }) {
  const { label, error, hint, className, id, ...rest } = props;
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        {...rest}
        className={clsx(
          "min-h-[120px] w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-ink-900 shadow-sm outline-none transition",
          "focus:border-chai-100 focus:ring-2 focus:ring-chai-50",
          error && "border-rose-300 focus:border-rose-400 focus:ring-rose-200",
          className
        )}
      />
      {error ? <div className="text-xs text-rose-700">{error}</div> : null}
      {hint && !error ? <div className="text-xs text-gray-500">{hint}</div> : null}
    </div>
  );
}

