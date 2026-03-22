import React from "react";
import clsx from "clsx";

export function Badge(props: {
  children: React.ReactNode;
  tone?: "green" | "amber" | "rose" | "neutral";
  className?: string;
}) {
  const tone = props.tone ?? "neutral";
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tone === "green" && "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100",
        tone === "amber" && "bg-amber-50 text-amber-800 ring-1 ring-amber-100",
        tone === "rose" && "bg-rose-50 text-rose-800 ring-1 ring-rose-100",
        tone === "neutral" && "bg-gray-50 text-gray-700 ring-1 ring-gray-100",
        props.className
      )}
    >
      {props.children}
    </span>
  );
}

