import React, { useRef, useState } from "react";
import clsx from "clsx";

export function TiltCard(props: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      ref={ref}
      className={clsx(
        "transform-gpu transition-all duration-300",
        isHovering ? "scale-105 shadow-lg" : "scale-100 shadow-md",
        props.className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {props.children}
    </div>
  );
}

