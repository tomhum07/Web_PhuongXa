import { API_PREFIX } from "@/lib/api/config";

export type Service = {
  serviceId: number;
  name: string;
  description: string;
  procedureDetails?: string;
  isActive: boolean;
};

<<<<<<< HEAD
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://phuongxa-api-backend-fuc4gzgyauanbhc7.southeastasia-01.azurewebsites.net/api";

export async function getActiveServices(
  signal?: AbortSignal,
): Promise<Service[]> {
  const response = await fetch(`${API_BASE_URL}/Service`, {
    headers: { Accept: "application/json" },
    signal,
  });
=======
export async function getActiveServices(
  signal?: AbortSignal,
): Promise<Service[]> {
  const endpoints = [`${API_PREFIX}/Services`, `${API_PREFIX}/Service`];
>>>>>>> 6dad0d803cdb2498e58b360c22d2c7971b199c19

  for (const endpoint of endpoints) {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      signal,
    });

    if (response.ok) {
      const data: Service[] = await response.json();
      return data.filter((service) => service.isActive);
    }

    if (response.status !== 404) {
      throw new Error(`Failed to load services: ${response.status}`);
    }
  }

  return [];
}
