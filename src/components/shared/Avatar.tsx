import { cn } from "@/lib/utils";

export interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  online?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
} as const;

const onlineDotSizes = {
  sm: "size-2 border",
  md: "size-2.5 border-2",
  lg: "size-3 border-2",
  xl: "size-3.5 border-2",
} as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function Avatar({
  name,
  imageUrl,
  size = "md",
  online = false,
  className,
}: AvatarProps) {
  const initials = getInitials(name);

  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      role="img"
      aria-label={name}
    >
      <span
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-full bg-emerald-900 font-display font-semibold text-gold-500 ring-2 ring-sand",
          sizeClasses[size],
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <span aria-hidden>{initials}</span>
        )}
      </span>
      {online ? (
        <span
          className={cn(
            "absolute right-0 bottom-0 rounded-full border-cream bg-emerald-600 animate-pulse",
            onlineDotSizes[size],
          )}
          aria-label="En ligne"
        />
      ) : null}
    </span>
  );
}
