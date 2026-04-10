import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  getProcedureFields,
  getProceduresByField,
  type ProcedureByField,
} from "@/lib/api/procedure";
import { ProcedureDataTable } from "@/components/procedure-data-table";
import { Badge } from "@/components/ui/badge";

export const revalidate = 900;

export async function generateStaticParams() {
  try {
    const fields = await getProcedureFields();
    return fields.map((field) => ({
      fieldId: String(field.serviceCategoryId),
    }));
  } catch {
    return [];
  }
}

type FieldProcedurePageProps = {
  params: Promise<{
    fieldId: string;
  }>;
  searchParams: Promise<{
    fieldName?: string;
  }>;
};

export default async function Page({
  params,
  searchParams,
}: FieldProcedurePageProps) {
  const { fieldId } = await params;
  const { fieldName: fieldNameQuery } = await searchParams;
  const parsedFieldId = Number(fieldId);

  if (!Number.isFinite(parsedFieldId) || parsedFieldId <= 0) {
    return (
      <main className="container mx-auto px-4 py-10">
        <p className="text-sm text-red-600">Lĩnh vực không hợp lệ.</p>
        <Button asChild variant="outline" className="mt-4" size="sm">
          <Link href="/dich-vu/thu-tuc-hanh-chinh">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại Thủ tục hành chính
          </Link>
        </Button>
      </main>
    );
  }

  let procedures: ProcedureByField[] = [];

  try {
    procedures = await getProceduresByField(parsedFieldId);
  } catch {
    return (
      <main className="container mx-auto px-4 py-10">
        <p className="text-sm text-red-600">
          Không thể tải danh sách thủ tục của lĩnh vực này.
        </p>
        <Button asChild variant="outline" className="mt-4" size="sm">
          <Link href="/dich-vu/thu-tuc-hanh-chinh">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại Thủ tục hành chính
          </Link>
        </Button>
      </main>
    );
  }

  let fieldName = fieldNameQuery?.trim() || "";

  if (!fieldName) {
    if (procedures.length > 0) {
      fieldName = procedures[0].categoryName?.trim() || "";
    } else {
      try {
        const fields = await getProcedureFields();
        fieldName =
          fields.find((field) => field.serviceCategoryId === parsedFieldId)
            ?.fieldName ?? "";
      } catch {
        fieldName = "";
      }
    }
  }

  return (
    <main className="container mx-auto max-w-6xl px-4 py-12 space-y-8">
      {/* BACK */}
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="px-0 w-fit text-slate-600 hover:text-slate-900"
      >
        <Link href="/dich-vu/thu-tuc-hanh-chinh">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại Thủ tục hành chính
        </Link>
      </Button>

      {/* HEADER */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8 shadow-sm">
        {/* glow */}
        <div className="absolute -top-10 -right-10 h-40 w-40 bg-pink-200/40 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* LEFT */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {fieldName ? fieldName : "Danh sách thủ tục"}
            </h1>

            <p className="text-sm text-slate-600 max-w-xl">
              Danh sách các thủ tục hành chính thuộc lĩnh vực này. Bạn có thể
              tra cứu và xem chi tiết từng thủ tục.
            </p>

            {/* badge */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Tổng số thủ tục:</span>

              <Badge className="rounded-full bg-pink-100 text-pink-600 px-3 py-1 text-sm font-semibold shadow-sm">
                {procedures.length}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      {procedures.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 py-12 text-center shadow-sm">
          <p className="text-slate-600 text-sm">
            Chưa có thủ tục nào trong lĩnh vực này
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Vui lòng quay lại sau hoặc chọn lĩnh vực khác
          </p>
        </div>
      ) : (
        <div>
          {/* table */}
          <div className="overflow-x-auto">
            <ProcedureDataTable data={procedures} />
          </div>
        </div>
      )}
    </main>
  );
}
