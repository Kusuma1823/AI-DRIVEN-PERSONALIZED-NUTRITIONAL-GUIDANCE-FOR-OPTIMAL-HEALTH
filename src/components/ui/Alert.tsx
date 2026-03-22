import React from "react";
import clsx from "clsx";

export function Alert(props: {
  tone?: "green" | "amber" | "rose" | "neutral";
  title?: string;
  children: React.ReactNode;
}) {
  const tone = props.tone ?? "neutral";
  return (
    <div
      className={clsx(
        "rounded-xl border p-4 text-sm shadow-sm",
        tone === "green" && "border-emerald-200 bg-emerald-50",
        tone === "amber" && "border-amber-200 bg-amber-50",
        tone === "rose" && "border-rose-200 bg-rose-50",
        tone === "neutral" && "border-gray-200 bg-white"
      )}
      role="alert"
    >
      {props.title ? <div className="font-semibold">{props.title}</div> : null}
      <div className={clsx(props.title ? "mt-1" : "")}>{props.children}</div>
    </div>
  );
}

