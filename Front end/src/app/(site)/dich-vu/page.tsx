<<<<<<< HEAD
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function DichVu() {
  const services = [
    {
      title: "Thủ tục hành chính",
      description: "Tra cứu và tìm hiểu thông tin chi tiết, quy trình thực hiện các thủ tục hành chính tại phường Cao Lãnh.",
      buttonText: "Xem thủ tục",
      href: "/dich-vu/thu-tuc-hanh-chinh",
    },
    {
      title: "Nộp hồ sơ trực tuyến",
      description: "Nộp hồ sơ, giấy tờ trực tuyến nhanh chóng, tiện lợi và theo dõi tiến độ xử lý hồ sơ mọi lúc mọi nơi.",
      buttonText: "Nộp hồ sơ ngay",
      href: "/dich-vu/nop-ho-so",
    },
    {
      title: "Tải biểu mẫu",
      description: "Cung cấp danh sách các biểu mẫu, tờ khai hành chính chuẩn để người dân tải về, in ấn và sử dụng.",
      buttonText: "Tải biểu mẫu",
      href: "/dich-vu/tai-bieu-mau",
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl p-8 mb-12 text-center border">
        <h1 className="text-3xl font-bold text-primary tracking-tight md:text-4xl text-blue-700">
          Dịch vụ hành chính Phường Cao Lãnh
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {services.map((service, index) => (
          <Card key={index} className="flex flex-col border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                {service.description}
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="bg-[#1a85c2] hover:bg-[#156e9f] text-white">
                <Link href={service.href}>{service.buttonText}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
=======
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, FileText, Handshake } from "lucide-react";
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
    href: "/dich-vu/tai-bieu-mau",
    title: "Tải biểu mẫu",
    description:
      "Cung cấp các biểu mẫu cần thiết cho các thủ tục hành chính và dịch vụ công.",
  },
];

export default function DichVu() {
  const router = useRouter();

  return (
    <div>
      <div className="relative overflow-hidden border-b bg-amber-50/70">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Handshake className="absolute left-5 top-4 size-9 -rotate-12 text-amber-300/60 md:size-12" />
          <ClipboardList className="absolute right-6 top-6 size-8 rotate-12 text-emerald-300/60 md:size-11" />
          <FileText className="absolute bottom-3 left-[16%] size-8 rotate-6 text-cyan-300/50 md:size-10" />
          <Handshake className="absolute bottom-2 right-[14%] size-9 -rotate-6 text-amber-300/50 md:size-11" />
        </div>

        <div className="container relative mx-auto space-y-3 p-5 text-center">
          <Badge
            variant="secondary"
            className="h-7 rounded-full border border-amber-200 bg-white px-4 text-amber-700"
          >
            Dịch vụ công trực tuyến
          </Badge>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Dịch vụ
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-slate-600 md:text-base">
            Tra cứu thủ tục hành chính, nộp hồ sơ và tải biểu mẫu nhanh chóng
            cho người dân tại phường Cao Lãnh.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700">
            <ClipboardList className="size-4" />
            {services.length} nhóm dịch vụ
          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 py-10">
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <h2 className="text-xl inline-flex font-semibold leading-snug line-clamp-2">
                    {service.title}
                  </h2>
                  <CardTitle className="text-base text-muted-foreground leading-snug line-clamp-2">
                    {service.description}
                  </CardTitle>
                </CardHeader>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full hover:bg-pink-600 hover:text-white transition-colors duration-400"
                    onClick={() => {
                      router.push(service.href);
                    }}
                  >
                    Tìm hiểu thêm
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
>>>>>>> 6dad0d803cdb2498e58b360c22d2c7971b199c19
    </div>
  );
}
