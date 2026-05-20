import {
  BarChart3,
  CreditCard,
  MessageCircle,
  User,
  Users,
  Video,
} from "lucide-react";

import {
  AuthLayoutShell,
  type AuthNavLink,
} from "@/components/shared/AuthSidebar";
import { getLayoutUser } from "@/lib/auth/get-layout-user";

const sidebarLinks: AuthNavLink[] = [
  { label: "Suivi enfant", href: "/parent/dashboard", icon: <Users /> },
  { label: "Progression", href: "/parent/progression", icon: <BarChart3 /> },
  { label: "Cours visio", href: "/parent/cours", icon: <Video /> },
  { label: "Paiements", href: "/parent/paiements", icon: <CreditCard /> },
  { label: "Messages", href: "/parent/messages", icon: <MessageCircle /> },
];

const mobileNavLinks: AuthNavLink[] = [
  { label: "Suivi", href: "/parent/dashboard", icon: <Users /> },
  { label: "Progression", href: "/parent/progression", icon: <BarChart3 /> },
  { label: "Cours", href: "/parent/cours", icon: <Video /> },
  { label: "Messages", href: "/parent/messages", icon: <MessageCircle /> },
  { label: "Profil", href: "/parent/profil", icon: <User /> },
];

export default async function ParentAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getLayoutUser("parent");

  return (
    <AuthLayoutShell
      links={sidebarLinks}
      mobileNavLinks={mobileNavLinks}
      roleLabel="Espace Parent"
      user={{
        name: user.name,
        avatar: user.avatarUrl,
      }}
    >
      {children}
    </AuthLayoutShell>
  );
}
