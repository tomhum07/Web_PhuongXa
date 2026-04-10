const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, "");

const DEV_FALLBACK_API_BASE_URL = "http://localhost:5265";

const resolvedApiBaseUrl = API_BASE_URL
  ? API_BASE_URL
  : process.env.NODE_ENV === "development"
    ? DEV_FALLBACK_API_BASE_URL
    : "";

export const API_PREFIX = resolvedApiBaseUrl
  ? resolvedApiBaseUrl.endsWith("/api")
    ? resolvedApiBaseUrl
    : `${resolvedApiBaseUrl}/api`
  : "/api";
