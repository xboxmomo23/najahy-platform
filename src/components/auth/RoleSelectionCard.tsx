"use client";

import { BookOpen, GraduationCap, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/shared";
import { cn } from "@/lib/utils";

const ICONS = {
  student: GraduationCap,
  parent: Users,
  teacher: BookOpen,
} as const;

export type RoleSelectionIcon = keyof typeof ICONS;

export interface RoleSelectionCardProps {
  title: string;
  description: string;
  href: string;
  icon: RoleSelectionIcon;
  iconWrapperClass: string;
  iconClass: string;
  badge?: string;
  badgeVariant?: "good" | "warning" | "info";
  disabled?: boolean;
  disabledMessage?: string;
}

export function RoleSelectionCard({
  title,
  description,
  href,
  icon,
  iconWrapperClass,
  iconClass,
  badge,
  badgeVariant = "info",
  disabled = false,
  disabledMessage = "Disponible bientôt",
}: RoleSelectionCardProps) {
  const Icon = ICONS[icon];

  const content = (
    <>
      {badge ? (
        <Badge variant={badgeVariant} className="absolute top-4 right-4">
          {badge}
        </Badge>
      ) : null}

      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-full",
          iconWrapperClass,
        )}
        aria-hidden
      >
        <Icon className={cn("size-7", iconClass)} />
      </div>

      <h2 className="mt-5 font-display text-xl font-semibold text-emerald-900">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>

      {disabled ? (
        <p className="mt-4 text-xs font-medium text-gold-600">
          Disponible bientôt
        </p>
      ) : null}
    </>
  );

  const cardClass = cn(
    "group relative flex h-full flex-col rounded-2xl border border-sand bg-paper p-6 text-left transition-all duration-200 sm:p-8",
    disabled
      ? "cursor-not-allowed opacity-60"
      : "-translate-y-0 hover:-translate-y-2 hover:border-emerald-800/20 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
  );

  if (disabled) {
    return (
      <div className={cardClass} aria-disabled="true">
        {disabledMessage ? (
          <span
            role="tooltip"
            className="pointer-events-none absolute inset-x-4 bottom-4 z-10 rounded-lg bg-emerald-900 px-3 py-2 text-center text-xs font-medium text-cream opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
          >
            {disabledMessage}
          </span>
        ) : null}
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className={cardClass}>
      {content}
    </Link>
  );
}
