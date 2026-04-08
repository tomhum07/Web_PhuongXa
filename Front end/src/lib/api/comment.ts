import { API_PREFIX } from "@/lib/api/config";

export type ArticleComment = {
  commentId: number;
  articleId: number;
  userId: number;
  userName: string;
  content: string;
  status: number;
  hiddenById: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type CreateCommentPayload = {
  articleId: number;
  userId: number;
  content: string;
};

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as Record<string, unknown>;
}

function pickString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      return value;
    }
  }

  return "";
}

function pickNumber(record: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = record[key];
    const num = Number(value);
    if (Number.isFinite(num)) {
      return num;
    }
  }

  return 0;
}

function pickNullableNumber(
  record: Record<string, unknown>,
  keys: string[],
): number | null {
  for (const key of keys) {
    const value = record[key];
    if (value === null || typeof value === "undefined") {
      continue;
    }

    const num = Number(value);
    if (Number.isFinite(num)) {
      return num;
    }
  }

  return null;
}

function normalizeComment(value: unknown): ArticleComment | null {
  const record = toRecord(value);
  if (!record) {
    return null;
  }

  const statusRaw = pickNumber(record, ["status", "Status"]);

  return {
    commentId: pickNumber(record, ["commentId", "CommentId"]),
    articleId: pickNumber(record, ["articleId", "ArticleId"]),
    userId: pickNumber(record, ["userId", "UserId"]),
    userName: pickString(record, ["userName", "UserName"]),
    content: pickString(record, ["content", "Content"]),
    status: statusRaw === 0 ? 0 : 1,
    hiddenById: pickNullableNumber(record, ["hiddenById", "HiddenById"]),
    createdAt: pickString(record, ["createdAt", "CreatedAt"]) || null,
    updatedAt: pickString(record, ["updatedAt", "UpdatedAt"]) || null,
  };
}

export async function getCommentsByArticle(
  articleId: number,
  signal?: AbortSignal,
): Promise<ArticleComment[]> {
  const response = await fetch(`${API_PREFIX}/Comment/article/${articleId}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch comments: ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => normalizeComment(item))
    .filter((item): item is ArticleComment => item !== null);
}

export async function createComment(
  payload: CreateCommentPayload,
): Promise<ArticleComment> {
  const response = await fetch(`${API_PREFIX}/Comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data: unknown = await response.json().catch(() => null);
  const responseRecord = toRecord(data);

  if (!response.ok) {
    const message =
      pickString(responseRecord ?? {}, ["message", "Message"]) ||
      "Không thể gửi bình luận.";
    throw new Error(message);
  }

  const commentRaw = responseRecord?.Comment ?? responseRecord?.comment;
  const comment = normalizeComment(commentRaw);

  if (!comment) {
    throw new Error("Đã gửi bình luận nhưng không nhận được dữ liệu hợp lệ.");
  }

  return comment;
}
