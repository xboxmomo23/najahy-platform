"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Avatar, Badge, Logo } from "@/components/shared";
import { cn } from "@/lib/utils";

export type AuthNavLink = {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: number;
};

export type AuthSidebarUser = {
  name: string;
  avatar?: string;
  secondaryLabel?: string;
};

export interface AuthSidebarProps {
  links: AuthNavLink[];
  roleLabel: string;
  roleLabelTone?: "default" | "admin";
  user: AuthSidebarUser;
  userFooter?: ReactNode;
  className?: string;
}

function NavItem({
  link,
  active,
  compact = false,
}: {
  link: AuthNavLink;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={link.href}
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        compact ? "flex-col gap-1 px-1 py-2 text-[10px]" : "flex-row",
        active
          ? "bg-paper text-emerald-900"
          : "text-muted hover:bg-paper/80 hover:text-ink",
      )}
      aria-current={active ? "page" : undefined}
    >
      <span
        className={cn(
          "shrink-0 [&_svg]:size-5",
          active ? "text-emerald-800" : "text-emerald-700",
          compact && "[&_svg]:size-5",
        )}
        aria-hidden
      >
        {link.icon}
      </span>
      <span className={cn(compact && "leading-tight")}>{link.label}</span>
      {link.badge !== undefined && link.badge > 0 && !compact ? (
        <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-coral text-[10px] font-bold text-cream">
          {link.badge > 9 ? "9+" : link.badge}
        </span>
      ) : null}
    </Link>
  );
}

export function AuthSidebar({
  links,
  roleLabel,
  roleLabelTone = "default",
  user,
  userFooter,
  className,
}: AuthSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-sand bg-cream",
        className,
      )}
    >
      <div className="border-b border-sand px-4 py-5">
        <Logo href="/" size="md" />
        <p
          className={cn(
            "mt-3 text-xs font-medium uppercase tracking-wider",
            roleLabelTone === "admin"
              ? "flex items-center gap-1.5 text-coral"
              : "text-muted",
          )}
        >
          {roleLabelTone === "admin" ? (
            <span
              className="size-1.5 shrink-0 animate-pulse rounded-full bg-coral"
              aria-hidden
            />
          ) : null}
          {roleLabel}
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
        {links.map((link) => (
          <NavItem
            key={link.href}
            link={link}
            active={
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(`${link.href}/`))
            }
          />
        ))}
      </nav>

      <div className="border-t border-sand p-4">
        <div className="flex items-center gap-3 rounded-xl bg-paper p-3">
          <Avatar name={user.name} imageUrl={user.avatar} size="md" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            {user.secondaryLabel ? (
              <p
                className={cn(
                  "truncate text-xs",
                  roleLabelTone === "admin" ? "text-coral" : "text-muted",
                )}
              >
                {user.secondaryLabel}
              </p>
            ) : null}
            {userFooter}
          </div>
        </div>
      </div>
    </aside>
  );
}

export interface AuthLayoutShellProps extends AuthSidebarProps {
  mobileNavLinks: AuthNavLink[];
  children: ReactNode;
}

export function AuthLayoutShell({
  mobileNavLinks,
  children,
  user,
  ...sidebarProps
}: AuthLayoutShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-cream">
      <div className="hidden lg:flex lg:shrink-0">
        <AuthSidebar user={user} {...sidebarProps} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-sand bg-cream/95 px-4 py-3 backdrop-blur-sm lg:hidden">
          <Logo href="/" size="sm" />
          <Avatar name={user.name} imageUrl={user.avatar} size="sm" />
        </header>

        <main className="flex-1 pb-20 lg:pb-0">{children}</main>

        <nav
          className="fixed inset-x-0 bottom-0 z-30 border-t border-sand bg-cream px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
          aria-label="Navigation principale"
        >
          <ul className="flex items-stretch justify-around gap-1">
            {mobileNavLinks.map((link) => (
              <li key={link.href} className="flex-1">
                <NavItem
                  link={link}
                  active={
                    pathname === link.href ||
                    pathname.startsWith(`${link.href}/`)
                  }
                  compact
                />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export function TeacherVerificationBadge({
  status,
}: {
  status: "pending" | "verified" | "rejected" | "suspended";
}) {
  if (status === "verified") {
    return (
      <Badge variant="good" className="mt-1.5">
        ✓ Vérifié
      </Badge>
    );
  }

  return (
    <Badge variant="warning" className="mt-1.5">
      En attente
    </Badge>
  );
}
