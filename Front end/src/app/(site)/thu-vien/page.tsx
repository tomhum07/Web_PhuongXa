"use client";

import { useEffect, useMemo, useState } from "react";
import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { API_BASE_URL } from "@/lib/api/config";
import { Camera, FolderOpen, Images } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type GalleryApiItem = {
  imageId?: number;
  id?: number;
  title?: string;
  section?: string;
  fileUrl?: string;
  imageUrl?: string;
  url?: string;
  path?: string;
  isVisible?: boolean;
  uploaderId?: number;
  uploaderName?: string;
  createdAt?: string;
};

type GalleryItem = {
  id: number;
  title: string;
  section: string;
  imageUrl: string;
  blobUrl?: string;
  createdAt?: string;
};

function getFolderName(section: string): string {
  const normalized = section.trim().replace(/\\/g, "/");
  const parts = normalized.split("/").filter(Boolean);

  return parts[parts.length - 1] || "Thu vien";
}

function isThumbnailFolder(section: string): boolean {
  const normalized = section.trim().replace(/\\/g, "/");
  return normalized
    .split("/")
    .filter(Boolean)
    .some((part) => part.toLowerCase() === "article-thumbnail");
}

function isThumbnailName(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized === "article-thumbnail" || normalized.startsWith("article-")
  );
}

function normalizeGalleryResponse(payload: unknown): GalleryApiItem[] {
  // Backend có thể trả về mảng trực tiếp hoặc bọc trong wrapper object
  if (Array.isArray(payload)) {
    return payload as GalleryApiItem[];
  }

  if (payload && typeof payload === "object") {
    const asRecord = payload as Record<string, unknown>;
    // Ưu tiên order: value > data > items > result
    const possibleList =
      asRecord.value ?? asRecord.data ?? asRecord.items ?? asRecord.result;

    if (Array.isArray(possibleList)) {
      return possibleList as GalleryApiItem[];
    }
  }

  return [];
}

function mapGalleryItem(
  item: GalleryApiItem,
  index: number,
): GalleryItem | null {
  if (item.section && isThumbnailFolder(item.section)) {
    return null;
  }

  // Chuẩn hóa ID: ưu tiên imageId từ backend
  const itemId = item.imageId ?? item.id ?? index + 1;

  // FE không tự ghép đường dẫn, dùng trực tiếp ImageUrl backend trả về
  // Ưu tiên sử dụng endpoint ổn định (vd: /api/Gallery/{id}/image) nếu có
  const imageUrl = item.imageUrl ?? item.fileUrl ?? item.url ?? item.path ?? "";

  if (!imageUrl) {
    return null;
  }

  return {
    id: itemId,
    title: item.title?.trim() || `Hinh anh #${index + 1}`,
    section: item.section?.trim() || "Thu vien",
    imageUrl,
    createdAt: item.createdAt,
  };
}

export default function ThuVienPage() {
  const apiBaseUrl = API_BASE_URL;

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const galleryByFolder = useMemo(() => {
    const groups = new Map<string, GalleryItem[]>();

    gallery.forEach((item) => {
      const folderName = getFolderName(item.section);
      const existing = groups.get(folderName) ?? [];
      existing.push(item);
      groups.set(folderName, existing);
    });

    return Array.from(groups.entries())
      .filter(([folderName]) => !isThumbnailName(folderName))
      .map(([folderName, items]) => ({
        folderName,
        items,
      }))
      .sort((a, b) => a.folderName.localeCompare(b.folderName, "vi"));
  }, [gallery]);

  // Set default folder khi load dữ liệu
  useEffect(() => {
    if (!selectedFolder && galleryByFolder.length > 0) {
      setSelectedFolder(galleryByFolder[0].folderName);
    }
  }, [galleryByFolder, selectedFolder]);

  const filteredGroup = useMemo(() => {
    return galleryByFolder.find((group) => group.folderName === selectedFolder);
  }, [galleryByFolder, selectedFolder]);

  useEffect(() => {
    let isMounted = true;

    const fetchGallery = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/api/Gallery`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Khong the tai danh sach anh (HTTP ${response.status}).`,
          );
        }

        const payload = (await response.json().catch(() => null)) as unknown;
        const normalized = normalizeGalleryResponse(payload)
          .map((item, idx) => mapGalleryItem(item, idx))
          .filter((item): item is GalleryItem => Boolean(item));

        if (isMounted) {
          setGallery(normalized);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Khong the tai danh sach anh luc nay.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchGallery();

    return () => {
      isMounted = false;
    };
  }, [apiBaseUrl]);

  return (
    <div>
      <div className="relative overflow-hidden border-b bg-sky-50/70  ">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Images className="absolute left-5 top-4 size-9 -rotate-12 text-sky-300/60 md:size-12" />
          <Camera className="absolute right-6 top-6 size-8 rotate-12 text-emerald-300/60 md:size-11" />
          <FolderOpen className="absolute bottom-3 left-[16%] size-8 rotate-6 text-cyan-300/50 md:size-10" />
          <Images className="absolute bottom-2 right-[14%] size-9 -rotate-6 text-sky-300/50 md:size-11" />
        </div>

        <div className="container relative mx-auto flex flex-col items-center gap-4 p-5 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
            Không gian hình ảnh
          </span>
          <h1 className="text-3xl font-black tracking-tight text-sky-600">
            Thư viện
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 md:text-base">
            Nơi lưu trữ và cập nhật các hình ảnh hoạt động nổi bật của địa
            phương theo từng thư mục.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-1 md:justify-start">
            <Badge
              variant="secondary"
              className=" border-slate-200 bg-white px-3 py-3 text-xs font-medium text-slate-700"
            >
              {galleryByFolder.length} thư mục
            </Badge>
            <Badge
              variant="secondary"
              className=" border-slate-200 bg-white px-3 py-3 text-xs font-medium text-slate-700"
            >
              {gallery.length} ảnh
            </Badge>
          </div>
        </div>
      </div>
      <section className="container mx-auto px-4 py-10">
        {isLoading ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            Đang tải dữ liệu thư viện...
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && gallery.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            Chưa có ảnh nào trong thư viện.
          </div>
        ) : null}

        {!isLoading && !error && gallery.length > 0 ? (
          <Tabs
            value={selectedFolder || ""}
            onValueChange={setSelectedFolder}
            className="space-y-6"
          >
            {/* Tab List - Scrollable for mobile */}
            <div>
              <TabsList>
                {galleryByFolder.map((group) => (
                  <TabsTrigger key={group.folderName} value={group.folderName}>
                    <span>{group.folderName}</span>
                    <span className="ml-2 text-xs text-slate-500">
                      ({group.items.length})
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Content */}
            {filteredGroup ? (
              <TabsContent
                value={filteredGroup.folderName}
                className="space-y-4 mt-0"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredGroup.items.map((item) => (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
                    >
                      <div
                        className="relative h-56 w-full bg-muted overflow-hidden group cursor-pointer"
                        onClick={() => setSelectedImage(item.imageUrl)}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            // Fallback hiển thị ảnh mặc định khi bị 404 để không vỡ UI
                            e.currentTarget.src = "/empty.jpg";
                            e.currentTarget.onerror = null; // Tránh lặp vô hạn nếu ảnh fallback cũng lỗi
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-medium">
                            Bấm để xem ảnh lớn
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 p-4">
                        <h3 className="line-clamp-1 text-base font-semibold">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Phân loại: {item.section}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </TabsContent>
            ) : null}
          </Tabs>
        ) : null}

        {/* Modal hiển thị ảnh lớn */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-h-screen max-w-full w-[90vw] h-[90vh]">
              <img
                src={selectedImage}
                alt="Ảnh phóng to"
                className="w-full h-full object-contain"
              />
              <button
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full w-10 h-10 p-0 flex items-center justify-center transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
