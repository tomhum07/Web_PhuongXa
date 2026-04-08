"use client";
import { useRef } from "react";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Category, ArticleRequest } from "@/types";
import { createArticle, uploadArticleThumbnail } from "@/lib/api/article";
import { getCurrentUserId } from "@/lib/auth";
import { revalidateArticles } from "@/lib/articles/actions";
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

interface ArticleFormProps {
  categories: Category[];
  onSuccess?: () => void;
}

export function ArticleForm({ categories, onSuccess }: ArticleFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const currentUserId = getCurrentUserId();

  const editorRef = useRef<TinyEditorHandle | null>(null);
  const contentRef = useRef("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<ArticleRequest>({
    categoryId: 0,
    authorId: currentUserId ?? 0,
    title: "",
    summary: "",
    content: "",
    thumbnailUrl: "",
    status: "Draft",
  });

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
    setThumbnailFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!currentUserId) {
        setError(
          "Không xác định được tài khoản đăng nhập. Vui lòng đăng nhập lại.",
        );
        setLoading(false);
        return;
      }

      const payload: ArticleRequest = {
        ...formData,
        authorId: currentUserId,
        content: contentRef.current,
      };

      if (thumbnailFile) {
        const uploadedThumbnailUrl = await uploadArticleThumbnail(
          thumbnailFile,
          currentUserId,
          formData.title,
        );
        payload.thumbnailUrl = uploadedThumbnailUrl;
      }

      if (!payload.title || !payload.content || payload.categoryId === 0) {
        setError(
          "Vui lòng điền tất cả các trường bắt buộc (Tiêu đề, Danh mục, Nội dung)",
        );
        setLoading(false);
        return;
      }

      const result = await createArticle(payload);

      if (result) {
        setSuccess(true);
        setFormData({
          categoryId: 0,
          authorId: currentUserId,
          title: "",
          summary: "",
          content: "",
          thumbnailUrl: "",
          status: "Draft",
        });
        setThumbnailFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        contentRef.current = "";
        editorRef.current?.setContent("");

        // Revalidate dữ liệu từ server
        await revalidateArticles();

        onSuccess?.();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="mb-6 text-2xl font-bold">Thêm bài viết mới</h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          Bài viết được tạo thành công! Đang cập nhật dữ liệu...
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
          {/* <Textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Nhập nội dung bài viết"
            rows={6}
            required
          /> */}

          <TinyMCEEditor
            apiKey="lo22j7heipnhkk80mk7x7bqk9ibuus8tz5gqz145z52ymorj"
            onInit={(_evt: unknown, editor: TinyEditorHandle) => {
              editorRef.current = editor;
              contentRef.current = editor.getContent();
            }}
            initialValue=""
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
            <Label htmlFor="thumbnailFile">
              Ảnh thumbnail (không bắt buộc)
            </Label>
            <Input
              id="thumbnailFile"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleThumbnailFileChange}
            />
            {thumbnailFile && (
              <p className="mt-1 text-xs text-muted-foreground">
                Đã chọn: {thumbnailFile.name}
              </p>
            )}
            {formData.thumbnailUrl && (
              <p className="mt-1 break-all text-xs text-muted-foreground">
                URL ảnh: {formData.thumbnailUrl}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Trạng thái</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Nháp</SelectItem>
                <SelectItem value="PendingApproval">Chờ duyệt</SelectItem>
                <SelectItem value="Published">Xuất bản</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo bài viết"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                categoryId: 0,
                authorId: currentUserId ?? 0,
                title: "",
                summary: "",
                content: "",
                thumbnailUrl: "",
                status: "Draft",
              });
              setThumbnailFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
              contentRef.current = "";
              editorRef.current?.setContent("");
              setError(null);
            }}
          >
            Đặt lại
          </Button>
        </div>
      </form>
    </div>
  );
}
