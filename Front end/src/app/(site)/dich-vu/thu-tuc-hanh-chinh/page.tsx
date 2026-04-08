import Link from "next/link";
<<<<<<< HEAD
import { Button } from "@/components/ui/button";
import { getPublicFields } from "@/lib/api/public-applications";

export default async function ThuTucHanhChinhPage() {
  const fieldsData = await getPublicFields();
  
  // Convert API fields matching your logic
  const fields = fieldsData.length > 0 ? fieldsData.map((f: any) => ({
    id: f.serviceCategoryId,
    name: f.fieldName,
    count: f.procedureCount || 0
  })) : [
    {
      id: 1,
      name: "Y TẾ",
      count: 0,
    },
    {
      id: 2,
      name: "TÀI NGUYÊN - MÔI TRƯỜNG",
      count: 2,
    },
    {
      id: 3,
      name: "TƯ PHÁP - HỘ TỊCH",
      count: 1,
    },
    {
      id: 4,
      name: "THANH TRA",
      count: 0,
    },
    {
      id: 5,
      name: "XÂY DỰNG",
      count: 0,
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-7xl">
      <div className="mb-8">
        <Link
          href="/dich-vu"
          className="text-muted-foreground hover:text-primary transition-colors flex items-center text-sm font-medium mb-4 text-[#1a85c2]"
        >
          &larr; Quay lại trang Dịch vụ
        </Link>
        <h1 className="text-3xl font-bold uppercase text-slate-800 mb-2">
          Thủ tục hành chính
        </h1>
        <p className="text-slate-500">
=======
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
    <main className="container mx-auto px-4 py-10">
      <Button asChild variant="ghost" size="sm" className="mb-4 px-0">
        <Link href="/dich-vu">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại trang Dịch vụ
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight text-slate-900 ">
          Thủ tục hành chính
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
>>>>>>> 6dad0d803cdb2498e58b360c22d2c7971b199c19
          Tra cứu thủ tục hành chính theo từng lĩnh vực cụ thể
        </p>
      </div>

<<<<<<< HEAD
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {fields.map((field: any) => (
          <div
            key={field.id}
            className="flex flex-col border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white"
          >
            {/* Top Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[160px]">
              <span className="text-blue-900 font-semibold mb-2 uppercase text-sm">
                Lĩnh vực
              </span>
              <h3 className="text-xl font-bold text-[#d82a4e] uppercase">
                {field.name}
              </h3>
            </div>

            {/* Bottom Bar */}
            <div className="bg-[#185abb] text-white p-3 flex justify-between items-center rounded-b-xl">
              <Link
                href={`/dich-vu/thu-tuc-hanh-chinh/${field.id}`}
                className="bg-[#d82a4e] hover:bg-[#c22143] text-white text-xs font-bold px-4 py-2 rounded-full transition-colors uppercase"
              >
                Xem nội dung
              </Link>
              <span className="text-sm font-medium">{field.count} thủ tục</span>
            </div>
          </div>
        ))}
      </div>
    </div>
=======
      <section className="grid gap-5 grid-cols-4">
        {fields.map((field) => (
          <Card
            key={field.serviceCategoryId}
            className="overflow-hidden border border-slate-200 py-0"
          >
            <CardHeader className="items-center pt-10 text-center ">
              <p className="text-2xl font-bold uppercase tracking-tight text-[#1f3c88]">
                Lĩnh vực
              </p>
              <h2 className="mt-2 text-3xl font-extrabold uppercase leading-tight text-[#cc2955] ">
                {field.fieldName}
              </h2>
            </CardHeader>

            <CardContent className="sr-only">
              {field.description ?? ""}
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t-0 bg-[#0f5fc6] px-4 py-4 ">
              <Button
                asChild
                size="default"
                variant="secondary"
                className="rounded-full bg-pink-600 px-3 font-bold uppercase tracking-wide text-white hover:bg-pink-700"
              >
                <Link
                  href={`/dich-vu/thu-tuc-hanh-chinh/${field.serviceCategoryId}?fieldName=${encodeURIComponent(field.fieldName)}`}
                >
                  Xem nội dung
                </Link>
              </Button>
              <p className="text-base font-semibold text-white">
                {field.procedureCount} thủ tục
              </p>
            </CardFooter>
          </Card>
        ))}
      </section>
    </main>
>>>>>>> 6dad0d803cdb2498e58b360c22d2c7971b199c19
  );
}
