"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUserId, getAuthProfile } from "@/lib/auth";
import {
  ArticleComment,
  createComment,
  getCommentsByArticle,
} from "@/lib/api/comment";

type ArticleCommentsProps = {
  articleId: number;
  initialComments?: ArticleComment[];
};

function formatCreatedAt(value: string | null): string {
  if (!value) {
    return "Vừa xong";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Vừa xong";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

function getInitials(name: string): string {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return "U";
  }

  const words = trimmedName.split(/\s+/).slice(0, 2);
  return words.map((word) => word.charAt(0).toUpperCase()).join("");
}

function getVisibleComments(comments: ArticleComment[]): ArticleComment[] {
  return comments.filter((item) => item.status === 1);
}

export function ArticleComments({
  articleId,
  initialComments = [],
}: ArticleCommentsProps) {
  const visibleInitialComments = useMemo(
    () => getVisibleComments(initialComments),
    [initialComments],
  );
  const pathname = usePathname();
  const [comments, setComments] = useState<ArticleComment[]>(
    visibleInitialComments,
  );
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(
    visibleInitialComments.length === 0,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<{
    isLoggedIn: boolean;
    currentUserId: number | null;
    currentUserName: string;
  }>({
    isLoggedIn: false,
    currentUserId: null,
    currentUserName: "Bạn",
  });

  const { isLoggedIn, currentUserId, currentUserName } = authState;

  useEffect(() => {
    const authProfile = getAuthProfile();
    const userId = getCurrentUserId();
    const loggedIn = typeof userId === "number" && userId > 0;

    setAuthState({
      isLoggedIn: loggedIn,
      currentUserId: loggedIn ? userId : null,
      currentUserName: authProfile?.fullName?.trim() || "Bạn",
    });
  }, []);

  useEffect(() => {
    setComments(visibleInitialComments);
    setLoadError(null);
    setIsLoading(visibleInitialComments.length === 0);
  }, [articleId, visibleInitialComments]);

  useEffect(() => {
    const controller = new AbortController();
    const hasInitialComments = visibleInitialComments.length > 0;

    async function loadComments() {
      if (!hasInitialComments) {
        setIsLoading(true);
      }

      const maxAttempts = hasInitialComments ? 1 : 2;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const result = await getCommentsByArticle(
            articleId,
            controller.signal,
          );
          setComments(getVisibleComments(result));
          setLoadError(null);
          setIsLoading(false);
          return;
        } catch (error) {
          if (controller.signal.aborted) {
            return;
          }

          const isAbortError =
            error instanceof DOMException && error.name === "AbortError";
          if (isAbortError) {
            return;
          }

          const isLastAttempt = attempt === maxAttempts;
          if (!isLastAttempt) {
            await new Promise((resolve) => setTimeout(resolve, 400));
            continue;
          }

          if (!hasInitialComments) {
            setLoadError("Không thể tải bình luận. Vui lòng thử lại sau.");
          }
        } finally {
          const isLastAttempt = attempt === maxAttempts;
          if (isLastAttempt && !controller.signal.aborted) {
            setIsLoading(false);
          }
        }
      }
    }

    loadComments();

    return () => controller.abort();
  }, [articleId, visibleInitialComments]);

  const loginHref = useMemo(() => {
    const callbackPath = pathname || "/";
    return `/dang-nhap?callbackUrl=${encodeURIComponent(callbackPath)}`;
  }, [pathname]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLoggedIn || !currentUserId) {
      toast.error("Vui lòng đăng nhập để bình luận.");
      return;
    }

    const normalizedContent = content.trim();
    if (!normalizedContent) {
      toast.error("Vui lòng nhập nội dung bình luận.");
      return;
    }

    setIsSubmitting(true);

    try {
      const newComment = await createComment({
        articleId,
        userId: currentUserId,
        content: normalizedContent,
      });

      setComments((previous) => [newComment, ...previous]);
      setContent("");
      toast.success("Đã gửi bình luận thành công.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể gửi bình luận. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div id="comments" className="mx-auto max-w-3xl px-4 py-6">
        <h2 className="text-2xl font-bold">Bình luận</h2>
        <div className="my-5 flex items-center pl-3 h-13 border-l-3 border-pink-500 text-muted-foreground bg-muted rounded-xl">
          Chia sẻ bình luận của bạn về tin tức này!
        </div>
        {isLoggedIn ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Nhập bình luận của bạn..."
              maxLength={1000}
              rows={4}
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                Đăng với tên: {currentUserName}
              </span>
              <Button
                className="bg-pink-600"
                type="submit"
                disabled={isSubmitting || !content.trim()}
              >
                {isSubmitting ? "Đang gửi..." : "Gửi bình luận"}
              </Button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-muted-foreground">
            Bạn cần đăng nhập để bình luận.{" "}
            <Link
              href={loginHref}
              className="font-medium text-primary underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              Đang tải bình luận...
            </p>
          ) : loadError ? (
            <p className="text-sm text-destructive">{loadError}</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ ý kiến.
            </p>
          ) : (
            comments.map((comment) => (
              <article
                key={comment.commentId}
                className="rounded-xl border border-border bg-background p-4 my-5"
              >
                <div className="mb-2 flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback>
                      {getInitials(comment.userName || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">
                      {comment.userName || "Người dùng"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCreatedAt(comment.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {comment.content}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
