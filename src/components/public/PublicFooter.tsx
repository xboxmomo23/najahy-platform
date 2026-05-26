import Link from "next/link";

import { Logo } from "@/components/shared";

const LEGAL_LINKS = [
  { label: "CGU", href: "/cgu" },
  { label: "Confidentialité", href: "/confidentialite" },
] as const;

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://facebook.com",
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
  },
  {
    label: "Telegram",
    href: "https://t.me",
  },
] as const;

export function PublicFooter() {
  return (
    <footer className="border-t border-sand bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Logo href="/" size="sm" />
          <p className="max-w-xs text-sm text-muted">
            © {new Date().getFullYear()} Najahy — Infra Salama EURL
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Légal
            </p>
            <ul className="mt-3 space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-emerald-800 transition-colors hover:text-emerald-900"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              Réseaux
            </p>
            <ul className="mt-3 space-y-2">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-800 transition-colors hover:text-emerald-900"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
