import Link from "next/link";

import { cn } from "@/lib/utils";

export interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  className?: string;
}

const markSizes = {
  sm: "size-8 rounded-lg text-lg",
  md: "size-10 rounded-xl text-xl",
  lg: "size-12 rounded-xl text-2xl",
} as const;

const textSizes = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
} as const;

function LogoMark({ size }: { size: NonNullable<LogoProps["size"]> }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-emerald-800 font-display font-semibold text-gold-500",
        markSizes[size],
      )}
      aria-hidden
    >
      ن
    </span>
  );
}

function LogoContent({
  size = "md",
  showText = true,
  className,
}: Pick<LogoProps, "size" | "showText" | "className">) {
  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <LogoMark size={size} />
      {showText ? (
        <span
          className={cn(
            "font-display font-semibold tracking-tight text-emerald-900",
            textSizes[size],
          )}
        >
          Najahy
        </span>
      ) : null}
    </span>
  );
}

export function Logo({
  size = "md",
  showText = true,
  href,
  className,
}: LogoProps) {
  const content = (
    <LogoContent size={size} showText={showText} className={className} />
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        aria-label="Najahy — accueil"
      >
        {content}
      </Link>
    );
  }

  return content;
}
