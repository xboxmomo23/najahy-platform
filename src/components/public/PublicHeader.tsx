import Link from "next/link";

import { MobileMenu } from "@/components/public/MobileMenu";
import { Logo } from "@/components/shared";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Comment ça marche", href: "/#notre-approche" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Témoignages", href: "/#temoignages" },
] as const;

const commencerClasses = cn(
  "inline-flex items-center justify-center rounded-full bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-emerald-900",
);

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo href="/" size="sm" className="shrink-0" />

        <nav
          className="hidden items-center justify-center gap-1 lg:flex"
          aria-label="Navigation principale"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-paper hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 sm:flex sm:gap-3">
            <Link
              href="/connexion"
              className="rounded-lg px-3 py-2 text-sm font-medium text-emerald-800 transition-colors hover:bg-paper"
            >
              Connexion
            </Link>
            <Link href="/inscription" className={commencerClasses}>
              Commencer
            </Link>
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
