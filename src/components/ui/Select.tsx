import React from "react";
import clsx from "clsx";

export function Select(props: {
  label?: string;
  hint?: string;
  error?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  id?: string;
  className?: string;
}) {
  const { label, hint, error, options, value, onChange, id, className } = props;
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      ) : null}
      <select
        id={inputId}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        className={clsx(
          "w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-ink-900 shadow-sm outline-none transition",
          "focus:border-chai-100 focus:ring-2 focus:ring-chai-50",
          error && "border-rose-300 focus:border-rose-400 focus:ring-rose-200",
          className
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <div className="text-xs text-rose-700">{error}</div> : null}
      {hint && !error ? <div className="text-xs text-gray-500">{hint}</div> : null}
    </div>
  );
}

