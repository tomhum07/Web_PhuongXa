import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_DASHBOARD_PATH,
  EDITOR_DASHBOARD_PATH,
  HOME_PATH,
  LOGIN_PATH,
  getRedirectPathByRole,
  hasDashboardAccess,
  isViewerRole,
  normalizeRole,
} from "@/lib/auth";

const TOKEN_COOKIE = "px_token";
const ROLE_COOKIE = "px_role";

function toRoleKey(role: string): string {
  return normalizeRole(role).replace(/\s+/g, "");
}

const LEGACY_DASHBOARD_ROOT_PATH = "/dashboard";
const LEGACY_ADMIN_DASHBOARD_PATH = "/dashboard/admin";
const LEGACY_EDITOR_DASHBOARD_PATH = "/dashboard/editor";

function isAdminRole(role: string): boolean {
  return toRoleKey(role) === "admin";
}

function isEditorRole(role: string): boolean {
  return toRoleKey(role) === "editor";
}

function getCanonicalDashboardPath(pathname: string): string | null {
  if (pathname === LEGACY_ADMIN_DASHBOARD_PATH) {
    return ADMIN_DASHBOARD_PATH;
  }

  if (pathname.startsWith(`${LEGACY_ADMIN_DASHBOARD_PATH}/`)) {
    return pathname.replace(LEGACY_ADMIN_DASHBOARD_PATH, ADMIN_DASHBOARD_PATH);
  }

  if (pathname === LEGACY_EDITOR_DASHBOARD_PATH) {
    return EDITOR_DASHBOARD_PATH;
  }

  if (pathname.startsWith(`${LEGACY_EDITOR_DASHBOARD_PATH}/`)) {
    return pathname.replace(LEGACY_EDITOR_DASHBOARD_PATH, EDITOR_DASHBOARD_PATH);
  }

  return null;
}

function isProtectedRoute(pathname: string): boolean {
  return (
    pathname === ADMIN_DASHBOARD_PATH ||
    pathname.startsWith(`${ADMIN_DASHBOARD_PATH}/`) ||
    pathname === EDITOR_DASHBOARD_PATH ||
    pathname.startsWith(`${EDITOR_DASHBOARD_PATH}/`) ||
    pathname === LEGACY_DASHBOARD_ROOT_PATH ||
    pathname.startsWith(`${LEGACY_DASHBOARD_ROOT_PATH}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const rawRole = request.cookies.get(ROLE_COOKIE)?.value ?? "";
  const role = decodeURIComponent(rawRole);

  const canonicalPath = getCanonicalDashboardPath(pathname);
  if (canonicalPath) {
    const url = request.nextUrl.clone();
    url.pathname = canonicalPath;
    url.search = search;
    return NextResponse.redirect(url);
  }

  if (pathname === LOGIN_PATH && token) {
    const url = request.nextUrl.clone();
    url.pathname = getRedirectPathByRole(role);
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (pathname === LEGACY_DASHBOARD_ROOT_PATH) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      url.search = `?callbackUrl=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }

    const url = request.nextUrl.clone();
    url.pathname = getRedirectPathByRole(role);
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isProtectedRoute(pathname)) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      url.search = `?callbackUrl=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }

    if (!hasDashboardAccess(role)) {
      const url = request.nextUrl.clone();
      url.pathname = HOME_PATH;
      url.search = "";
      return NextResponse.redirect(url);
    }

    const canAccessEditor = isEditorRole(role);
    const canAccessAdmin = isAdminRole(role);
    const canAccessViewer = isViewerRole(role);

    if (pathname.startsWith(`${ADMIN_DASHBOARD_PATH}/`) || pathname === ADMIN_DASHBOARD_PATH) {
      if (!canAccessAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = getRedirectPathByRole(role);
        url.search = "";
        return NextResponse.redirect(url);
      }
    }

    if (pathname.startsWith(`${EDITOR_DASHBOARD_PATH}/`) || pathname === EDITOR_DASHBOARD_PATH) {
      if (!canAccessEditor && !canAccessAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = getRedirectPathByRole(role);
        url.search = "";
        return NextResponse.redirect(url);
      }
    }

    if (pathname.startsWith(`${LEGACY_DASHBOARD_ROOT_PATH}/`)) {
      if (!canAccessViewer && !canAccessEditor && !canAccessAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = getRedirectPathByRole(role);
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dang-nhap",
    "/dashboard",
    "/dashboard/:path*",
    "/admin",
    "/admin/:path*",
    "/editor",
    "/editor/:path*",
  ],
};
