import React, { useEffect } from "react";
import clsx from "clsx";

export function Modal(props: {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!props.open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") props.onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props.open, props.onClose]);

  if (!props.open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={props.onClose}
        aria-label="Close modal"
      />
      <div
        className={clsx(
          "relative w-full max-w-3xl rounded-2xl border border-white/10 bg-white shadow-soft",
          "animate-[modalIn_180ms_ease-out]"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
          <div className="min-w-0">
            {props.title ? <div className="text-sm font-semibold text-ink-900">{props.title}</div> : null}
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="flex-shrink-0 rounded-xl border border-gray-200 bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto p-5">{props.children}</div>
        {props.footer ? <div className="border-t border-gray-100 p-5">{props.footer}</div> : null}
      </div>
    </div>
  );
}

