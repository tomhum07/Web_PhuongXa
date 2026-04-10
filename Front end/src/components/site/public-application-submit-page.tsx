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
import { getDocumentViewerUrl } from "@/lib/utils/document-viewer";

const NULL_SELECT_VALUE = "__NULL__";

/* ================= STEP INDICATOR ================= */
function StepIndicator({ step }: { step: number }) {
  const steps = ["Chọn lĩnh vực", "Chọn thủ tục", "Điền thông tin"];

  return (
    <div className="flex items-center justify-between gap-2">
      {steps.map((label, index) => {
        const active = index <= step;
        return (
          <div key={index} className="flex-1 text-center">
            <div
              className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold
              ${
                active
                  ? "bg-blue-600 text-white shadow"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {index + 1}
            </div>
            <p
              className={`text-xs ${
                active ? "text-blue-600" : "text-slate-500"
              }`}
            >
              {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ================= MAIN ================= */

export function PublicApplicationSubmitPage() {
  const [fields, setFields] = React.useState<ProcedureField[]>([]);
  const [procedures, setProcedures] = React.useState<ProcedureByField[]>([]);
  const [selectedFieldId, setSelectedFieldId] =
    React.useState(NULL_SELECT_VALUE);
  const [selectedProcedureId, setSelectedProcedureId] =
    React.useState(NULL_SELECT_VALUE);

  const [isLoadingFields, setIsLoadingFields] = React.useState(true);
  const [isLoadingProcedures, setIsLoadingProcedures] = React.useState(false);

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const selectedProcedure = React.useMemo(() => {
    const id = Number(selectedProcedureId);
    if (!id) return null;
    return procedures.find((p) => p.serviceId === id) ?? null;
  }, [procedures, selectedProcedureId]);

  /* LOAD FIELDS */
  React.useEffect(() => {
    let cancel = false;

    (async () => {
      setIsLoadingFields(true);
      try {
        const data = await getProcedureFields();
        if (cancel) return;

        setFields(data);
      } catch {
        if (!cancel) setErrorMessage("Không thể tải lĩnh vực.");
      } finally {
        if (!cancel) setIsLoadingFields(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, []);

  /* LOAD PROCEDURES */
  React.useEffect(() => {
    const id = Number(selectedFieldId);
    if (!id) {
      setProcedures([]);
      setSelectedProcedureId(NULL_SELECT_VALUE);
      setIsLoadingProcedures(false);
      return;
    }

    let cancel = false;

    (async () => {
      setIsLoadingProcedures(true);
      try {
        const data = await getProceduresByField(id);
        if (cancel) return;

        setProcedures(data);
        setSelectedProcedureId(NULL_SELECT_VALUE);
      } catch {
        if (!cancel) setErrorMessage("Không tải được thủ tục.");
      } finally {
        if (!cancel) setIsLoadingProcedures(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, [selectedFieldId]);

  const hasSelectedField = Number(selectedFieldId) > 0;
  const hasSelectedProcedure = Number(selectedProcedureId) > 0;
  const currentStep = hasSelectedProcedure ? 2 : hasSelectedField ? 1 : 0;

  return (
    <main className="container mx-auto max-w-5xl space-y-8 px-4 py-12">
      {/* BACK */}
      <Button asChild variant="ghost" size="sm">
        <Link href="/dich-vu">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Link>
      </Button>

      {/* HEADER */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-slate-100 p-8 shadow-sm">
        {/* glow effect */}
        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 bg-blue-200/40 blur-3xl" />

        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Nộp hồ sơ online
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
            Chọn thủ tục và gửi hồ sơ chỉ trong vài bước đơn giản. Hệ thống sẽ
            xử lý nhanh chóng và chính xác.
          </p>

          {/* divider */}
          <div className="my-6 h-px bg-linear-to-r from-transparent via-slate-300 to-transparent" />

          {/* step */}
          <div className="rounded-2xl bg-white/70 backdrop-blur p-4 shadow-inner border border-slate-200">
            <StepIndicator step={currentStep} />
          </div>
        </div>
      </section>

      {/* ERROR */}
      {errorMessage && (
        <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      {/* SELECT */}
      <Card className="rounded-2xl shadow-sm hover:shadow-md transition">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Chọn thủ tục</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* FIELD */}
            <div>
              <p className="text-sm font-medium">Lĩnh vực</p>
              <Select
                value={selectedFieldId}
                onValueChange={(v) => {
                  setSelectedFieldId(v);
                  setSelectedProcedureId(NULL_SELECT_VALUE);
                }}
              >
                <SelectTrigger className="mt-1 shadow-sm focus:ring-2 focus:ring-blue-100">
                  <SelectValue placeholder="Chọn lĩnh vực" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={NULL_SELECT_VALUE}>
                    -- Chọn lĩnh vực --
                  </SelectItem>
                  {fields.map((f) => (
                    <SelectItem
                      key={f.serviceCategoryId}
                      value={String(f.serviceCategoryId)}
                    >
                      {f.fieldName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* PROCEDURE */}
            <div>
              <p className="text-sm font-medium">Thủ tục</p>
              <Select
                value={selectedProcedureId}
                onValueChange={setSelectedProcedureId}
                disabled={!Number(selectedFieldId)}
              >
                <SelectTrigger className="mt-1 shadow-sm focus:ring-2 focus:ring-blue-100">
                  <SelectValue placeholder="Chọn thủ tục" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value={NULL_SELECT_VALUE}>
                    -- Chọn thủ tục --
                  </SelectItem>
                  {procedures.map((p) => (
                    <SelectItem key={p.serviceId} value={String(p.serviceId)}>
                      {p.procedureName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* LOADING */}
          {(isLoadingFields || isLoadingProcedures) && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="animate-spin size-4" />
              Đang tải dữ liệu...
            </div>
          )}

          {/* SELECTED */}
          {selectedProcedure && (
            <div className="rounded-xl border bg-slate-50 p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold">
                <CheckCircle2 size={16} />
                Đã chọn
              </div>

              <p className="font-semibold">{selectedProcedure.procedureName}</p>

              <div className="flex gap-2 flex-wrap">
                {selectedProcedure.procedureFileUrl && (
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={getDocumentViewerUrl(
                        selectedProcedure.procedureFileUrl,
                      )}
                      target="_blank"
                    >
                      <FileText className="mr-1 size-4" />
                      Hướng dẫn
                    </Link>
                  </Button>
                )}

                {selectedProcedure.templateFileUrl && (
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={getDocumentViewerUrl(
                        selectedProcedure.templateFileUrl,
                      )}
                      target="_blank"
                    >
                      <Download className="mr-1 size-4" />
                      Biểu mẫu
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FORM */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Điền thông tin</CardTitle>
        </CardHeader>

        <CardContent>
          <PublicApplicationForm
            selectedProcedureId={selectedProcedure?.serviceId}
          />
        </CardContent>
      </Card>
    </main>
  );
}
