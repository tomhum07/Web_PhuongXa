import { API_BASE_URL } from "@/lib/api/config";

export type ApiUser = {
  userId: number;
  roleId: number;
  username: string;
  fullName: string;
  roleName?: string | null;
  email?: string | null;
  isActive?: boolean | null;
  status?: number | null;
  createdAt?: string | null;
  resetOtp?: string | null;
  resetOtpExpiry?: string | null;
};

export type ApiRole = {
  roleId: number;
  roleName: string;
  description?: string | null;
};

type GetUsersParams = {
  roleId?: number;
  isActive?: boolean;
  name?: string;
  email?: string;
  signal?: AbortSignal;
};

export async function getUsers(params?: GetUsersParams): Promise<ApiUser[]> {
  const searchParams = new URLSearchParams();

  if (typeof params?.roleId === "number") {
    searchParams.set("roleId", String(params.roleId));
  }

  if (typeof params?.isActive === "boolean") {
    searchParams.set("isActive", params.isActive ? "1" : "0");
  }

  if (params?.name) {
    searchParams.set("name", params.name);
  }

  if (params?.email) {
    searchParams.set("email", params.email);
  }

  const query = searchParams.toString();
  const response = await fetch(
    `${API_BASE_URL}/api/admin/users${query ? `?${query}` : ""}`,
    {
      headers: { Accept: "application/json" },
      signal: params?.signal,
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`);
  }

  const data = (await response.json()) as ApiUser[];
  return data;
}

export async function lockUser(
  userId: number,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/users/${userId}/lock`,
    {
      method: "PUT",
      headers: { Accept: "application/json" },
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to lock user: ${response.status}`);
  }
}

export async function unlockUser(
  userId: number,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/users/${userId}/unlock`,
    {
      method: "PUT",
      headers: { Accept: "application/json" },
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to unlock user: ${response.status}`);
  }
}

export async function getRoles(signal?: AbortSignal): Promise<ApiRole[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/roles`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch roles: ${response.status}`);
  }

  return (await response.json()) as ApiRole[];
}

export async function changeUserRole(
  userId: number,
  roleId: number,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/users/${userId}/role`,
    {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roleId }),
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to update user role: ${response.status}`);
  }
}
