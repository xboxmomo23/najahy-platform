import type { Database } from "@/types/database.types";

export type UserRole = Database["public"]["Enums"]["user_role"];

export const DASHBOARD_BY_ROLE: Record<UserRole, string> = {
  student: "/dashboard",
  parent: "/parent/dashboard",
  teacher: "/prof/dashboard",
  admin: "/admin/dashboard",
};

export function getDashboardPathForRole(role: UserRole): string {
  return DASHBOARD_BY_ROLE[role];
}

export function isSafeRedirectPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//");
}
