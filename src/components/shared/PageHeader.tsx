import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  tag?: string;
  title: string;
  titleItalic?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  tag,
  title,
  titleItalic,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 flex-1 space-y-2">
        {tag ? (
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-600">
            {tag}
          </p>
        ) : null}
        <h1 className="font-display text-2xl font-semibold leading-tight text-emerald-900 sm:text-3xl">
          {title}
          {titleItalic ? (
            <span className="italic text-emerald-800"> {titleItalic}</span>
          ) : null}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
