import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Home,
  Sparkles,
  User,
  Video,
} from "lucide-react";

import {
  AuthLayoutShell,
  type AuthNavLink,
} from "@/components/shared/AuthSidebar";
import { getLayoutUser } from "@/lib/auth/get-layout-user";

const sidebarLinks: AuthNavLink[] = [
  { label: "Accueil", href: "/dashboard", icon: <Home /> },
  { label: "Bibliothèque", href: "/app/bibliotheque", icon: <BookOpen /> },
  { label: "Tuteur IA", href: "/app/tuteur-ia", icon: <Sparkles /> },
  { label: "Profs visio", href: "/app/profs", icon: <Video /> },
  { label: "Mon plan", href: "/app/plan", icon: <ClipboardList /> },
  { label: "BAC blanc", href: "/app/bac-blanc", icon: <GraduationCap /> },
];

const mobileNavLinks: AuthNavLink[] = [
  { label: "Accueil", href: "/dashboard", icon: <Home /> },
  { label: "Cours", href: "/app/bibliotheque", icon: <BookOpen /> },
  { label: "IA", href: "/app/tuteur-ia", icon: <Sparkles /> },
  { label: "Profs", href: "/app/profs", icon: <Video /> },
  { label: "Profil", href: "/app/profil", icon: <User /> },
];

export default async function StudentShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getLayoutUser("student");

  return (
    <AuthLayoutShell
      links={sidebarLinks}
      mobileNavLinks={mobileNavLinks}
      roleLabel="Espace Élève"
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
