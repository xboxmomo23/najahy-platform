import {
  CreditCard,
  FileText,
  Gauge,
  Shield,
  User,
  Users,
} from "lucide-react";

import {
  AuthLayoutShell,
  type AuthNavLink,
} from "@/components/shared/AuthSidebar";
import { getLayoutUser } from "@/lib/auth/get-layout-user";

const PENDING_MODERATION = 0;
const PENDING_PAYMENTS = 0;

const sidebarLinks: AuthNavLink[] = [
  { label: "Cockpit", href: "/admin/dashboard", icon: <Gauge /> },
  {
    label: "Modération profs",
    href: "/admin/moderation",
    icon: <Shield />,
    badge: PENDING_MODERATION,
  },
  {
    label: "Paiements",
    href: "/admin/paiements",
    icon: <CreditCard />,
    badge: PENDING_PAYMENTS,
  },
  { label: "Utilisateurs", href: "/admin/utilisateurs", icon: <Users /> },
  { label: "Contenu", href: "/admin/contenu", icon: <FileText /> },
];

const mobileNavLinks: AuthNavLink[] = [
  { label: "Cockpit", href: "/admin/dashboard", icon: <Gauge /> },
  { label: "Modération", href: "/admin/moderation", icon: <Shield /> },
  { label: "Paiements", href: "/admin/paiements", icon: <CreditCard /> },
  { label: "Users", href: "/admin/utilisateurs", icon: <Users /> },
  { label: "Profil", href: "/admin/profil", icon: <User /> },
];

export default async function AdminAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getLayoutUser("admin");

  return (
    <AuthLayoutShell
      links={sidebarLinks}
      mobileNavLinks={mobileNavLinks}
      roleLabel="Console Admin"
      roleLabelTone="admin"
      user={{
        name: user.name,
        avatar: user.avatarUrl,
        secondaryLabel: user.secondaryLabel,
      }}
    >
      {children}
    </AuthLayoutShell>
  );
}
