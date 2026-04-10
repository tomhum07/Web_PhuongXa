export type Feedback = {
  feedbackId: number;
  senderName: string;
  email: string;
  content: string;
  replyContent?: string;
  status: string;
  createdAt?: string;
  repliedById?: number;
  repliedByName?: string;
};

export type FeedbackStatus = "Chưa đọc" | "Đã đọc" | "Đã phản hồi";

import { API_PREFIX } from "@/lib/api/config";

type MessageResponse = {
  Message?: string;
  message?: string;
};

function extractMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  const record = data as MessageResponse;
  return record.Message || record.message || fallback;
}

function normalizeFeedbackStatus(status: string): FeedbackStatus {
  const normalized = status.trim().toLowerCase();

  if (
    normalized.includes("chua doc") ||
    normalized.includes("chưa đọc") ||
    normalized.includes("cho xu ly") ||
    normalized.includes("chờ xử lý") ||
    normalized.includes("unread")
  ) {
    return "Chưa đọc";
  }

  if (
    normalized.includes("da doc") ||
    normalized.includes("đã đọc") ||
    normalized.includes("read")
  ) {
    return "Đã đọc";
  }

  if (
    normalized.includes("da phan hoi") ||
    normalized.includes("đã phản hồi") ||
    normalized.includes("phan hoi") ||
    normalized.includes("phản hồi") ||
    normalized.includes("replied")
  ) {
    return "Đã phản hồi";
  }

  return status as FeedbackStatus;
}

function toBackendFeedbackStatus(status: string): string {
  const normalized = normalizeFeedbackStatus(status);

  switch (normalized) {
    case "Chưa đọc":
      return "Chua doc";
    case "Đã đọc":
      return "Da doc";
    case "Đã phản hồi":
      return "Da phan hoi";
    default:
      return status;
  }
}

export async function getFeedbacks(params?: {
  keyword?: string;
  status?: string;
}): Promise<Feedback[]> {
  const searchParams = new URLSearchParams();
  if (params?.keyword?.trim()) {
    searchParams.set("keyword", params.keyword.trim());
  }
  if (params?.status?.trim()) {
    searchParams.set("status", params.status.trim());
  }

  const queryString = searchParams.toString();
  const url = `${API_PREFIX}/admin/feedbacks${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractMessage(data, "Không thể tải danh sách phản hồi."));
  }

  return Array.isArray(data) ? (data as Feedback[]) : [];
}

export async function updateFeedbackStatus(
  id: number,
  status: string,
): Promise<{ message: string }> {
  const backendStatus = toBackendFeedbackStatus(status);

  const response = await fetch(`${API_PREFIX}/admin/feedbacks/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ status: backendStatus }),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      extractMessage(data, "Không thể cập nhật trạng thái phản hồi."),
    );
  }

  return {
    message: extractMessage(data, "Cập nhật trạng thái thành công."),
  };
}
