"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-sand bg-paper px-6 py-12 text-center sm:px-10",
        className,
      )}
      aria-labelledby="empty-state-title"
    >
      <div
        className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-cream text-emerald-800 [&_svg]:size-7"
        aria-hidden
      >
        {icon}
      </div>
      <h2
        id="empty-state-title"
        className="font-display text-xl font-semibold text-emerald-900 sm:text-2xl"
      >
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted sm:text-base">
        {description}
      </p>
      {actionLabel && onAction ? (
        <Button
          type="button"
          onClick={onAction}
          className="mt-6 bg-emerald-900 text-cream hover:bg-emerald-800"
        >
          {actionLabel}
        </Button>
      ) : null}
    </section>
  );
}
