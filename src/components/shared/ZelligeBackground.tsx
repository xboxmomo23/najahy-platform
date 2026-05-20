import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface ZelligeBackgroundProps {
  children: ReactNode;
  className?: string;
}

const zelligeBackgroundStyle: CSSProperties = {
  backgroundImage: [
    "repeating-linear-gradient(45deg, transparent 0, transparent 18px, rgba(26, 58, 42, 0.025) 18px, rgba(26, 58, 42, 0.025) 19px)",
    "repeating-linear-gradient(-45deg, transparent 0, transparent 18px, rgba(200, 144, 43, 0.02) 18px, rgba(200, 144, 43, 0.02) 19px)",
  ].join(", "),
};

export function ZelligeBackground({ children, className }: ZelligeBackgroundProps) {
  return (
    <div className={cn("relative min-h-full bg-cream", className)}>
      <div
        className="pointer-events-none absolute inset-0 -z-0"
        style={zelligeBackgroundStyle}
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
