import React from "react";
import clsx from "clsx";

export function Card(props: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-xl border border-gray-200 bg-white shadow-soft", props.className)}>
      {props.children}
    </div>
  );
}

