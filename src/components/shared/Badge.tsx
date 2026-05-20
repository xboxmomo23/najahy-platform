import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const najahyBadgeVariants = cva(
  "rounded-full border-transparent px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
  {
    variants: {
      variant: {
        good: "bg-emerald-100 text-emerald-700",
        warning: "bg-gold-100 text-gold-600",
        alert: "bg-coral-100 text-coral",
        info: "bg-emerald-800 text-gold-500",
        neutral: "bg-sand text-muted",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps
  extends Omit<ComponentProps<typeof ShadcnBadge>, "variant">,
    VariantProps<typeof najahyBadgeVariants> {}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <ShadcnBadge
      variant="outline"
      className={cn(najahyBadgeVariants({ variant }), className)}
      {...props}
    />
  );
}
