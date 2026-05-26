"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Comment ça marche", href: "/#notre-approche" },
  { label: "Tarifs", href: "/tarifs" },
  { label: "Témoignages", href: "/#temoignages" },
] as const;

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <div className="lg:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-emerald-900 hover:bg-paper"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="public-mobile-menu"
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5" />
      </Button>

      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-200",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
          onClick={close}
          aria-label="Fermer le menu"
        />
        <nav
          id="public-mobile-menu"
          className={cn(
            "absolute top-0 right-0 flex h-full w-[min(100%,20rem)] flex-col border-l border-sand bg-cream p-6 shadow-xl transition-transform duration-200",
            open ? "translate-x-0" : "translate-x-full",
          )}
          aria-label="Menu principal"
        >
          <div className="mb-8 flex items-center justify-between">
            <span className="font-display text-lg font-semibold text-emerald-900">
              Menu
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={close}
              aria-label="Fermer le menu"
            >
              <X className="size-5" />
            </Button>
          </div>

          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-ink transition-colors hover:bg-paper"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex flex-col gap-3 border-t border-sand pt-6">
            <Link
              href="/connexion"
              onClick={close}
              className="flex h-11 items-center justify-center rounded-full border border-sand bg-paper text-sm font-medium text-ink transition-colors hover:bg-cream"
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              onClick={close}
              className="flex h-11 items-center justify-center rounded-full bg-emerald-800 text-sm font-semibold text-cream transition-colors hover:bg-emerald-900"
            >
              Commencer
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
