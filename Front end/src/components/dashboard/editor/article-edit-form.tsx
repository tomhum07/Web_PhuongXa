"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Category, Article } from "@/types";
import { updateArticle, uploadArticleThumbnail } from "@/lib/api/article";
import { getCurrentUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

type TinyEditorHandle = {
  setContent: (content: string) => void;
  getContent: () => string;
};

type TinyMCEEditorProps = {
  apiKey?: string;
  onInit?: (evt: unknown, editor: TinyEditorHandle) => void;
  initialValue?: string;
  onEditorChange?: (content: string, editor: TinyEditorHandle) => void;
  init?: Record<string, unknown>;
};

const TinyMCEEditor = dynamic<TinyMCEEditorProps>(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  {
    ssr: false,
  },
);

interface ArticleEditFormProps {
  article: Article;
  categories: Category[];
  onSuccess?: () => void;
}

export function ArticleEditForm({
  article,
  categories,
  onSuccess,
}: ArticleEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewThumbnail, setPreviewThumbnail] = useState<string>(
    article.thumbnailUrl || "",
  );
  const currentUserId = getCurrentUserId();

  const editorRef = useRef<TinyEditorHandle | null>(null);
  const contentRef = useRef(article.content || "");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    categoryId: article.categoryId || 0,
    title: article.title || "",
    summary: article.summary || "",
    content: article.content || "",
    thumbnailUrl: article.thumbnailUrl || "",
    status: article.status || "Draft",
  });
  const [editorReady, setEditorReady] = useState(false);

  // Sync form + editor state when switching to another article.
  useEffect(() => {
    setFormData({
      categoryId: article.categoryId || 0,
      title: article.title || "",
      summary: article.summary || "",
      content: article.content || "",
      thumbnailUrl: article.thumbnailUrl || "",
      status: article.status || "Draft",
    });
    setPreviewThumbnail(article.thumbnailUrl || "");
    setThumbnailFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    contentRef.current = article.content || "";
    if (editorRef.current && editorReady) {
      editorRef.current.setContent(article.content || "");
    }
  }, [article.articleId, editorReady]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: parseInt(value),
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleThumbnailFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewThumbnail(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!formData.title || !contentRef.current || formData.categoryId === 0) {
        setError(
          "Vui lòng điền tất cả các trường bắt buộc (Tiêu đề, Danh mục, Nội dung)",
        );
        setLoading(false);
        return;
      }

      const payload = {
        categoryId: formData.categoryId,
        authorId: article.authorId,
        title: formData.title,
        summary: formData.summary,
        content: contentRef.current,
        thumbnailUrl: formData.thumbnailUrl,
        status: formData.status,
      };

      // Nếu có file thumbnail mới, upload trước
      if (thumbnailFile && currentUserId) {
        const uploadedThumbnailUrl = await uploadArticleThumbnail(
          thumbnailFile,
          currentUserId,
          formData.title,
        );
        payload.thumbnailUrl = uploadedThumbnailUrl;
      }

      const result = await updateArticle(article.articleId, payload);

      if (result) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          router.push("/editor");
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="mb-6 text-2xl font-bold">Sửa bài viết</h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          Bài viết được cập nhật thành công! Đang chuyển hướng...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="title" className="mb-1">
              Tiêu đề *
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Nhập tiêu đề bài viết"
              required
            />
          </div>

          <div>
            <Label htmlFor="categoryId" className="mb-1">
              Danh mục *
            </Label>
            <Select
              value={formData.categoryId.toString()}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">-- Chọn danh mục --</SelectItem>
                {categories.map((cat) => (
                  <SelectItem
                    key={cat.categoryId}
                    value={cat.categoryId.toString()}
                  >
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="summary" className="mb-1">
            Tóm tắt (không bắt buộc)
          </Label>
          <Textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleInputChange}
            placeholder="Nhập tóm tắt bài viết"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="content" className="mb-1">
            Nội dung *
          </Label>
          <TinyMCEEditor
            key={article.articleId}
            apiKey="lo22j7heipnhkk80mk7x7bqk9ibuus8tz5gqz145z52ymorj"
            onInit={(_evt: unknown, editor: TinyEditorHandle) => {
              editorRef.current = editor;
              setEditorReady(true);
            }}
            initialValue={formData.content}
            onEditorChange={(content: string) => {
              contentRef.current = content;
            }}
            init={{
              height: 500,
              menubar: "file edit view insert",
              selector: "textarea",
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "preview",
                "help",
                "wordcount",
              ],
              toolbar:
                "undo redo | blocks | " +
                "bold italic forecolor | alignleft aligncenter " +
                "alignright alignjustify | bullist numlist outdent indent | " +
                "removeformat | help",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="thumbnail" className="mb-1">
              Ảnh đại diện (không bắt buộc)
            </Label>
            <Input
              ref={fileInputRef}
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailFileChange}
            />
          </div>

          <div>
            <Label htmlFor="status" className="mb-1">
              Trạng thái
            </Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Nháp</SelectItem>
                <SelectItem value="PendingApproval">Chờ duyệt</SelectItem>
                <SelectItem value="Published">Xuất bản</SelectItem>
                <SelectItem value="Rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {previewThumbnail && (
          <div className="rounded-lg border p-4">
            <Label className="mb-2 block text-sm font-medium">
              Ảnh đại diện hiện tại:
            </Label>
            <div className="relative h-48 w-full overflow-hidden rounded-md bg-muted">
              <Image
                src={previewThumbnail}
                alt="Thumbnail preview"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
