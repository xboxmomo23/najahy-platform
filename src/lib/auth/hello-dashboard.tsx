import { PageHeader } from "@/components/shared";
import { getLayoutUser } from "@/lib/auth/get-layout-user";
import type { Database } from "@/types/database.types";

type UserRole = Database["public"]["Enums"]["user_role"];

const HELLO_COPY: Record<
  UserRole,
  { tag: string; subtitle: string; description: string }
> = {
  student: {
    tag: "Élève",
    subtitle: "espace élève",
    description: "Bienvenue, espace élève en construction.",
  },
  parent: {
    tag: "Parent",
    subtitle: "espace parent",
    description: "Bienvenue, espace parent en construction.",
  },
  teacher: {
    tag: "Professeur",
    subtitle: "espace professeur",
    description: "Bienvenue, espace professeur en construction.",
  },
  admin: {
    tag: "Admin",
    subtitle: "console admin",
    description: "Bienvenue, console admin en construction.",
  },
};

export async function HelloDashboardPage({
  role,
}: {
  role: UserRole;
}) {
  const user = await getLayoutUser(role);
  const copy = HELLO_COPY[role];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        tag={copy.tag}
        title={`Bonjour ${user.firstName},`}
        titleItalic="Hello World"
        description={copy.description}
      />
      <p className="mt-6 text-sm text-muted">
        Placeholder temporaire — cette page sera remplacée par la verticale{" "}
        {copy.subtitle}.
      </p>
    </div>
  );
}
