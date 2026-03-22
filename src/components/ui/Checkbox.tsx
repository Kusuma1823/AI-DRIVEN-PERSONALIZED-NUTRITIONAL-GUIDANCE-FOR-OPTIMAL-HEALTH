import React from "react";
import clsx from "clsx";

export function Checkbox(props: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label className={clsx("flex cursor-pointer items-start gap-3 rounded-xl border border-gray-100 bg-white p-3 transition hover:bg-gray-50", props.disabled && "cursor-not-allowed opacity-60")}>
      <input
        type="checkbox"
        checked={props.checked}
        disabled={props.disabled}
        onChange={(e) => props.onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-chai-100"
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-ink-900">{props.label}</span>
        {props.description ? <span className="block mt-0.5 text-xs text-gray-600">{props.description}</span> : null}
      </span>
    </label>
  );
}

