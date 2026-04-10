import { API_PREFIX } from "@/lib/api/config";

export type Service = {
  serviceId: number;
  name: string;
  description: string;
  procedureDetails?: string;
  isActive: boolean;
};

export async function getActiveServices(
  signal?: AbortSignal,
): Promise<Service[]> {
  const endpoints = [`${API_PREFIX}/Services`, `${API_PREFIX}/Service`];

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
