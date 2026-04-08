"use client";

import { useState, useEffect } from "react";
import { Article, Category } from "@/types";
import { ArticleEditForm } from "@/components/dashboard/editor/article-edit-form";
import { getArticleById } from "@/lib/api/article";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ArticleEditFormPageProps {
  articles: Article[];
  categories: Category[];
}

export function ArticleEditFormPage({
  articles,
  categories,
}: ArticleEditFormPageProps) {
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
    null,
  );
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadArticleDetail = async () => {
      if (!selectedArticleId) {
        setSelectedArticle(null);
        setLoadError(null);
        return;
      }

      setIsLoadingArticle(true);
      setLoadError(null);
      setSelectedArticle(null);

      try {
        const detail = await getArticleById(selectedArticleId);

        if (!mounted) {
          return;
        }

        if (!detail) {
          setLoadError("Không tìm thấy chi tiết bài viết.");
          return;
        }

        setSelectedArticle(detail as Article);
      } catch (error) {
        if (!mounted) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Không thể tải nội dung bài viết.",
        );
      } finally {
        if (mounted) {
          setIsLoadingArticle(false);
        }
      }
    };

    loadArticleDetail();

    return () => {
      mounted = false;
    };
  }, [selectedArticleId]);

  return (
    <div className="space-y-6">
      {/* Select bài viết */}
      <div className="rounded-lg border bg-white p-6">
        <div className="max-w-md">
          <Label htmlFor="article-select" className="mb-2 block">
            Chọn bài viết để sửa *
          </Label>
          <Select
            value={selectedArticleId?.toString() || ""}
            onValueChange={(value) => setSelectedArticleId(parseInt(value))}
          >
            <SelectTrigger id="article-select">
              <SelectValue placeholder="-- Chọn bài viết --" />
            </SelectTrigger>
            <SelectContent>
              {articles.length === 0 ? (
                <SelectItem key="no-articles" value="none">
                  <div className="flex flex-col">
                    <span>Bạn chưa có bài viết nào</span>
                    <span className="text-xs text-muted-foreground">
                      Bạn chưa có bài viết nào. Vui lòng tạo bài viết mới trước
                      khi sửa.
                    </span>
                  </div>
                </SelectItem>
              ) : (
                articles.map((article) => (
                  <SelectItem
                    key={article.articleId}
                    value={article.articleId.toString()}
                  >
                    <div className="flex flex-col">
                      <span>{article.title}</span>
                      <span className="text-xs text-muted-foreground">
                        ID: {article.articleId} • {article.status || "Draft"}
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Form sửa bài viết */}
      {isLoadingArticle ? (
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-muted-foreground">
            Đang tải nội dung bài viết...
          </p>
        </div>
      ) : loadError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-red-700">{loadError}</p>
        </div>
      ) : selectedArticle ? (
        <ArticleEditForm
          article={selectedArticle}
          categories={categories}
          onSuccess={() => {
            setSelectedArticleId(null);
          }}
        />
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-gray-500">
            Vui lòng chọn bài viết để bắt đầu chỉnh sửa
          </p>
        </div>
      )}
    </div>
  );
}
