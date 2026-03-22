import React from "react";
import clsx from "clsx";

export function Button(props: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const { children, onClick, type = "button", disabled, variant = "primary", className } = props;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-bold transition-all duration-200 transform hover:scale-105 active:scale-95",
        variant === "primary" &&
          "bg-chai-100 text-white shadow-md hover:shadow-lg hover:bg-chai-200 disabled:bg-gray-400 disabled:text-gray-100 disabled:shadow-none disabled:scale-100",
        variant === "secondary" &&
          "bg-white text-ink-900 border-2 border-chai-100 hover:bg-chai-50 hover:border-chai-200 disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-300 disabled:scale-100",
        "focus:outline-none focus:ring-2 focus:ring-chai-100 focus:ring-offset-2",
        className
      )}
    >
      {children}
    </button>
  );
}

