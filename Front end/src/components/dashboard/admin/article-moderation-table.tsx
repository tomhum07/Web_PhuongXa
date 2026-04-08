"use client";

import * as React from "react";
import { toast } from "sonner";
import { Eye, Loader2, Trash2 } from "lucide-react";

import {
  deleteArticle,
  getArticleById,
  getAdminArticles,
  updateArticle,
} from "@/lib/api/article";
import { type Article } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PUBLISHED_STATUS = "Published";
const REJECTED_STATUS = "Rejected";

type TabValue = "pending" | "published";
type ModerateAction = "publish" | "reject";

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

function isPendingStatus(status?: string): boolean {
  const value = normalizeStatus(status);
  if (!value) {
    return true;
  }

  return (
    value === "pendingapproval" ||
    value === "pending" ||
    value === "draft" ||
    value === "cho duyet" ||
    value === "chờ duyệt" ||
    value === "awaitingapproval"
  );
}

function getStatusUi(status?: string): { label: string; className: string } {
  if (isPublishedStatus(status)) {
    return {
      label: "Đã xuất bản",
      className: "bg-green-100 text-green-700 border-green-200",
    };
  }

  const value = normalizeStatus(status);
  if (value === "rejected" || value === "tu choi" || value === "từ chối") {
    return {
      label: "Từ chối",
      className: "bg-red-100 text-red-700 border-red-200",
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

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("vi-VN");
}

export function ArticleModerationTable() {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [activeTab, setActiveTab] = React.useState<TabValue>("pending");
  const [isLoading, setIsLoading] = React.useState(true);
  const [processingArticleId, setProcessingArticleId] = React.useState<
    number | null
  >(null);
  const [detailArticle, setDetailArticle] = React.useState<Article | null>(
    null,
  );
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  const loadArticles = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = (await getAdminArticles()) as Article[];
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
    void loadArticles();
  }, [loadArticles]);

  const pendingArticles = React.useMemo(
    () => articles.filter((article) => isPendingStatus(article.status)),
    [articles],
  );

  const publishedArticles = React.useMemo(
    () => articles.filter((article) => isPublishedStatus(article.status)),
    [articles],
  );

  const openDetail = React.useCallback(async (articleId: number) => {
    try {
      const detail = (await getArticleById(articleId)) as Article | null;
      if (!detail) {
        toast.error("Không tìm thấy chi tiết bài viết.");
        return;
      }

      setDetailArticle(detail);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Cannot get article detail", error);
      toast.error("Không tải được chi tiết bài viết.");
    }
  }, []);

  const moderateArticle = React.useCallback(
    async (articleId: number, action: ModerateAction) => {
      if (processingArticleId !== null) {
        return;
      }

      setProcessingArticleId(articleId);

      try {
        const detail = (await getArticleById(articleId)) as Article | null;
        if (!detail) {
          toast.error("Không tìm thấy bài viết để cập nhật.");
          return;
        }

        if (
          !detail.categoryId ||
          !detail.authorId ||
          !detail.title ||
          !detail.content
        ) {
          toast.error("Dữ liệu bài viết không đầy đủ để cập nhật trạng thái.");
          return;
        }

        const nextStatus =
          action === "publish" ? PUBLISHED_STATUS : REJECTED_STATUS;

        await updateArticle(articleId, {
          categoryId: detail.categoryId,
          authorId: detail.authorId,
          title: detail.title,
          summary: detail.summary,
          content: detail.content,
          thumbnailUrl: detail.thumbnailUrl,
          status: nextStatus,
        });

        setArticles((prev) =>
          prev.map((item) =>
            item.articleId === articleId
              ? { ...item, status: nextStatus }
              : item,
          ),
        );

        toast.success(
          action === "publish"
            ? "Đã xuất bản bài viết thành công."
            : "Đã từ chối bài viết thành công.",
        );
      } catch (error) {
        console.error("Cannot moderate article", error);
        toast.error("Không thể cập nhật trạng thái bài viết.");
      } finally {
        setProcessingArticleId(null);
      }
    },
    [processingArticleId],
  );

  const handleDeleteArticle = React.useCallback(
    async (articleId: number, status?: string) => {
      if (processingArticleId !== null) {
        return;
      }

      if (!isPublishedStatus(status)) {
        toast.error("Chỉ có thể xóa bài viết đã duyệt.");
        return;
      }

      const confirmed = window.confirm(
        "Bạn có chắc chắn muốn xóa bài viết này không?",
      );

      if (!confirmed) {
        return;
      }

      setProcessingArticleId(articleId);

      try {
        await deleteArticle(articleId);

        setArticles((prev) =>
          prev.filter((item) => item.articleId !== articleId),
        );
        setDetailArticle((prev) =>
          prev?.articleId === articleId ? null : prev,
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

  const renderRows = React.useCallback(
    (items: Article[], allowModeration: boolean) => {
      if (isLoading) {
        return (
          <TableRow>
            <TableCell
              colSpan={7}
              className="text-center text-muted-foreground"
            >
              Đang tải dữ liệu...
            </TableCell>
          </TableRow>
        );
      }

      if (items.length === 0) {
        return (
          <TableRow>
            <TableCell
              colSpan={7}
              className="text-center text-muted-foreground"
            >
              Không có bài viết phù hợp.
            </TableCell>
          </TableRow>
        );
      }

      return items.map((article) => {
        const statusUi = getStatusUi(article.status);
        const isProcessing = processingArticleId === article.articleId;

        return (
          <TableRow key={article.articleId}>
            <TableCell className="font-medium">#{article.articleId}</TableCell>
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
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void openDetail(article.articleId)}
                >
                  <Eye className="size-4" />
                  Xem chi tiết
                </Button>
                {allowModeration ? (
                  <>
                    <Button
                      size="sm"
                      disabled={isProcessing}
                      onClick={() =>
                        void moderateArticle(article.articleId, "publish")
                      }
                      className="text-green-600 bg-green-100"
                    >
                      {isProcessing ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : null}
                      Xuất bản
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isProcessing}
                      onClick={() =>
                        void moderateArticle(article.articleId, "reject")
                      }
                    >
                      {isProcessing ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : null}
                      Từ chối
                    </Button>
                  </>
                ) : null}
                {!allowModeration ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    disabled={isProcessing}
                    onClick={() =>
                      void handleDeleteArticle(
                        article.articleId,
                        article.status,
                      )
                    }
                  >
                    {isProcessing ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                    Xoá
                  </Button>
                ) : null}
              </div>
            </TableCell>
          </TableRow>
        );
      });
    },
    [
      handleDeleteArticle,
      isLoading,
      moderateArticle,
      openDetail,
      processingArticleId,
    ],
  );

  return (
    <>
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabValue)}
        className="w-full"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="pending">
              Chờ duyệt ({pendingArticles.length})
            </TabsTrigger>
            <TabsTrigger value="published">
              Đã xuất bản ({publishedArticles.length})
            </TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            onClick={() => void loadArticles()}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            Làm mới
          </Button>
        </div>

        <TabsContent value="pending">
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
              <TableBody>{renderRows(pendingArticles, true)}</TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="published">
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
              <TableBody>{renderRows(publishedArticles, false)}</TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Chi tiết bài viết</SheetTitle>
            <SheetDescription>
              Xem thông tin đầy đủ trước khi duyệt hoặc từ chối.
            </SheetDescription>
          </SheetHeader>

          {detailArticle ? (
            <div className="space-y-5 px-4 pb-4 text-base leading-7">
              <div>
                <p className="text-sm text-muted-foreground">Tiêu đề</p>
                <p className="font-semibold">{detailArticle.title}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tóm tắt</p>
                <p>{detailArticle.summary || "-"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Tác giả</p>
                <p>
                  {detailArticle.authorName || `ID: ${detailArticle.authorId}`}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Danh mục</p>
                <p>
                  {detailArticle.categoryName ||
                    `ID: ${detailArticle.categoryId}`}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Nội dung</p>
                <div className="rounded-md border p-4 prose prose-base max-w-none min-h-80">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: detailArticle.content || "",
                    }}
                  />
                </div>
              </div>
            </div>
          ) : null}

          <SheetFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Đóng
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
