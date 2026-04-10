"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  trackPublicApplication,
  type TrackedApplication,
} from "@/lib/api/procedure";
import { getDocumentViewerUrl } from "@/lib/utils/document-viewer";

function formatDate(dateValue: string | null) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateOnly(dateValue: string | null) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function normalizeApplicationCode(value: string) {
  return value.replace(/\s+/g, "").toUpperCase();
}

function getStatusStyle(status: string) {
  const base =
    "border px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1";

  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === "approved") {
    return {
      icon: CheckCircle2,
      className: base + " bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (normalizedStatus === "rejected") {
    return {
      icon: XCircle,
      className: base + " bg-rose-50 text-rose-700 border-rose-200",
    };
  }

  if (normalizedStatus === "processing") {
    return {
      icon: Clock3,
      className: base + " bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    icon: Clock3,
    className: base + " bg-slate-100 text-slate-700 border-slate-200",
  };
}

export function PublicApplicationTrackPage() {
  const [applicationCode, setApplicationCode] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<TrackedApplication | null>(null);
  const [isNotFound, setIsNotFound] = React.useState(false);
  const [submittedCode, setSubmittedCode] = React.useState<string>("");

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = normalizeApplicationCode(e.target.value);
    setApplicationCode(value);
    setErrorMessage(null);
    setIsNotFound(false);
  };

  const handleClear = () => {
    setApplicationCode("");
    setSubmittedCode("");
    setErrorMessage(null);
    setResult(null);
    setIsNotFound(false);
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const code = normalizeApplicationCode(applicationCode);

    if (!code) {
      setErrorMessage("Vui lòng nhập mã hồ sơ.");
      return;
    }

    if (code.length < 8) {
      setErrorMessage("Mã hồ sơ không hợp lệ.");
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);
    setResult(null);
    setIsNotFound(false);
    setSubmittedCode(code);

    try {
      const res = await trackPublicApplication(code);
      if (!res) {
        setIsNotFound(true);
        return;
      }
      setResult(res);
    } catch {
      setErrorMessage("Không thể tra cứu. Thử lại sau.");
    } finally {
      setIsSearching(false);
    }
  };

  const statusStyle = result ? getStatusStyle(result.status) : null;

  return (
    <main className="container mx-auto max-w-5xl space-y-8 px-4 py-12">
      {/* BACK */}
      <Button asChild variant="ghost" size="sm" className="w-fit px-0">
        <Link href="/dich-vu">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Link>
      </Button>

      {/* HEADER */}
      <section className="rounded-3xl border bg-linear-to-br from-white via-slate-50 to-slate-100 p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
          Tra cứu hồ sơ
        </h1>
        <p className="mt-3 text-slate-600">
          Nhập mã hồ sơ để kiểm tra trạng thái xử lý.
        </p>
      </section>

      {/* SEARCH */}
      <Card className="rounded-2xl shadow-sm hover:shadow-md transition">
        <CardHeader className="border-b bg-slate-50/80 backdrop-blur">
          <CardTitle>Tìm kiếm hồ sơ</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <Label>Mã hồ sơ</Label>
              <Input
                value={applicationCode}
                onChange={handleCodeChange}
                placeholder="HS-2026-0001"
                className="font-mono tracking-wider focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex gap-2 flex-col sm:flex-row">
              <Button
                type="submit"
                disabled={isSearching}
                className="bg-linear-to-r from-blue-600 to-blue-500 text-white"
              >
                {isSearching ? (
                  <Loader2 className="animate-spin mr-2 size-4" />
                ) : (
                  <Search className="mr-2 size-4" />
                )}
                Tra cứu
              </Button>

              <Button variant="outline" onClick={handleClear}>
                Xóa
              </Button>
            </div>
          </form>

          {errorMessage && (
            <div className="mt-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
              <AlertCircle size={16} />
              {errorMessage}
            </div>
          )}

          {isNotFound && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-700">
              Không tìm thấy: <strong>{submittedCode}</strong>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RESULT */}
      {result && statusStyle && (
        <Card className="rounded-2xl shadow-sm animate-in fade-in zoom-in-95">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle>Kết quả</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <Badge className={statusStyle.className}>
              <statusStyle.icon size={16} />
              {result.statusText}
            </Badge>

            <div className="grid gap-4 md:grid-cols-2">
              <Info label="Mã hồ sơ" value={result.applicationCode} mono />
              <Info label="Ngày nộp" value={formatDate(result.createdAt)} />
              <Info label="Người nộp" value={result.applicantName} />
              <Info label="CCCD" value={result.identityNumber} />
              <Info
                label="Ngày sinh"
                value={formatDateOnly(result.dateOfBirth)}
              />
            </div>

            <div className="rounded-xl bg-slate-50 p-5 space-y-2">
              <p>
                <strong>Lĩnh vực:</strong> {result.categoryName}
              </p>
              <p>
                <strong>Thủ tục:</strong> {result.serviceName}
              </p>
              <p>
                <strong>Địa chỉ:</strong> {result.address}
              </p>
            </div>

            {result.attachedFileUrl && (
              <Button asChild variant="outline">
                <Link
                  href={getDocumentViewerUrl(result.attachedFileUrl)}
                  target="_blank"
                >
                  Xem file
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  );
}

function Info({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 font-semibold ${mono ? "font-mono" : ""}`}>
        {value || "-"}
      </p>
    </div>
  );
}
