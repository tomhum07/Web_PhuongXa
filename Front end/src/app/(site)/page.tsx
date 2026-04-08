import Hero from "@/components/ui/Hero/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  ArrowRight,
  FileText,
  Landmark,
  Briefcase,
  Compass,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getLatestArticles } from "@/lib/api/article";
import { Article } from "@/types";
import { Separator } from "@/components/ui/separator";
import { API_BASE_URL } from "@/lib/api/config";
import { Badge } from "@/components/ui/badge";

export const revalidate = 300;

function formatDate(dateValue?: string): string {
  if (!dateValue) {
    return "Chưa cập nhật";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "Chưa cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function resolveThumbnailUrl(thumbnailUrl?: string): string {
  if (!thumbnailUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(thumbnailUrl)) {
    return thumbnailUrl;
  }

  const normalizedPath = thumbnailUrl.startsWith("/")
    ? thumbnailUrl
    : `/${thumbnailUrl}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

const serviceLinks = [
  {
    title: "Dịch vụ hành chính",
    href: "/dich-vu",
    description:
      "Tra cứu thủ tục, hồ sơ và quy trình giải quyết hồ sơ trực tuyến.",
    icon: FileText,
  },
  {
    title: "Thông tin quy hoạch",
    href: "/gioi-thieu",
    description:
      "Xem định hướng phát triển đô thị và các dự án hạ tầng trọng điểm.",
    icon: Landmark,
  },
  {
    title: "Hỗ trợ doanh nghiệp",
    href: "/lien-he",
    description:
      "Kênh tiếp nhận đề xuất, phản ánh và tư vấn cho hộ kinh doanh, doanh nghiệp.",
    icon: Briefcase,
  },
];

const basicStats = [
  { label: "Dân số", value: "184.297" },
  { label: "Khóm", value: "49" },
  { label: "Dịch vụ công trực tuyến", value: "35" },
  { label: "Sự kiện cộng đồng / năm", value: "40+" },
];

export default async function Home() {
  const featuredNews = (await getLatestArticles()) as Article[];
  const latestNews = featuredNews.slice(0, 5);
  const tickerItems = [...latestNews, ...latestNews];

  return (
    <div className="pb-12">
      <Hero />
      {latestNews.length > 0 ? (
        <section
          aria-label="5 tin tức mới nhất"
          className="border-y bg-muted/30"
        >
          <div className=" overflow-hidden mx-auto px-6">
            <div className="flex w-full  items-center gap-3 motion-reduce:animate-none animate-[news-ticker-scroll_28s_linear_infinite]">
              {tickerItems.map((news, index) => (
                <Link
                  key={`${news.articleId}-${index}`}
                  href={`/tin-tuc/${news.articleId}`}
                  className="shrink-0 px-4 py-2 text-sm"
                >
                  <Badge variant="outline">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0"></span>
                    {news.title}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <main className="container mx-auto mt-8 space-y-10 px-6">
        <section aria-labelledby="tong-quan" className="grid gap-6">
          <Card className="overflow-hidden">
            <CardHeader className="pb-0">
              <h2
                id="tong-quan"
                className="text-3xl md:text-4xl font-semibold leading-tight"
              >
                Phường Cao Lãnh
              </h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-600 shrink-0" />
                  Trung tâm Đồng Tháp
                </span>
                <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full border text-muted-foreground">
                  Đô thị lớn nhất tỉnh
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-4 grid gap-0 lg:grid-cols-2">
              {/* LEFT: Info */}
              <div className="flex flex-col gap-5 pr-0 lg:pr-6 pb-6 lg:pb-0 lg:border-r border-border">
                <p className="leading-relaxed text-muted-foreground">
                  Phường Cao Lãnh được thành lập theo Nghị quyết số
                  1663/NQ-UBTVQH15 ngày 16/6/2025 của Ủy ban Thường vụ Quốc hội
                  trên cơ sở hợp nhất 09 xã.
                </p>

                <Separator />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted rounded-lg px-4 py-3">
                    <p className=" font-medium text-muted-foreground mb-1">
                      Diện tích
                    </p>
                    <p className="text-xl font-semibold">
                      73,33
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        km²
                      </span>
                    </p>
                  </div>

                  <div className="bg-muted rounded-lg px-4 py-3">
                    <p className=" font-medium text-muted-foreground mb-1">
                      Dân số
                    </p>
                    <p className="text-xl font-semibold">
                      137K
                      <span className=" font-normal text-muted-foreground ml-1">
                        người
                      </span>
                    </p>
                  </div>

                  <div className="bg-muted rounded-lg px-4 py-3">
                    <p className=" font-medium text-muted-foreground mb-1">
                      Mật độ dân số
                    </p>
                    <p className="text-xl font-semibold">
                      1.873
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        người / km²
                      </span>
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Địa giới */}
                <div>
                  <p className="flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                    <Compass size={14} />
                    Vị trí địa giới
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                      { dir: "Đông", label: "Xã Mỹ Thọ" },
                      { dir: "Tây", label: "An Giang (sông Tiền)" },
                      { dir: "Nam", label: "Mỹ An Hưng, Tân Khánh Trung" },
                      { dir: "Bắc", label: "Mỹ Ngãi, Mỹ Trà" },
                    ].map(({ dir, label }) => (
                      <div
                        key={dir}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="shrink-0 mt-0.5 text-xs font-semibold bg-muted border border-border rounded px-1.5 py-0.5 text-foreground leading-none">
                          {dir}
                        </span>
                        <span className="leading-snug">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="leading-relaxed text-muted-foreground border-l-2 border-border pl-3">
                  Hệ thống giao thông thủy – bộ phát triển đồng bộ. Kinh tế tập
                  trung vào thương mại, dịch vụ và du lịch, kết hợp định hướng
                  nông nghiệp ứng dụng công nghệ cao.
                </p>
              </div>

              {/* RIGHT: Map */}
              <div className="relative min-h-[320px] lg:min-h-0 -mx-6 lg:mx-0 lg:pl-6 mt-6 lg:mt-0">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d75122.46348379116!2d105.58999479176944!3d10.445531319141818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310a65057df94f39%3A0x1d6b899429240cd4!2zQ2FvIEzDo25oLCDEkOG7k25nIFRow6FwLCBWaeG7h3QgTmFt!5e1!3m2!1svi!2s!4v1774287641651!5m2!1svi!2s"
                  className="absolute inset-0 w-full h-full border-0 rounded-xl"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bản đồ Phường Cao Lãnh"
                />
                <div className="absolute bottom-3 left-3 lg:left-9 bg-background/90 backdrop-blur-sm border border-border rounded-md px-2.5 py-1.5 text-xs font-medium pointer-events-none">
                  Cao Lãnh · Đồng Tháp
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
        <section aria-labelledby="tin-tuc-noi-bat" className="grid gap-6 ">
          <Card className="">
            <CardHeader>
              <CardTitle>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Tin tức nổi bật
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Các cập nhật mới nhất về hoạt động và thông báo tại địa
                  phương.
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
                {featuredNews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Chưa có tin tức để hiển thị.
                  </p>
                ) : (
                  featuredNews.map((news) => (
                    <Card
                      key={news.articleId}
                      className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                    >
                      <CardHeader>
                        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                          <CalendarDays className="size-3.5" />
                          {formatDate(
                            news.publishedAt ||
                              news.createdAt ||
                              news.updatedAt,
                          )}
                        </p>
                        <CardTitle className="text-base leading-snug line-clamp-2 min-h-[3rem]">
                          <Link
                            href={`/tin-tuc/${news.articleId}`}
                            className="hover:text-pink-600 transition-colors duration-100"
                          >
                            {news.title}
                          </Link>
                        </CardTitle>
                        <p className="text-muted-foreground line-clamp-3">
                          {news.summary || "Đang cập nhật nội dung tóm tắt."}
                        </p>
                      </CardHeader>
                      <CardContent className=" flex flex-col flex-1">
                        {resolveThumbnailUrl(news.thumbnailUrl) ? (
                          <Link
                            href={`/tin-tuc/${news.articleId}`}
                            className=""
                          >
                            <Image
                              src={resolveThumbnailUrl(news.thumbnailUrl)}
                              alt={news.title}
                              width={720}
                              height={405}
                              className="mb-3 w-full h-40 object-cover rounded-md"
                              unoptimized
                            />
                          </Link>
                        ) : null}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </section>
        <section
          aria-labelledby="dich-vu-va-tin-tuc"
          className="grid gap-6 lg:grid-cols-5"
        >
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>
                <h2
                  id="dich-vu-va-tin-tuc"
                  className="text-2xl md:text-3xl font-semibold tracking-tight"
                >
                  Liên kết dịch vụ
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Truy cập nhanh các nhóm dịch vụ và thông tin thường dùng.
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {serviceLinks.map((service) => {
                  const Icon = service.icon;

                  return (
                    <Card key={service.title} className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="size-4 text-primary" />
                          {service.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                          {service.description}
                        </p>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full justify-between"
                        >
                          <Link href={service.href}>
                            Truy cập
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Thống kê nhanh
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Các chỉ số nổi bật về dân cư và hoạt động địa phương.
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {basicStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border bg-muted/20 px-3 py-4 text-center"
                  >
                    <p className="text-xl font-semibold text-primary md:text-2xl hover:text-pink-500 hover:translate-y-[-2px]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="cta-hanh-dong">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2
                  id="cta-hanh-dong"
                  className="text-2xl md:text-3xl font-semibold tracking-tight"
                >
                  Kết nối nhanh
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Gửi phản ánh, theo dõi tin tức mới hoặc tra cứu dịch vụ công
                  trực tuyến.
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              <Button asChild size="lg">
                <Link href="/lien-he">Gửi phản ánh</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/tin-tuc">Xem tin tức</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/dich-vu">Tra cứu dịch vụ</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
