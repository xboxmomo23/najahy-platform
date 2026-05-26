import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database.types";

type UserRole = Database["public"]["Enums"]["user_role"];

const DASHBOARD_BY_ROLE: Record<UserRole, string> = {
  student: "/dashboard",
  parent: "/parent/dashboard",
  teacher: "/prof/dashboard",
  admin: "/admin/dashboard",
};

function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

function isProtectedPath(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/app") ||
    pathname.startsWith("/parent") ||
    pathname.startsWith("/prof") ||
    pathname.startsWith("/admin")
  );
}

function isAuthPath(pathname: string): boolean {
  return pathname === "/connexion" || pathname.startsWith("/inscription");
}

function getZone(pathname: string): "app" | "parent" | "prof" | "admin" | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/prof")) return "prof";
  if (pathname.startsWith("/parent")) return "parent";
  if (pathname === "/dashboard" || pathname.startsWith("/app")) return "app";
  return null;
}

function roleForZone(zone: NonNullable<ReturnType<typeof getZone>>): UserRole {
  switch (zone) {
    case "app":
      return "student";
    case "parent":
      return "parent";
    case "prof":
      return "teacher";
    case "admin":
      return "admin";
  }
}

function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url);
}

function redirectUnauthenticated(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/connexion";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

function redirectWrongZone(
  request: NextRequest,
  pathname: string,
  zone: NonNullable<ReturnType<typeof getZone>>,
) {
  if (zone === "admin") {
    return redirectTo(request, "/dashboard");
  }
  return redirectTo(request, pathname);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const protectedPath = isProtectedPath(pathname);
  const authPath = isAuthPath(pathname);

  const env = getSupabaseEnv();
  if (!env) {
    if (protectedPath) {
      return redirectUnauthenticated(request);
    }
    return NextResponse.next({ request });
  }

  const { url, anonKey } = env;
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (protectedPath) {
      return redirectUnauthenticated(request);
    }
    return response;
  }

  if (!protectedPath && !authPath) {
    return response;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;

  if (authPath) {
    if (role) {
      // Inscription accessible même connecté (ex. compte admin de dev) — signup déconnecte avant création
      if (pathname.startsWith("/inscription")) {
        return response;
      }
      return redirectTo(request, DASHBOARD_BY_ROLE[role]);
    }
    return response;
  }

  if (!role) {
    return redirectUnauthenticated(request);
  }

  const zone = getZone(pathname);
  if (!zone) {
    return response;
  }

  if (role !== roleForZone(zone)) {
    return redirectWrongZone(request, DASHBOARD_BY_ROLE[role], zone);
  }

  return response;
}

export const config = {
  matcher: [
    "/app",
    "/app/:path*",
    "/parent",
    "/parent/:path*",
    "/prof",
    "/prof/:path*",
    "/admin",
    "/admin/:path*",
    "/connexion",
    "/inscription",
    "/inscription/:path*",
    "/dashboard",
    "/dashboard/:path*",
  ],
};
