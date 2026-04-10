"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getFeedbacks,
  updateFeedbackStatus,
  Feedback,
} from "@/lib/api/admin-feedbacks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCheck,
  Clock3,
  Loader2,
  Mail,
  MessageSquareText,
  SendHorizonal,
} from "lucide-react";

const FEEDBACK_STATUS = {
  UNREAD: "Chưa đọc",
  READ: "Đã đọc",
  REPLIED: "Đã phản hồi",
} as const;

export function FeedbackTable() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState<number | null>(null);

  const normalizeStatusText = (s: string) => {
    if (!s) return "";
    const str = s.toLowerCase();
    if (str.includes("chua doc") || str.includes("chưa đọc"))
      return FEEDBACK_STATUS.UNREAD;
    if (str.includes("da doc") || str.includes("đã đọc"))
      return FEEDBACK_STATUS.READ;
    if (str.includes("phan hoi") || str.includes("phản hồi"))
      return FEEDBACK_STATUS.REPLIED;
    return s;
  };

  const statusSummary = useMemo(() => {
    let unread = 0;
    let read = 0;
    let replied = 0;

    for (const item of feedbacks) {
      const status = normalizeStatusText(item.status);
      if (status === FEEDBACK_STATUS.UNREAD) unread += 1;
      if (status === FEEDBACK_STATUS.READ) read += 1;
      if (status === FEEDBACK_STATUS.REPLIED) replied += 1;
    }

    return {
      total: feedbacks.length,
      unread,
      read,
      replied,
    };
  }, [feedbacks]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await getFeedbacks();
      setFeedbacks(res || []);
    } catch {
      toast.error("Không thể tải danh sách phản hồi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      setStatusLoading(id);
      await updateFeedbackStatus(id, newStatus);
      toast.success("Cập nhật trạng thái thành công");
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.feedbackId === id ? { ...f, status: newStatus } : f,
        ),
      );
    } catch {
      toast.error("Cập nhật trạng thái thất bại");
    } finally {
      setStatusLoading(null);
    }
  };

  const getStatusBadge = (rawStatus: string) => {
    const status = normalizeStatusText(rawStatus);
    switch (status) {
      case "Chưa đọc":
        return (
          <Badge className="border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100">
            <Clock3 className="mr-1 h-3.5 w-3.5" />
            Chưa đọc
          </Badge>
        );
      case "Đã đọc":
        return (
          <Badge className="border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100">
            <CheckCheck className="mr-1 h-3.5 w-3.5" />
            Đã đọc
          </Badge>
        );
      case "Đã phản hồi":
        return (
          <Badge className="border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
            <SendHorizonal className="mr-1 h-3.5 w-3.5" />
            Đã phản hồi
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getNextStatusAction = (rawStatus: string) => {
    const status = normalizeStatusText(rawStatus);
    if (status === FEEDBACK_STATUS.UNREAD) {
      return { nextStatus: FEEDBACK_STATUS.READ, label: "Đánh dấu đã đọc" };
    }
    if (status === FEEDBACK_STATUS.READ) {
      return {
        nextStatus: FEEDBACK_STATUS.REPLIED,
        label: "Đánh dấu đã phản hồi",
      };
    }
    return null;
  };

  return (
    <div className="relative flex flex-col gap-4 px-4 lg:px-6">
      <Card className="border-none bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-900 text-white ring-0">
        <CardContent className="grid gap-4 p-5 md:grid-cols-4 md:p-6">
          <div className="md:col-span-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/90">
              Hộp thư phản hồi
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              Danh sách phản hồi người dân
            </h2>
          </div>

          <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs text-cyan-100">Tổng phản hồi</p>
            <p className="mt-1 text-2xl font-semibold">{statusSummary.total}</p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs text-cyan-100">Chưa đọc</p>
            <p className="mt-1 text-2xl font-semibold">
              {statusSummary.unread}
            </p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs text-cyan-100">Đã đọc</p>
            <p className="mt-1 text-2xl font-semibold">{statusSummary.read}</p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs text-cyan-100">Đã phản hồi</p>
            <p className="mt-1 text-2xl font-semibold">
              {statusSummary.replied}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-muted/40">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead className="w-[200px]">Người gửi</TableHead>
              <TableHead className="w-[180px]">Liên hệ</TableHead>
              <TableHead className="w-[180px]">Ngày tạo</TableHead>
              <TableHead className="w-[150px]">Trạng thái</TableHead>
              <TableHead className="w-[150px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="mr-2 inline-block h-6 w-6 animate-spin" />
                  Đang tải danh sách phản hồi...
                </TableCell>
              </TableRow>
            ) : feedbacks.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Chưa có phản hồi nào từ người dùng
                </TableCell>
              </TableRow>
            ) : (
              feedbacks.map((item) => (
                <TableRow
                  key={item.feedbackId}
                  className="odd:bg-muted/15 hover:bg-cyan-50/40"
                >
                  <TableCell className="font-medium">
                    <span className="inline-flex rounded-full border bg-background px-2 py-1 text-xs font-semibold">
                      #{item.feedbackId}
                    </span>
                  </TableCell>
                  <TableCell
                    className="max-w-[360px] whitespace-normal"
                    title={item.content}
                  >
                    <div className="text-sm leading-6 text-foreground">
                      {item.content}
                    </div>
                    {item.replyContent && (
                      <div
                        className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-700"
                        title={item.replyContent}
                      >
                        <span className="font-semibold">Phản hồi:</span>{" "}
                        {item.replyContent}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      <MessageSquareText className="h-4 w-4 text-cyan-600" />
                      {item.senderName || "Ẩn danh"}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{item.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString("vi-VN")
                      : "Chưa rõ"}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell className="text-right">
                    {getNextStatusAction(item.status) ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="min-w-[140px]"
                        disabled={statusLoading === item.feedbackId}
                        onClick={() =>
                          handleStatusChange(
                            item.feedbackId,
                            getNextStatusAction(item.status)!.nextStatus,
                          )
                        }
                      >
                        {statusLoading === item.feedbackId && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {getNextStatusAction(item.status)!.label}
                      </Button>
                    ) : (
                      <span className="text-sm text-emerald-700 mr-2">
                        Hoàn tất
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
