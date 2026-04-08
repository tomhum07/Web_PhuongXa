const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, "");

export const API_PREFIX = API_BASE_URL
  ? API_BASE_URL.endsWith("/api")
    ? API_BASE_URL
    : `${API_BASE_URL}/api`
  : "/api";
