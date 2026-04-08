import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <main className="container mx-auto px-4 py-10 space-y-6">
      <Button asChild variant="ghost" size="sm" className="px-0 w-fit">
        <Link href="/dich-vu/thu-tuc-hanh-chinh">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại Thủ tục hành chính
        </Link>
      </Button>

      {/* Header đẹp hơn */}
      <div className="rounded-2xl border bg-gradient-to-r from-pink-50 via-white to-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-slate-900 md:text-4xl">
              {fieldName ? `Lĩnh vực: ${fieldName}` : "Danh sách thủ tục"}
            </h1>
            <div className="flex items-center gap-2 rounded-xl ">
              <p className="text-muted-foreground text-sm">Tổng số thủ tục:</p>
              <Badge
                variant="secondary"
                className="text-base font-semibold bg-pink-100 text-pink-600"
              >
                {procedures.length}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {procedures.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Chưa có thủ tục nào trong lĩnh vực này
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border shadow-sm">
          <ProcedureDataTable data={procedures} />
        </div>
      )}
    </main>
  );
}
