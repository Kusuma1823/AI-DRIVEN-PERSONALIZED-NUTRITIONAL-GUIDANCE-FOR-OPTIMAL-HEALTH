import React from "react";
import clsx from "clsx";

export function Chip(props: {
  children: React.ReactNode;
  tone?: "green" | "amber" | "rose" | "neutral";
  className?: string;
}) {
  const tone = props.tone ?? "neutral";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition",
        tone === "green" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        tone === "amber" && "border-amber-200 bg-amber-50 text-amber-800",
        tone === "rose" && "border-rose-200 bg-rose-50 text-rose-800",
        tone === "neutral" && "border-gray-200 bg-gray-50 text-gray-700",
        props.className
      )}
    >
      {props.children}
    </span>
  );
}

