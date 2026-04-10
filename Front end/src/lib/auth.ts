import { API_BASE_URL } from "@/lib/api/config";

type AuthSessionInput = {
  token: string;
  role: string;
  userId?: number;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
};

export const HOME_PATH = "/";
export const LOGIN_PATH = "/dang-nhap";
export const ADMIN_DASHBOARD_PATH = "/admin";
export const EDITOR_DASHBOARD_PATH = "/editor";

const TOKEN_KEY = "auth_token";
const ROLE_KEY = "auth_role";
const PROFILE_KEY = "auth_profile";

const TOKEN_COOKIE = "px_token";
const ROLE_COOKIE = "px_role";

type AuthSnapshot = {
  token: string | null;
  role: string | null;
};

type AuthProfile = {
  userId?: number;
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
};

export type CurrentUserDisplay = {
  fullName: string;
  email: string | null;
  avatarUrl: string | null;
};

const ADMIN_ROLE_KEYS = new Set(["admin"]);
const EDITOR_ROLE_KEYS = new Set(["editor"]);
const VIEWER_ROLE_KEYS = new Set(["viewer"]);
const DASHBOARD_ROLE_KEYS = new Set([
  ...ADMIN_ROLE_KEYS,
  ...EDITOR_ROLE_KEYS,
  ...VIEWER_ROLE_KEYS,
]);

function toRoleKey(role: string): string {
  return normalizeRole(role).replace(/\s+/g, "");
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  const rawValue = cookie.slice(name.length + 1);

  try {
    return decodeURIComponent(rawValue);
  } catch {
    return rawValue;
  }
}

function setCookieValue(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=86400; samesite=lax`;
}

function clearCookieValue(name: string): void {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function normalizeRole(role: string): string {
  return role
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function isViewerRole(role: string): boolean {
  return VIEWER_ROLE_KEYS.has(toRoleKey(role));
}

export function hasDashboardAccess(role: string): boolean {
  return DASHBOARD_ROLE_KEYS.has(toRoleKey(role));
}

export function getRedirectPathByRole(role: string): string {
  const roleKey = toRoleKey(role);

  if (ADMIN_ROLE_KEYS.has(roleKey)) {
    return ADMIN_DASHBOARD_PATH;
  }

  if (EDITOR_ROLE_KEYS.has(roleKey)) {
    return EDITOR_DASHBOARD_PATH;
  }

  if (VIEWER_ROLE_KEYS.has(roleKey)) {
    return HOME_PATH;
  }

  return HOME_PATH;
}

export function setAuthSession(input: AuthSessionInput): void {
  if (typeof window === "undefined") {
    return;
  }

  const role = normalizeRole(input.role);

  localStorage.setItem(TOKEN_KEY, input.token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify({
      userId: input.userId,
      fullName: input.fullName,
      email: input.email,
      avatarUrl: input.avatarUrl,
      role,
    }),
  );

  setCookieValue(TOKEN_COOKIE, input.token);
  setCookieValue(ROLE_COOKIE, role);

  window.dispatchEvent(
    new CustomEvent("authStateChanged", {
      detail: { userId: input.userId, fullName: input.fullName },
    }),
  );
}

export function getAuthSnapshot(): AuthSnapshot {
  if (typeof window === "undefined") {
    return { token: null, role: null };
  }

  const cookieToken = getCookieValue(TOKEN_COOKIE);
  const cookieRole = getCookieValue(ROLE_COOKIE);

  if (cookieToken) {
    return {
      token: cookieToken,
      role: cookieRole,
    };
  }

  const storageToken = localStorage.getItem(TOKEN_KEY);
  const storageRole = localStorage.getItem(ROLE_KEY);

  return {
    token: storageToken,
    role: storageRole,
  };
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const decoded = atob(padded);
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getAuthProfile(): AuthProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawProfile = localStorage.getItem(PROFILE_KEY);
  if (!rawProfile) {
    return null;
  }

  try {
    return JSON.parse(rawProfile) as AuthProfile;
  } catch {
    return null;
  }
}

export function getCurrentUserId(): number | null {
  const profileUserId = getAuthProfile()?.userId;
  if (
    typeof profileUserId === "number" &&
    Number.isFinite(profileUserId) &&
    profileUserId > 0
  ) {
    return profileUserId;
  }

  const { token } = getAuthSnapshot();
  if (!token) {
    return null;
  }

  const claims = parseJwtPayload(token);
  const claimUserId =
    claims?.nameid ??
    claims?.sub ??
    claims?.[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ];

  const parsedUserId = Number(claimUserId);
  if (Number.isFinite(parsedUserId) && parsedUserId > 0) {
    return parsedUserId;
  }

  return null;
}

export function getCurrentUserDisplay(): CurrentUserDisplay | null {
  const profile = getAuthProfile();

  if (!profile) {
    return null;
  }

  const fullName = profile.fullName?.trim() || "Người dùng";
  const email = profile.email?.trim() || null;
  const avatarUrl = profile.avatarUrl?.trim() || null;

  return {
    fullName,
    email,
    avatarUrl,
  };
}

export function hydrateAuthCookiesFromStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  const cookieToken = getCookieValue(TOKEN_COOKIE);

  if (cookieToken) {
    return;
  }

  const storageToken = localStorage.getItem(TOKEN_KEY);
  const storageRole = localStorage.getItem(ROLE_KEY);

  if (!storageToken) {
    return;
  }

  setCookieValue(TOKEN_COOKIE, storageToken);
  if (storageRole) {
    setCookieValue(ROLE_COOKIE, storageRole);
  }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(PROFILE_KEY);

  clearCookieValue(TOKEN_COOKIE);
  clearCookieValue(ROLE_COOKIE);

  window.dispatchEvent(new CustomEvent("authStateChanged", { detail: {} }));
}
