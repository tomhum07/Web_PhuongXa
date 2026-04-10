import { API_BASE_URL } from "@/lib/api/config";

export type AdminGalleryItem = {
  imageId: number;
  section: string;
  title: string;
  imageUrl: string;
  blobUrl?: string;
  hasFile?: boolean;
  uploaderId?: number | null;
  uploaderName?: string | null;
  isVisible: boolean;
  createdAt?: string;
};

type GalleryApiResponseItem = Partial<AdminGalleryItem> & {
  ImageId?: number;
  Section?: string;
  Title?: string;
  ImageUrl?: string;
  BlobUrl?: string;
  HasFile?: boolean;
  UploaderId?: number | null;
  UploaderName?: string | null;
  IsVisible?: boolean;
  CreatedAt?: string;
};

function normalizeGalleryItems(payload: unknown): GalleryApiResponseItem[] {
  if (Array.isArray(payload)) {
    return payload as GalleryApiResponseItem[];
  }

  if (payload && typeof payload === "object") {
    const asRecord = payload as Record<string, unknown>;
    const candidate =
      asRecord.value ?? asRecord.data ?? asRecord.items ?? asRecord.result;

    if (Array.isArray(candidate)) {
      return candidate as GalleryApiResponseItem[];
    }
  }

  return [];
}

function mapGalleryItem(item: GalleryApiResponseItem): AdminGalleryItem | null {
  const imageId = item.imageId ?? item.ImageId;
  const imageUrl = item.imageUrl ?? item.ImageUrl ?? "";

  if (!imageId || !imageUrl) {
    return null;
  }

  return {
    imageId,
    section: (item.section ?? item.Section ?? "").trim(),
    title: (item.title ?? item.Title ?? "").trim(),
    imageUrl,
    blobUrl: item.blobUrl ?? item.BlobUrl,
    hasFile: item.hasFile ?? item.HasFile,
    uploaderId: item.uploaderId ?? item.UploaderId ?? null,
    uploaderName: item.uploaderName ?? item.UploaderName ?? null,
    isVisible: item.isVisible ?? item.IsVisible ?? true,
    createdAt: item.createdAt ?? item.CreatedAt,
  };
}

async function parseApiResponse(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

async function requestGalleryAction(imageId: number) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/gallery/${imageId}/hide`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
      },
    },
  );

  const data = await parseApiResponse(response);

  if (!response.ok) {
    const message =
      data && typeof data === "object"
        ? (data as { message?: string; Message?: string }).message ||
          (data as { message?: string; Message?: string }).Message
        : null;

    throw new Error(message || "Không thể ẩn ảnh lúc này.");
  }

  return data;
}

export async function getAdminGalleryImages(): Promise<AdminGalleryItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/gallery`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const payload = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error("Không thể tải danh sách ảnh thư viện.");
  }

  return normalizeGalleryItems(payload)
    .map(mapGalleryItem)
    .filter((item): item is AdminGalleryItem => Boolean(item));
}

export async function hideAdminGalleryImage(imageId: number) {
  return requestGalleryAction(imageId);
}
