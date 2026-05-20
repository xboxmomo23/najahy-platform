import {
  Calendar,
  DollarSign,
  Globe,
  LayoutDashboard,
  User,
  Users,
} from "lucide-react";

import {
  AuthLayoutShell,
  TeacherVerificationBadge,
  type AuthNavLink,
} from "@/components/shared/AuthSidebar";
import { getLayoutUser } from "@/lib/auth/get-layout-user";

const sidebarLinks: AuthNavLink[] = [
  { label: "Tableau de bord", href: "/prof/dashboard", icon: <LayoutDashboard /> },
  { label: "Mon profil public", href: "/prof/profil", icon: <Globe /> },
  { label: "Planning", href: "/prof/planning", icon: <Calendar /> },
  { label: "Mes élèves", href: "/prof/eleves", icon: <Users /> },
  { label: "Revenus", href: "/prof/revenus", icon: <DollarSign /> },
];

const mobileNavLinks: AuthNavLink[] = [
  { label: "Accueil", href: "/prof/dashboard", icon: <LayoutDashboard /> },
  { label: "Planning", href: "/prof/planning", icon: <Calendar /> },
  { label: "Élèves", href: "/prof/eleves", icon: <Users /> },
  { label: "Revenus", href: "/prof/revenus", icon: <DollarSign /> },
  { label: "Profil", href: "/prof/profil", icon: <User /> },
];

export default async function TeacherAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getLayoutUser("teacher");

  return (
    <AuthLayoutShell
      links={sidebarLinks}
      mobileNavLinks={mobileNavLinks}
      roleLabel="Espace Professeur"
      user={{
        name: user.name,
        avatar: user.avatarUrl,
      }}
      userFooter={
        user.verificationStatus ? (
          <TeacherVerificationBadge status={user.verificationStatus} />
        ) : null
      }
    >
      {children}
    </AuthLayoutShell>
  );
}
