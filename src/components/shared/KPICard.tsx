import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface KPICardProps {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
  variant?: "default" | "emerald";
  className?: string;
}

const deltaToneClasses = {
  positive: "text-emerald-700",
  negative: "text-coral",
  neutral: "text-muted",
} as const;

export function KPICard({
  label,
  value,
  delta,
  deltaTone = "neutral",
  icon,
  variant = "default",
  className,
}: KPICardProps) {
  const isEmerald = variant === "emerald";

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-4 sm:p-5",
        isEmerald
          ? "border-emerald-800 bg-emerald-900 text-cream"
          : "border-sand bg-paper text-ink",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            "text-xs font-medium uppercase tracking-wider",
            isEmerald ? "text-gold-400" : "text-muted",
          )}
        >
          {label}
        </p>
        {icon ? (
          <span
            className={cn(
              "shrink-0 [&_svg]:size-5",
              isEmerald ? "text-gold-500" : "text-emerald-800",
            )}
            aria-hidden
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div
        className={cn(
          "font-display text-3xl font-semibold leading-none tracking-tight",
          isEmerald ? "text-cream" : "text-emerald-900",
        )}
      >
        {value}
      </div>
      {delta ? (
        <p
          className={cn(
            "text-sm font-medium",
            isEmerald ? "text-gold-100" : deltaToneClasses[deltaTone],
          )}
        >
          {delta}
        </p>
      ) : null}
    </article>
  );
}
