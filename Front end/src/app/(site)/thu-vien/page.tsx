"use client";

import { useEffect, useMemo, useState } from "react";
<<<<<<< HEAD
=======
import { API_BASE_URL } from "@/lib/api/config";
import { Camera, FolderOpen, Images } from "lucide-react";
import { Badge } from "@/components/ui/badge";
>>>>>>> 6dad0d803cdb2498e58b360c22d2c7971b199c19

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

<<<<<<< HEAD
=======
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

>>>>>>> 6dad0d803cdb2498e58b360c22d2c7971b199c19
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
<<<<<<< HEAD
  index: number
): GalleryItem | null {
=======
  index: number,
): GalleryItem | null {
  if (item.section && isThumbnailFolder(item.section)) {
    return null;
  }

>>>>>>> 6dad0d803cdb2498e58b360c22d2c7971b199c19
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
<<<<<<< HEAD
    title: item.title?.trim() || `Hình ảnh #${index + 1}`,
    section: item.section?.trim() || "Thư viện",
=======
    title: item.title?.trim() || `Hinh anh #${index + 1}`,
    section: item.section?.trim() || "Thu vien",
>>>>>>> 6dad0d803cdb2498e58b360c22d2c7971b199c19
    imageUrl,
    createdAt: item.createdAt,
  };
}

export default function ThuVienPage() {
<<<<<<< HEAD
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://phuongxa-api-backend-fuc4gzgyauanbhc7.southeastasia-01.azurewebsites.net/api";
=======
  const apiBaseUrl = API_BASE_URL;
>>>>>>> 6dad0d803cdb2498e58b360c22d2c7971b199c19

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

<<<<<<< HEAD
=======
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

>>>>>>> 6dad0d803cdb2498e58b360c22d2c7971b199c19
  useEffect(() => {
    let isMounted = true;

    const fetchGallery = async () => {
      setIsLoading(true);
      setError(null);

      try {
<<<<<<< HEAD
        const response = await fetch(`${apiBaseUrl}/Gallery`, {
=======
        const response = await fetch(`${apiBaseUrl}/api/Gallery`, {
>>>>>>> 6dad0d803cdb2498e58b360c22d2c7971b199c19
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
<<<<<<< HEAD
          throw new Error(`Không thể tải danh sách ảnh (HTTP ${response.status}).`);
=======
          throw new Error(
            `Khong the tai danh sach anh (HTTP ${response.status}).`,
          );
>>>>>>> 6dad0d803cdb2498e58b360c22d2c7971b199c19
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
<<<<<<< HEAD
              : "Không thể tải danh sách ảnh lúc này."
=======
              : "Khong the tai danh sach anh luc nay.",
>>>>>>> 6dad0d803cdb2498e58b360c22d2c7971b199c19
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

<<<<<<< HEAD
  const totalImages = useMemo(() => gallery.length, [gallery]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-8 rounded-2xl border bg-linear-to-r from-sky-50 via-white to-cyan-50 p-6 md:p-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">Thư viện Hình ảnh</h1>
        <p className="text-sm font-medium text-slate-600">Tổng số ảnh: {totalImages}</p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-500">
          Đang tải dữ liệu thư viện...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-600 shadow-sm">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && gallery.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-500">
          Chưa có ảnh nào trong thư viện.
        </div>
      ) : null}

      {!isLoading && !error && gallery.length > 0 ? (
        <div className="space-y-6 mt-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div 
                  className="relative h-60 w-full bg-slate-100 overflow-hidden group cursor-pointer"
                  onClick={() => setSelectedImage(item.imageUrl)}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback hiển thị ảnh mặc định khi bị 404 để không vỡ UI
                      e.currentTarget.src = '/empty.jpg';
                      e.currentTarget.onerror = null; // Tránh lặp vô hạn nếu ảnh fallback cũng lỗi
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium">Bấm để xem ảnh lớn</span>
                  </div>
                </div>
                <div className="space-y-2 p-5 bg-white">
                  <h2 className="line-clamp-1 text-lg font-semibold text-slate-900">{item.title}</h2>
                  <p className="text-sm font-medium text-sky-600 bg-sky-50 inline-block px-2.5 py-0.5 rounded-full capitalize">{item.section?.replace(/-/g, " ")}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
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
=======
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
          <div className="space-y-8">
            {galleryByFolder.map((group) => (
              <div key={group.folderName} className="space-y-4">
                <div className="flex items-end justify-between border-b pb-2">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    {group.folderName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {group.items.length} ảnh
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => (
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
              </div>
            ))}
          </div>
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
>>>>>>> 6dad0d803cdb2498e58b360c22d2c7971b199c19
    </div>
  );
}
