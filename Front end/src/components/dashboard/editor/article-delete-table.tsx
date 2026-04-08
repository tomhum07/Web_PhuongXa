"use client";

import * as React from "react";
import { Loader2, RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteArticle, getArticles } from "@/lib/api/article";
import { type Article } from "@/types";

function normalizeStatus(status?: string): string {
  return (status || "").trim().toLowerCase();
}

function isPublishedStatus(status?: string): boolean {
  const value = normalizeStatus(status);
  return (
    value === "published" ||
    value === "publish" ||
    value === "da xuat ban" ||
    value === "đã xuất bản" ||
    value === "xuat ban" ||
    value === "xuất bản"
  );
}

function isDraftOrPendingStatus(status?: string): boolean {
  const value = normalizeStatus(status);

  if (!value) {
    return true;
  }

  return (
    value === "draft" ||
    value === "pendingapproval" ||
    value === "pending" ||
    value === "awaitingapproval" ||
    value === "cho duyet" ||
    value === "chờ duyệt"
  );
}

function getStatusBadge(status?: string): { label: string; className: string } {
  const value = normalizeStatus(status);

  if (value === "draft") {
    return {
      label: "Nháp",
      className: "bg-slate-100 text-slate-700 border-slate-200",
    };
  }

  return {
    label: "Chờ duyệt",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  };
}

function formatDate(date?: string): string {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("vi-VN");
}

interface ArticleDeleteTableProps {
  initialArticles?: Article[];
}

export function ArticleDeleteTable({
  initialArticles = [],
}: ArticleDeleteTableProps) {
  const [articles, setArticles] = React.useState<Article[]>(initialArticles);
  const [isLoading, setIsLoading] = React.useState(
    initialArticles.length === 0,
  );
  const [processingArticleId, setProcessingArticleId] = React.useState<
    number | null
  >(null);

  const loadArticles = React.useCallback(async () => {
    setIsLoading(true);

    try {
      const data = (await getArticles()) as Article[];
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Cannot load articles", error);
      toast.error("Không thể tải danh sách bài viết.");
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (initialArticles.length === 0) {
      void loadArticles();
    }
  }, [initialArticles.length, loadArticles]);

  const deletableArticles = React.useMemo(
    () => articles.filter((article) => isDraftOrPendingStatus(article.status)),
    [articles],
  );

  const handleDeleteArticle = React.useCallback(
    async (article: Article) => {
      if (processingArticleId !== null) {
        return;
      }

      if (isPublishedStatus(article.status)) {
        toast.error("Không thể xoá bài viết đã xuất bản.");
        return;
      }

      const canDelete = isDraftOrPendingStatus(article.status);
      if (!canDelete) {
        toast.error("Chỉ được xoá bài viết nháp hoặc đang chờ duyệt.");
        return;
      }

      const confirmed = window.confirm(
        `Bạn có chắc muốn xoá bài viết \"${article.title}\" không?`,
      );

      if (!confirmed) {
        return;
      }

      setProcessingArticleId(article.articleId);

      try {
        await deleteArticle(article.articleId);
        setArticles((prev) =>
          prev.filter((item) => item.articleId !== article.articleId),
        );
        toast.success("Đã xoá bài viết thành công.");
      } catch (error) {
        console.error("Cannot delete article", error);
        toast.error("Không thể xoá bài viết.");
      } finally {
        setProcessingArticleId(null);
      }
    },
    [processingArticleId],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          onClick={() => void loadArticles()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCcw className="size-4" />
          )}
          Làm mới
        </Button>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : deletableArticles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  Không có bài viết nháp hoặc chờ duyệt để xoá.
                </TableCell>
              </TableRow>
            ) : (
              deletableArticles.map((article) => {
                const statusUi = getStatusBadge(article.status);
                const isProcessing = processingArticleId === article.articleId;

                return (
                  <TableRow key={article.articleId}>
                    <TableCell className="font-medium">
                      #{article.articleId}
                    </TableCell>
                    <TableCell className="max-w-[320px] truncate">
                      {article.title}
                    </TableCell>
                    <TableCell>
                      {article.authorName || `ID: ${article.authorId}`}
                    </TableCell>
                    <TableCell>
                      {article.categoryName || `ID: ${article.categoryId}`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusUi.className}>
                        {statusUi.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(article.createdAt)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isProcessing}
                        onClick={() => void handleDeleteArticle(article)}
                      >
                        {isProcessing ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                        Xoá bài viết
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
