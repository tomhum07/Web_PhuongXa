"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getProcedureFields,
  getProceduresByField,
  type ProcedureByField,
  type ProcedureField,
} from "@/lib/api/procedure";
import { PublicApplicationForm } from "@/components/site/public-application-form";

export function PublicApplicationSubmitPage() {
  const [fields, setFields] = React.useState<ProcedureField[]>([]);
  const [procedures, setProcedures] = React.useState<ProcedureByField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = React.useState<string>("");
  const [selectedProcedureId, setSelectedProcedureId] =
    React.useState<string>("");
  const [isLoadingFields, setIsLoadingFields] = React.useState(true);
  const [isLoadingProcedures, setIsLoadingProcedures] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const selectedProcedure = React.useMemo(() => {
    const parsedProcedureId = Number(selectedProcedureId);
    if (!Number.isFinite(parsedProcedureId) || parsedProcedureId <= 0) {
      return null;
    }

    return (
      procedures.find(
        (procedure) => procedure.serviceId === parsedProcedureId,
      ) ?? null
    );
  }, [procedures, selectedProcedureId]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadFields() {
      setIsLoadingFields(true);
      setErrorMessage(null);

      try {
        const data = await getProcedureFields();
        if (cancelled) {
          return;
        }

        setFields(data);

        if (data.length > 0) {
          setSelectedFieldId(String(data[0].serviceCategoryId));
        }
      } catch {
        if (!cancelled) {
          setErrorMessage(
            "Không thể tải danh sách lĩnh vực. Vui lòng thử lại sau.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingFields(false);
        }
      }
    }

    loadFields();

    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    const parsedFieldId = Number(selectedFieldId);

    if (!Number.isFinite(parsedFieldId) || parsedFieldId <= 0) {
      setProcedures([]);
      setSelectedProcedureId("");
      return;
    }

    let cancelled = false;

    async function loadProcedures() {
      setIsLoadingProcedures(true);
      setErrorMessage(null);

      try {
        const data = await getProceduresByField(parsedFieldId);
        if (cancelled) {
          return;
        }

        setProcedures(data);
        setSelectedProcedureId((previousValue) => {
          const previousId = Number(previousValue);
          const stillExists = data.some(
            (procedure) => procedure.serviceId === previousId,
          );

          if (stillExists) {
            return previousValue;
          }

          return data.length > 0 ? String(data[0].serviceId) : "";
        });
      } catch {
        if (!cancelled) {
          setProcedures([]);
          setSelectedProcedureId("");
          setErrorMessage(
            "Không thể tải danh sách thủ tục của lĩnh vực đã chọn.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProcedures(false);
        }
      }
    }

    loadProcedures();

    return () => {
      cancelled = true;
    };
  }, [selectedFieldId]);

  return (
    <main className="container mx-auto space-y-6 px-4 py-10">
      <Button asChild variant="ghost" size="sm" className="w-fit px-0">
        <Link href="/dich-vu">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại trang Dịch vụ
        </Link>
      </Button>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Badge
          variant="secondary"
          className="mb-3 rounded-full border border-blue-200 bg-blue-50 text-blue-700"
        >
          PublicApplications API
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
          Nộp hồ sơ trực tuyến
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600 md:text-base">
          Chọn lĩnh vực, chọn thủ tục rồi điền thông tin công dân để gửi hồ sơ
          trực tuyến. Hệ thống sẽ gửi dữ liệu đến endpoint công khai của dịch vụ
          hành chính.
        </p>
      </section>

      {errorMessage ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      ) : null}

      <Card className="overflow-hidden border-slate-200 py-0">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Thông tin thủ tục
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Lĩnh vực</p>
              <Select
                value={selectedFieldId}
                onValueChange={(value) => {
                  setSelectedFieldId(value);
                  setSelectedProcedureId("");
                }}
                disabled={isLoadingFields || fields.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn lĩnh vực" />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((field) => (
                    <SelectItem
                      key={field.serviceCategoryId}
                      value={String(field.serviceCategoryId)}
                    >
                      {field.fieldName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">Thủ tục</p>
              <Select
                value={selectedProcedureId}
                onValueChange={setSelectedProcedureId}
                disabled={
                  isLoadingProcedures ||
                  isLoadingFields ||
                  procedures.length === 0 ||
                  !selectedFieldId
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn thủ tục cần nộp" />
                </SelectTrigger>
                <SelectContent>
                  {procedures.map((procedure) => (
                    <SelectItem
                      key={procedure.serviceId}
                      value={String(procedure.serviceId)}
                    >
                      {procedure.procedureName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoadingFields || isLoadingProcedures ? (
            <div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Đang tải dữ liệu thủ tục...
            </div>
          ) : null}

          {!isLoadingFields && fields.length === 0 ? (
            <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              Hiện chưa có lĩnh vực nào khả dụng để nộp hồ sơ trực tuyến.
            </p>
          ) : null}

          {!isLoadingProcedures &&
          selectedFieldId &&
          procedures.length === 0 ? (
            <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              Lĩnh vực này hiện chưa có thủ tục khả dụng.
            </p>
          ) : null}

          {selectedProcedure ? (
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                <CheckCircle2 className="size-4" />
                Thủ tục đã chọn
              </div>

              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-900">
                  {selectedProcedure.procedureName}
                </p>
                {selectedProcedure.description ? (
                  <p className="text-sm text-muted-foreground">
                    {selectedProcedure.description}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedProcedure.procedureFileUrl ? (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-slate-300 bg-white hover:bg-slate-100"
                  >
                    <Link
                      href={selectedProcedure.procedureFileUrl}
                      target="_blank"
                    >
                      <FileText className="mr-2 size-4" />
                      Xem hướng dẫn thủ tục
                    </Link>
                  </Button>
                ) : null}

                {selectedProcedure.templateFileUrl ? (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-slate-300 bg-white hover:bg-slate-100"
                  >
                    <Link
                      href={selectedProcedure.templateFileUrl}
                      target="_blank"
                    >
                      <Download className="mr-2 size-4" />
                      Tải biểu mẫu
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-slate-200 py-0">
        <CardHeader className="border-b bg-slate-50">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Biểu mẫu nộp hồ sơ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PublicApplicationForm
            selectedProcedureId={
              selectedProcedure ? selectedProcedure.serviceId : undefined
            }
          />
        </CardContent>
      </Card>
    </main>
  );
}
