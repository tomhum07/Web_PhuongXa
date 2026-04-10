import { API_PREFIX } from "@/lib/api/config";

export type CreateFeedbackPayload = {
  fullName: string;
  email: string;
  phoneNumber?: string;
  content: string;
};

type FeedbackResponse = {
  Message?: string;
  message?: string;
};

function getMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  const record = data as FeedbackResponse;
  return record.Message || record.message || fallback;
}

export async function createFeedback(
  payload: CreateFeedbackPayload,
): Promise<{ message: string }> {
  const response = await fetch(`${API_PREFIX}/Feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      fullName: payload.fullName,
      email: payload.email,
      phoneNumber: payload.phoneNumber || "",
      content: payload.content,
    }),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      getMessage(
        data,
        "Không thể gửi phản ánh/kiến nghị. Vui lòng thử lại sau.",
      ),
    );
  }

  return {
    message: getMessage(data, "Gửi phản ánh/kiến nghị thành công."),
  };
}
