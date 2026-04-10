"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileSearch, RefreshCcw, Search } from "lucide-react";

import { SidebarAdmin } from "@/components/dashboard/admin/sidebar-admin";
import { SiteHeaderAdmin } from "@/components/dashboard/admin/site-header-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  fetchAdminApplications,
  updateAdminApplicationStatus,
} from "@/lib/api/admin-applications";
import { getDocumentViewerUrl } from "@/lib/utils/document-viewer";
type BackendApplicationStatus =
  | "Submitted"
  | "Processing"
  | "Approved"
  | "Rejected";

type StatusFilter = "all" | ApplicationStatusCode;

type ApplicationStatusCode =
  | "da nop"
  | "dang xu ly"
  | "da giai quyet"
  | "tu choi";

type ManagedApplication = {
  id: number | string;
  applicationCode: string;
  serviceCode: string;
  serviceName: string;
  categoryName: string;
  applicantName: string;
  identityNumber: string;
  dateOfBirth: string;
  address: string;
  attachedFileUrl: string;
  createdAt: string;
  handlerId: number | string | null;
  statusRaw: string;
  statusText: string;
  statusCode: ApplicationStatusCode;
  statusLabel: string;
};

function toArray<T>(input: unknown): T[] {
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    if (Array.isArray(obj.value)) return obj.value as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
}

function readString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function readNumberOrString(
  record: Record<string, unknown>,
  keys: string[],
): number | string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" || typeof value === "string") {
      return value;
    }
  }
  return null;
}

function normalizeDateValue(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDateTime(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function normalizeStatus(
  rawStatus: unknown,
  statusText: string,
): {
  statusCode: ApplicationStatusCode;
  statusLabel: string;
} {
  const raw = String(rawStatus ?? "")
    .trim()
    .toLowerCase();
  const text = statusText.trim().toLowerCase();
  const combined = `${raw} ${text}`;

  if (
    raw === "submitted" ||
    combined.includes("da nop") ||
    combined.includes("đã nộp") ||
    combined.includes("cho tiep nhan") ||
    combined.includes("chờ tiếp nhận")
  ) {
    return { statusCode: "da nop", statusLabel: "Đã nộp" };
  }

  if (
    raw === "processing" ||
    raw === "inprogress" ||
    raw === "in progress" ||
    combined.includes("đang xử lý") ||
    combined.includes("dang xu ly")
  ) {
    return { statusCode: "dang xu ly", statusLabel: "Đang xử lý" };
  }

  if (
    raw === "approved" ||
    raw === "completed" ||
    raw === "done" ||
    combined.includes("đã giải quyết") ||
    combined.includes("da giai quyet") ||
    combined.includes("da duyet") ||
    combined.includes("hoan thanh")
  ) {
    return { statusCode: "da giai quyet", statusLabel: "Đã giải quyết" };
  }

  if (
    raw === "rejected" ||
    raw === "denied" ||
    raw === "refused" ||
    combined.includes("từ chối") ||
    combined.includes("tu choi")
  ) {
    return { statusCode: "tu choi", statusLabel: "Từ chối" };
  }

  return {
    statusCode: "tu choi",
    statusLabel: statusText || rawStatus?.toString?.() || "Từ chối",
  };
}

function toBackendStatus(
  statusCode: ApplicationStatusCode,
): BackendApplicationStatus {
  switch (statusCode) {
    case "da nop":
      return "Submitted";
    case "dang xu ly":
      return "Processing";
    case "da giai quyet":
      return "Approved";
    case "tu choi":
      return "Rejected";
    default:
      return "Submitted";
  }
}

function normalizeApplications(payload: unknown): ManagedApplication[] {
  return toArray<Record<string, unknown>>(payload).map((item, index) => {
    const id = readNumberOrString(item, [
      "applicationId",
      "id",
      "ApplicationId",
      "Id",
    ]);
    const applicationCode = readString(item, [
      "applicationCode",
      "ApplicationCode",
      "code",
      "Code",
    ]);
    const serviceCode = readString(item, ["serviceCode", "ServiceCode"]);
    const serviceName = readString(item, ["serviceName", "ServiceName"]);
    const categoryName = readString(item, ["categoryName", "CategoryName"]);
    const applicantName = readString(item, [
      "applicantName",
      "ApplicantName",
      "fullName",
      "FullName",
      "name",
      "Name",
    ]);
    const identityNumber = readString(item, [
      "identityNumber",
      "IdentityNumber",
      "cccd",
      "CCCD",
      "cmnd",
      "CMND",
    ]);
    const dateOfBirth = readString(item, [
      "dateOfBirth",
      "DateOfBirth",
      "birthDate",
      "BirthDate",
    ]);
    const address = readString(item, ["address", "Address"]);
    const attachedFileUrl = readString(item, [
      "attachedFileUrl",
      "AttachedFileUrl",
      "fileUrl",
      "FileUrl",
    ]);
    const createdAt = readString(item, ["createdAt", "CreatedAt"]);
    const handlerId = readNumberOrString(item, ["handlerId", "HandlerId"]);
    const statusText = readString(item, ["statusText", "StatusText"]);
    const statusRawValue =
      item.status ??
      item.Status ??
      item.applicationStatus ??
      item.ApplicationStatus ??
      "";
    const status = normalizeStatus(statusRawValue, statusText);

    return {
      id: id ?? `row-${index + 1}`,
      applicationCode,
      serviceCode,
      serviceName,
      categoryName,
      applicantName,
      identityNumber,
      dateOfBirth: normalizeDateValue(dateOfBirth),
      address,
      attachedFileUrl,
      createdAt,
      handlerId,
      statusRaw: String(statusRawValue ?? ""),
      statusText,
      statusCode: status.statusCode,
      statusLabel: status.statusLabel,
    };
  });
}

function statusBadgeClass(statusCode: ApplicationStatusCode): string {
  if (statusCode === "da nop")
    return "bg-amber-100 text-amber-700 hover:bg-amber-100";
  if (statusCode === "dang xu ly")
    return "bg-blue-100 text-blue-700 hover:bg-blue-100";
  if (statusCode === "da giai quyet")
    return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
  if (statusCode === "tu choi")
    return "bg-rose-100 text-rose-700 hover:bg-rose-100";
  return "bg-slate-100 text-slate-700 hover:bg-slate-100";
}

function getNextStatusActions(statusCode: ApplicationStatusCode) {
  if (statusCode === "da nop") {
    return [
      { label: "Đang xử lý", value: "dang xu ly" as ApplicationStatusCode },
      { label: "Từ chối", value: "tu choi" as ApplicationStatusCode },
    ];
  }

  if (statusCode === "dang xu ly") {
    return [
      {
        label: "Đã giải quyết",
        value: "da giai quyet" as ApplicationStatusCode,
      },
      { label: "Từ chối", value: "tu choi" as ApplicationStatusCode },
    ];
  }

  return [];
}

export default function Page() {
  const [applications, setApplications] = useState<ManagedApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [errorText, setErrorText] = useState("");
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    setErrorText("");
    try {
      const payload = await fetchAdminApplications();
      setApplications(normalizeApplications(payload));
    } catch (error) {
      console.error("Không thể tải danh sách hồ sơ", error);
      setErrorText("Không thể tải danh sách hồ sơ. Vui lòng thử lại.");
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const filteredApplications = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    return applications.filter((item) => {
      const matchesStatus =
        statusFilter === "all" || item.statusCode === statusFilter;
      const searchTarget = [
        item.applicationCode,
        item.applicantName,
        item.identityNumber,
        item.dateOfBirth,
        item.address,
        item.serviceCode,
        item.serviceName,
        item.categoryName,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchTarget.includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [applications, searchText, statusFilter]);

  const handleStatusUpdate = async (
    application: ManagedApplication,
    nextStatus: ApplicationStatusCode,
  ) => {
    try {
      setUpdatingId(application.id);
      await updateAdminApplicationStatus(
        application.id,
        toBackendStatus(nextStatus),
      );
      toast.success("Cập nhật trạng thái thành công");
      await loadApplications();
    } catch (error) {
      console.error("Không thể cập nhật trạng thái hồ sơ", error);
      toast.error("Cập nhật trạng thái thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <SidebarAdmin variant="inset" />
      <SidebarInset>
        <SiteHeaderAdmin title="Quản lý dịch vụ" />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-semibold">Hồ sơ người dùng</h2>
                  <p className="text-sm text-muted-foreground">
                    Xem tất cả hồ sơ, tìm theo thông tin cá nhân và lọc theo
                    trạng thái xử lý.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Tìm theo tên, CCCD, ngày sinh, địa chỉ, mã hồ sơ, thủ tục"
                      className="pl-9"
                      value={searchText}
                      onChange={(event) => setSearchText(event.target.value)}
                    />
                  </div>

                  <Select
                    value={statusFilter}
                    onValueChange={(value) =>
                      setStatusFilter(value as StatusFilter)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="da nop">Đã nộp</SelectItem>
                      <SelectItem value="dang xu ly">Đang xử lý</SelectItem>
                      <SelectItem value="da giai quyet">
                        Đã giải quyết
                      </SelectItem>
                      <SelectItem value="tu choi">Từ chối</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={loadApplications}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Tải lại
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>Tổng hồ sơ:</span>
                  <Badge variant="secondary" className="font-medium">
                    {applications.length}
                  </Badge>
                  <span>Kết quả hiển thị:</span>
                  <Badge variant="secondary" className="font-medium">
                    {filteredApplications.length}
                  </Badge>
                </div>

                {errorText ? (
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {errorText}
                  </div>
                ) : null}

                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã hồ sơ</TableHead>
                        <TableHead>Người nộp</TableHead>
                        <TableHead>Thông tin cá nhân</TableHead>
                        <TableHead>Thủ tục</TableHead>
                        <TableHead>Ngày nộp</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="py-10 text-center text-muted-foreground"
                          >
                            Đang tải dữ liệu...
                          </TableCell>
                        </TableRow>
                      ) : filteredApplications.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="py-10 text-center text-muted-foreground"
                          >
                            <div className="flex flex-col items-center gap-2">
                              <FileSearch className="h-5 w-5" />
                              <span>Không tìm thấy hồ sơ phù hợp</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredApplications.map((item) => {
                          const actions = getNextStatusActions(item.statusCode);

                          return (
                            <TableRow key={String(item.id)}>
                              <TableCell className="font-medium">
                                {item.applicationCode || "-"}
                              </TableCell>
                              <TableCell>{item.applicantName || "-"}</TableCell>
                              <TableCell className="text-sm">
                                <div className="space-y-1">
                                  <p>
                                    <span className="text-muted-foreground">
                                      CCCD:
                                    </span>{" "}
                                    {item.identityNumber || "-"}
                                  </p>
                                  <p>
                                    <span className="text-muted-foreground">
                                      Ngày sinh:
                                    </span>{" "}
                                    {item.dateOfBirth || "-"}
                                  </p>
                                  <p
                                    className="max-w-[280px] truncate"
                                    title={item.address}
                                  >
                                    <span className="text-muted-foreground">
                                      Địa chỉ:
                                    </span>{" "}
                                    {item.address || "-"}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="font-medium">
                                    {item.serviceName || "-"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.serviceCode || ""}
                                    {item.categoryName
                                      ? ` • ${item.categoryName}`
                                      : ""}
                                  </p>
                                  {item.attachedFileUrl ? (
                                    <a
                                      href={getDocumentViewerUrl(
                                        item.attachedFileUrl,
                                      )}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs text-blue-600 hover:underline"
                                    >
                                      Xem file đính kèm
                                    </a>
                                  ) : null}
                                </div>
                              </TableCell>
                              <TableCell>
                                {formatDateTime(item.createdAt)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={statusBadgeClass(item.statusCode)}
                                >
                                  {item.statusLabel}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {actions.length > 0 ? (
                                  <div className="flex justify-end gap-2">
                                    {actions.map((action) => (
                                      <Button
                                        key={action.value}
                                        variant="outline"
                                        size="sm"
                                        disabled={updatingId === item.id}
                                        onClick={() =>
                                          void handleStatusUpdate(
                                            item,
                                            action.value,
                                          )
                                        }
                                      >
                                        {updatingId === item.id
                                          ? "Đang xử lý..."
                                          : action.label}
                                      </Button>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    Không có
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
