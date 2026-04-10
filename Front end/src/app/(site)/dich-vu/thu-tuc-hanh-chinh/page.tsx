import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { getProcedureFields, type ProcedureField } from "@/lib/api/procedure";

export const revalidate = 900;

export default async function Page() {
  let fields: ProcedureField[] = [];

  try {
    fields = await getProcedureFields();
  } catch {
    return (
      <main className="container mx-auto px-4 py-10">
        <p className="text-sm text-red-600">
          Không thể tải danh sách lĩnh vực thủ tục hành chính. Vui lòng thử lại
          sau.
        </p>
        <Button asChild variant="outline" className="mt-4" size="sm">
          <Link href="/dich-vu">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại trang Dịch vụ
          </Link>
        </Button>
      </main>
    );
  }

  if (fields.length === 0) {
    return (
      <main className="container mx-auto px-4 py-10">
        <p className="text-sm text-muted-foreground">
          Hiện chưa có lĩnh vực thủ tục hành chính khả dụng.
        </p>
        <Button asChild variant="outline" className="mt-4" size="sm">
          <Link href="/dich-vu">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại trang Dịch vụ
          </Link>
        </Button>
      </main>
    );
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
        <Link href="/dich-vu">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại trang Dịch vụ
        </Link>
      </Button>

      {/* HEADER */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8 shadow-sm">
        {/* glow */}
        <div className="absolute -top-10 -right-10 h-40 w-40 bg-blue-200/40 blur-3xl" />
        <div className="relative z-10 space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Thủ tục hành chính
          </h1>

          <p className="text-sm text-slate-600 max-w-2xl">
            Tra cứu thủ tục hành chính theo từng lĩnh vực cụ thể một cách nhanh
            chóng và chính xác.
          </p>
        </div>
      </section>

      {/* GRID */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
        {fields.map((field) => (
          <Card
            key={field.serviceCategoryId}
            className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            {/* HEADER */}
            <CardHeader className="flex flex-1 flex-col items-center justify-center text-center space-y-3 p-6">
              <p className="text-2xl font-bold uppercase tracking-tight text-[#1f3c88]">
                Lĩnh vực
              </p>

              <h2 className="mt-2 text-3xl font-extrabold uppercase leading-tight text-[#cc2955] ">
                {field.fieldName}
              </h2>
            </CardHeader>

            {/* FOOTER */}
            <CardFooter className="flex items-center justify-between border-t-0 bg-[#0f5fc6] px-4 py-4 ">
              <Button
                asChild
                size="sm"
                value="outline"
                className="rounded-full bg-pink-600 px-3 font-bold uppercase tracking-wide text-white hover:bg-pink-700"
              >
                <Link
                  href={`/dich-vu/thu-tuc-hanh-chinh/${field.serviceCategoryId}?fieldName=${encodeURIComponent(
                    field.fieldName,
                  )}`}
                >
                  Xem nội dung
                </Link>
              </Button>

              <span className="text-sm font-semibold text-white">
                {field.procedureCount} thủ tục
              </span>
            </CardFooter>
          </Card>
        ))}
      </section>
    </main>
  );
}
