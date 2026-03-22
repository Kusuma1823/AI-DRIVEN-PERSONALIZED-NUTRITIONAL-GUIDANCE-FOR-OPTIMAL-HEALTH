import React from "react";
import clsx from "clsx";

export function ProgressBar(props: { value: number; tone?: "green" | "amber" | "rose" | "neutral" }) {
  const { value, tone = "neutral" } = props;
  const v = Math.max(0, Math.min(100, value));

  const barClass =
    tone === "green"
      ? "bg-emerald-500"
      : tone === "amber"
        ? "bg-amber-500"
        : tone === "rose"
          ? "bg-rose-500"
          : "bg-gray-500";

  const bgClass =
    tone === "green"
      ? "bg-emerald-50"
      : tone === "amber"
        ? "bg-amber-50"
        : tone === "rose"
          ? "bg-rose-50"
          : "bg-gray-100";

  return (
    <div className={clsx("h-2 w-full overflow-hidden rounded-full", bgClass)}>
      <div className={clsx("h-2 rounded-full transition-all duration-500", barClass)} style={{ width: `${v}%` }} />
    </div>
  );
}

