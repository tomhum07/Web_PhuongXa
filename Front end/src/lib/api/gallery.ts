import { GalleryItem } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://phuongxa-api-backend-fuc4gzgyauanbhc7.southeastasia-01.azurewebsites.net/api";

export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/Gallery`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch gallery items: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return [];
  }
}

export async function uploadGalleryImage(file: File, title: string, section: string) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("Title", title);
    formData.append("Section", section);

    const response = await fetch(`${API_BASE_URL}/Gallery/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
