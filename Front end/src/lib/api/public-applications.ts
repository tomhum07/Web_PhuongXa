const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://phuongxa-api-backend-fuc4gzgyauanbhc7.southeastasia-01.azurewebsites.net/api";

export type PublicField = {
  serviceId: number;
  fieldName: string;
  description?: string;
  count?: number; 
};

export type PublicProcedure = {
  applicationId: number;
  applicationCode: string;
  fieldName: string;
  detailUrl?: string; // or fileUrl...
  adminNote?: string;
};

export async function getPublicFields(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/applications/fields`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch fields error:", error);
    return [];
  }
}

export async function getPublicProcedures(serviceId: string | number): Promise<any[]> {        
  try {
    const response = await fetch(`${API_BASE_URL}/public/applications/fields/${serviceId}/procedures`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch procedures error:", error);
    return [];
  }
}

export async function getPublicApplications(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/applications`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch applications error:", error);
    return [];
  }
}

export async function getPublicApplicationById(id: string | number): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/public/applications/${id}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch application error:", error);
    return null;
  }
}
