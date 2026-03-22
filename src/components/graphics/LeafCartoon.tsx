import React from "react";

export function LeafCartoon(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      width="140"
      height="140"
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="g1" x1="18" y1="22" x2="120" y2="126" gradientUnits="userSpaceOnUse">
          <stop stopColor="#12A65B" />
          <stop offset="1" stopColor="#46D99D" />
        </linearGradient>
      </defs>
      <path
        d="M105 24C73 26 49 41 35 66C24 86 26 108 34 116C42 124 63 124 83 113C108 99 123 75 125 43C125 32 116 23 105 24Z"
        fill="url(#g1)"
      />
      <path
        d="M46 110C58 94 74 80 98 63"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="58" cy="88" r="6" fill="rgba(255,255,255,0.85)" />
      <circle cx="78" cy="68" r="4.5" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}

