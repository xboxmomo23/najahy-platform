"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/shared";
import type { QuotaCheckResult } from "@/lib/claude/quota";
import { cn } from "@/lib/utils";

const FREE_DAILY_LIMIT = 3;

export interface QuotaBadgeProps {
  quota: QuotaCheckResult;
  className?: string;
}

function formatRemainingLabel(remaining: number): string {
  if (remaining === 1) {
    return "1 question gratuite restante aujourd'hui";
  }
  return `${remaining} questions gratuites restantes aujourd'hui`;
}

function FreeQuotaProgress({
  remaining,
  className,
}: {
  remaining: number;
  className?: string;
}) {
  const used = FREE_DAILY_LIMIT - remaining;
  const progressPercent = Math.min(
    100,
    Math.round((used / FREE_DAILY_LIMIT) * 100),
  );

  return (
    <div
      className={cn(
        "rounded-xl border border-sand bg-paper/80 px-4 py-3",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-emerald-900">
        {formatRemainingLabel(remaining)}
      </p>
      <div
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-sand"
        aria-hidden
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300",
            remaining === 1 ? "bg-gold-500" : "bg-emerald-600",
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted">
        {used} / {FREE_DAILY_LIMIT} utilisées aujourd&apos;hui
      </p>
    </div>
  );
}

function QuotaExhaustedCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gold-400/50 bg-gold-50 px-4 py-4 sm:px-5",
        className,
      )}
      role="alert"
    >
      <p className="text-sm leading-relaxed text-emerald-900">
        Tu as utilisé tes 3 questions du jour. Reviens demain ou passe au
        Standard pour un accès illimité.
      </p>
      <Link
        href="/tarifs"
        className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-gold-500 px-4 text-sm font-semibold text-emerald-900 transition-colors hover:bg-gold-400"
      >
        Voir les offres
      </Link>
    </div>
  );
}

/**
 * Affiche le quota tuteur IA (calculé côté serveur via `checkQuota`).
 */
export function QuotaBadge({ quota, className }: QuotaBadgeProps) {
  if (quota.remaining === "unlimited") {
    return (
      <Badge
        variant="neutral"
        className={cn(
          "inline-flex items-center gap-1.5 normal-case tracking-normal",
          className,
        )}
      >
        <Sparkles className="size-3.5 shrink-0 text-gold-600" aria-hidden />
        Questions illimitées ✨
      </Badge>
    );
  }

  const remaining = quota.remaining;

  if (!quota.allowed || remaining <= 0) {
    return <QuotaExhaustedCard className={className} />;
  }

  return <FreeQuotaProgress remaining={remaining} className={className} />;
}
