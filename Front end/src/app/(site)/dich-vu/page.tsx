"use client";

import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, FileText, Handshake, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const services = [
  {
    id: 1,
    href: "/dich-vu/thu-tuc-hanh-chinh",
    title: "Thủ tục hành chính",
    description:
      "Cung cấp thông tin và hướng dẫn về các thủ tục hành chính tại Phường Cao Lãnh.",
  },
  {
    id: 2,
    href: "/dich-vu/nop-ho-so",
    title: "Nộp hồ sơ",
    description:
      "Hỗ trợ nộp hồ sơ trực tuyến cho các dịch vụ công tại Phường Cao Lãnh.",
  },
  {
    id: 3,
    href: "/dich-vu/tra-cuu-ho-so",
    title: "Tra cứu hồ sơ",
    description:
      "Người dân có thể tra cứu trạng thái và thông tin về các hồ sơ đã nộp.",
  },
];

export default function DichVu() {
  const router = useRouter();

  return (
    <div>
      {/* HERO */}
      <div className="relative overflow-hidden border-b bg-linear-to-br from-amber-50 via-white to-slate-100">
        {/* floating icons */}
        <div className="pointer-events-none absolute inset-0">
          <Handshake className="absolute left-5 top-4 size-10 -rotate-12 text-amber-300/60" />
          <ClipboardList className="absolute right-6 top-6 size-9 rotate-12 text-emerald-300/60" />
          <FileText className="absolute bottom-4 left-[16%] size-9 rotate-6 text-cyan-300/50" />
        </div>

        {/* glow */}
        <div className="absolute -top-16 -right-16 h-40 w-40 bg-amber-200 blur-3xl opacity-30" />

        <div className="container relative mx-auto space-y-4 p-6 text-center">
          <Badge className="rounded-full border border-amber-200 bg-white px-4 py-1 text-amber-700 shadow-sm">
            Dịch vụ công trực tuyến
          </Badge>

          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Dịch vụ dành cho người dân
          </h1>

          <p className="mx-auto max-w-2xl text-sm text-slate-600 md:text-base">
            Tra cứu thủ tục, nộp hồ sơ và theo dõi trạng thái nhanh chóng trong
            vài bước đơn giản.
          </p>

          <div className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-xs font-semibold shadow-sm">
            <ClipboardList className="size-4" />
            {services.length} nhóm dịch vụ
          </div>
        </div>
      </div>

      {/* SERVICES */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Card
              key={service.id}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* hover gradient */}
              <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-transparent opacity-0 transition group-hover:opacity-100" />

              <CardHeader className="relative flex flex-1 flex-col space-y-3 p-5">
                {/* icon */}
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-100 p-2 text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition">
                    {index === 0 && <ClipboardList size={18} />}
                    {index === 1 && <Handshake size={18} />}
                    {index === 2 && <FileText size={18} />}
                  </div>

                  <h2 className="text-lg font-semibold text-slate-900">
                    {service.title}
                  </h2>
                </div>

                <p className="min-h-14 text-sm leading-relaxed text-slate-600">
                  {service.description}
                </p>
              </CardHeader>

              <CardFooter className="relative mt-auto">
                <Button
                  variant="ghost"
                  className="w-full justify-between border border-slate-200 bg-white hover:bg-blue-600 hover:text-white transition-all"
                  onClick={() => router.push(service.href)}
                >
                  Tìm hiểu thêm
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
