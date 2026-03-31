"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UploadStatus = {
  type: "success" | "error";
  message: string;
};

type UploadApiResponse = {
  message?: string;
  fileUrl?: string;
  imageUrl?: string;
  url?: string;
  path?: string;
};

export function ContentUploadForm() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5265";

  const [section, setSection] = useState("");
  const [title, setTitle] = useState("");
  const [uploaderId, setUploaderId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<UploadStatus | null>(null);

  const uploaderIdAsNumber = useMemo(() => Number(uploaderId), [uploaderId]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatus({
        type: "error",
        message: "Vui long chon dung dinh dang anh.",
      });
      event.target.value = "";
      setSelectedFile(null);
      setPreviewUrl("");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStatus({
        type: "error",
        message: "Anh vuot qua gioi han 10MB.",
      });
      event.target.value = "";
      setSelectedFile(null);
      setPreviewUrl("");
      return;
    }

    setStatus(null);
    setSelectedFile(file);
    setPreviewUrl((previousPreview) => {
      if (previousPreview) {
        URL.revokeObjectURL(previousPreview);
      }
      return URL.createObjectURL(file);
    });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setUploadedImageUrl("");

    if (!selectedFile) {
      setStatus({
        type: "error",
        message: "Vui long chon anh truoc khi upload.",
      });
      return;
    }

    if (!section.trim() || !title.trim()) {
      setStatus({
        type: "error",
        message: "Section va Title khong duoc de trong.",
      });
      return;
    }

    if (!Number.isInteger(uploaderIdAsNumber) || uploaderIdAsNumber <= 0) {
      setStatus({
        type: "error",
        message: "UploaderId phai la so nguyen duong.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("File", selectedFile);
    formData.append("Section", section.trim());
    formData.append("Title", title.trim());
    formData.append("UploaderId", String(uploaderIdAsNumber));

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/Gallery/upload`, {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | UploadApiResponse
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "Upload that bai.");
      }

      const returnedImageUrl =
        payload?.fileUrl ??
        payload?.imageUrl ??
        payload?.url ??
        payload?.path ??
        "";

      setUploadedImageUrl(returnedImageUrl);
      setStatus({
        type: "success",
        message: payload?.message || "Upload anh thanh cong.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Khong the upload anh luc nay.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6 rounded-lg border bg-card p-4">
      <h2 className="mb-4 text-xl font-semibold">Upload anh Gallery</h2>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="section">Section</Label>
          <Input
            id="section"
            value={section}
            onChange={(event) => setSection(event.target.value)}
            placeholder="Vi du: Noi dung"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ten anh"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="uploader-id">UploaderId</Label>
          <Input
            id="uploader-id"
            type="number"
            min={1}
            value={uploaderId}
            onChange={(event) => setUploaderId(event.target.value)}
            placeholder="Nhap id nguoi upload"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="image-file">File</Label>
          <Input
            id="image-file"
            type="file"
            accept="image/*"
            onChange={onFileChange}
          />
        </div>

        {previewUrl ? (
          <div className="md:col-span-2">
            <p className="mb-2 text-sm text-muted-foreground">Preview</p>
            <div className="relative h-48 w-full overflow-hidden rounded-md border md:w-2/3">
              <Image
                src={previewUrl}
                alt="Preview upload"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

        <div className="md:col-span-2 flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Dang upload..." : "Upload anh"}
          </Button>
          {status ? (
            <p
              className={`text-sm ${
                status.type === "success" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {status.message}
            </p>
          ) : null}
        </div>

        {uploadedImageUrl ? (
          <div className="md:col-span-2 rounded-md border bg-muted/20 p-3 text-sm">
            <p className="mb-1 font-medium">URL anh tu server</p>
            <a
              href={uploadedImageUrl}
              target="_blank"
              rel="noreferrer"
              className="break-all text-primary underline"
            >
              {uploadedImageUrl}
            </a>
          </div>
        ) : null}
      </form>
    </div>
  );
}
