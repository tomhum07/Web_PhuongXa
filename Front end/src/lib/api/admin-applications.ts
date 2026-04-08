import { getAuthSnapshot } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://phuongxa-api-backend-fuc4gzgyauanbhc7.southeastasia-01.azurewebsites.net/api";

function getAuthHeaders() {
  const { token } = getAuthSnapshot();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

// ---- Lĩnh Vực (Fields/Categories) ----
export async function fetchAdminFields() {
  const res = await fetch(`${API_BASE_URL}/admin/applications/fields`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch fields");
  return res.json();
}

export async function createAdminField(data: { name: string; categoryCode: string; description?: string; }) {
  const res = await fetch(`${API_BASE_URL}/admin/applications/fields`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create field");
  return res.json();
}

export async function updateAdminField(id: number, data: { name: string; categoryCode: string; description?: string; }) {
  const res = await fetch(`${API_BASE_URL}/admin/applications/fields/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update field");
  return res.json();
}

export async function hideAdminField(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/applications/fields/${id}/hide`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to hide field");
  return res.json();
}

export async function showAdminField(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/applications/fields/${id}/show`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to show field");
  return res.json();
}

// ---- Thủ Tục (Procedures/Services) ----
export async function fetchAdminProcedures() {
  const res = await fetch(`${API_BASE_URL}/admin/applications/procedures`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch procedures");
  return res.json();
}

export async function createAdminProcedure(data: FormData | { serviceCategoryId: number; serviceCode: string; name: string; description?: string; procedureFileUrl?: string; templateFileUrl?: string; }) {
  const { token } = getAuthSnapshot();
  const isFormData = data instanceof FormData;
  const headers: any = {
    Authorization: token ? `Bearer ${token}` : "",
  };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const endpoint = isFormData ? `${API_BASE_URL}/admin/applications/procedures/upload` : `${API_BASE_URL}/admin/applications/procedures`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    console.error("Create procedure error:", res.status, errorText);
    throw new Error(`Failed to create procedure: ${res.status}`);
  }
  
  return res.json();
}

export async function updateAdminProcedure(id: number, data: FormData | { serviceCategoryId: number; serviceCode: string; name: string; description?: string; procedureFileUrl?: string; templateFileUrl?: string; }) {
  const { token } = getAuthSnapshot();
  const isFormData = data instanceof FormData;
  const headers: any = {
    Authorization: token ? `Bearer ${token}` : "",
  };
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const endpoint = isFormData 
    ? `${API_BASE_URL}/admin/applications/procedures/upload/${id}` 
    : `${API_BASE_URL}/admin/applications/procedures/${id}`;

  const res = await fetch(endpoint, {
    method: "PUT",
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    console.error("Update procedure error:", res.status, errorText);
    throw new Error(`Failed to update procedure: ${res.status}`);
  }
  
  return res.json();
}

export async function hideAdminProcedure(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/applications/procedures/${id}/hide`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to hide procedure");
  return res.json();
}

export async function showAdminProcedure(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/applications/procedures/${id}/show`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to show procedure");
  return res.json();
}

