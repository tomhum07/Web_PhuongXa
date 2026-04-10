import Hero from "@/components/ui/Hero/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import {
  CalendarDays,
  ArrowRight,
  FileText,
  Send,
  Search,
  Compass,
  ChevronRight,
  MapPin,
  Users,
  Building2,
  Globe,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { getLatestArticles } from "@/lib/api/article";
import { Article } from "@/types";
import { Separator } from "@/components/ui/separator";
import { API_BASE_URL } from "@/lib/api/config";

export const metadata: Metadata = generatePageMetadata({
  title: "Phường Cao Lãnh | Thành Phố Cao Lãnh, Đồng Tháp",
  description:
    "Trang chủ chính thức Phường Cao Lãnh. Cung cấp thông tin, dịch vụ công, tin tức, thủ tục hành chính và thư viện ảnh về Phường Cao Lãnh.",
  keywords: [
    "Phường Cao Lãnh",
    "Cao Lãnh",
    "Đồng Tháp",
    "dịch vụ công",
    "thủ tục hành chính",
  ],
  url: "/",
});

export const revalidate = 300;
export const dynamic = "force-static";

function formatDate(dateValue?: string): string {
  if (!dateValue) return "Chưa cập nhật";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function resolveThumbnailUrl(thumbnailUrl?: string): string {
  if (!thumbnailUrl) return "";
  if (/^https?:\/\//i.test(thumbnailUrl)) return thumbnailUrl;
  const normalizedPath = thumbnailUrl.startsWith("/")
    ? thumbnailUrl
    : `/${thumbnailUrl}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

const serviceLinks = [
  {
    title: "Thủ tục hành chính",
    href: "/dich-vu/thu-tuc-hanh-chinh",
    description: "Hướng dẫn các thủ tục hành chính tại phường.",
    icon: FileText,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Nộp hồ sơ trực tuyến",
    href: "/dich-vu/nop-ho-so-truc-tuyen",
    description: "Gửi hồ sơ thủ tục hành chính trực tuyến.",
    icon: Send,
    color: "bg-green-50 text-green-600",
  },
  {
    title: "Tra cứu hồ sơ",
    href: "/dich-vu/tra-cuu-ho-so",
    description: "Kiểm tra trạng thái và thông tin hồ sơ đã nộp.",
    icon: Search,
    color: "bg-amber-50 text-amber-600",
  },
];

const basicStats = [
  { label: "Dân số", value: "184.297", icon: Users },
  { label: "Khóm", value: "49", icon: MapPin },
  { label: "Dịch vụ công trực tuyến", value: "35", icon: Globe },
  { label: "Sự kiện cộng đồng / năm", value: "40+", icon: Building2 },
];

const borders = [
  { dir: "Đông", label: "Xã Mỹ Thọ" },
  { dir: "Tây", label: "An Giang (sông Tiền)" },
  { dir: "Nam", label: "Mỹ An Hưng, Tân Khánh Trung" },
  { dir: "Bắc", label: "Mỹ Ngãi, Mỹ Trà" },
];

export default async function Home() {
  const featuredNews = (await getLatestArticles()) as Article[];
  const latestNews = featuredNews.slice(0, 5);
  const tickerItems = [...latestNews, ...latestNews];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ── Hero ── */}
      <Hero />

      {/* ── Ticker ── */}
      {latestNews.length > 0 && (
        <div className="border-b bg-background">
          <div className="flex items-center gap-3 px-4 py-2.5 overflow-hidden">
            <Badge
              variant="outline"
              className="shrink-0 bg-red-50 text-red-600 border-red-200 text-xs font-semibold uppercase px-3 py-1.5"
            >
              Tin mới
            </Badge>
            <div className="overflow-hidden group">
              <div className="flex min-w-max gap-6 text-sm text-muted-foreground animate-[news-ticker-scroll_32s_linear_infinite] group-hover:paused">
                {tickerItems.map((news, index) => (
                  <Link
                    key={`${news.articleId}-${index}`}
                    href={`/tin-tuc/${news.articleId}`}
                    className="flex max-w-[18rem] items-center gap-2 shrink-0 overflow-hidden hover:text-foreground transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    <span className="truncate">{news.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* ── Tin tức nổi bật ── */}
        <section aria-labelledby="heading-news">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle
                    id="heading-news"
                    className="text-xl font-semibold "
                  >
                    Tin tức nổi bật
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Cập nhật mới nhất về hoạt động và thông báo tại địa phương.
                  </p>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-primary"
                >
                  <Link href="/tin-tuc" className="flex items-center gap-1">
                    Xem tất cả <ChevronRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {featuredNews.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Chưa có tin tức để hiển thị.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {featuredNews.map((news) => (
                    <article
                      key={news.articleId}
                      className="group flex h-full flex-col overflow-hidden rounded-xl border bg-muted/30 transition-all duration-200 hover:bg-muted/60 hover:shadow-sm"
                    >
                      <Link
                        href={`/tin-tuc/${news.articleId}`}
                        className="block"
                      >
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          {resolveThumbnailUrl(news.thumbnailUrl) ? (
                            <Image
                              src={resolveThumbnailUrl(news.thumbnailUrl)}
                              alt={news.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                              unoptimized
                            />
                          ) : null}
                        </div>
                      </Link>

                      <div className="flex flex-1 flex-col gap-1.5 p-4">
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarDays className="size-3" />
                          {formatDate(
                            news.publishedAt ||
                              news.createdAt ||
                              news.updatedAt,
                          )}
                        </p>
                        <h3 className="min-h-13 text-sm font-medium leading-tight line-clamp-2">
                          <Link
                            href={`/tin-tuc/${news.articleId}`}
                            className="hover:text-primary transition-colors"
                          >
                            {news.title}
                          </Link>
                        </h3>

                        <p className="min-h-13 text-xs text-muted-foreground line-clamp-3 mt-0.5">
                          {news.summary || "Đang cập nhật nội dung tóm tắt."}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ── Giới thiệu phường ── */}
        <section aria-labelledby="heading-overview">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle
                    id="heading-overview"
                    className="text-2xl font-semibold"
                  >
                    Phường Cao Lãnh
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-pink-500 shrink-0" />
                      Trung tâm Đồng Tháp
                    </span>
                    <span className="inline-flex items-center text-xs px-3 py-1 rounded-full border text-muted-foreground">
                      Đô thị lớn nhất tỉnh
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-5">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left: Info */}
                <div className="flex flex-col gap-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Phường Cao Lãnh được thành lập theo Nghị quyết số
                    1663/NQ-UBTVQH15 ngày 16/6/2025 của Ủy ban Thường vụ Quốc
                    hội trên cơ sở hợp nhất 09 xã.
                  </p>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-muted px-3 py-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Diện tích
                      </p>
                      <p className="text-lg font-semibold leading-tight">
                        73,33
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          km²
                        </span>
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted px-3 py-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Dân số
                      </p>
                      <p className="text-lg font-semibold leading-tight">
                        137K
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          người
                        </span>
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted px-3 py-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Mật độ
                      </p>
                      <p className="text-lg font-semibold leading-tight">
                        1.873
                        <span className="text-xs font-normal text-muted-foreground ml-1">
                          ng/km²
                        </span>
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Địa giới */}
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                      <Compass size={12} /> Vị trí địa giới
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                      {borders.map(({ dir, label }) => (
                        <div
                          key={dir}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="shrink-0 mt-0.5 text-xs font-semibold bg-muted border rounded px-1.5 py-0.5 text-foreground leading-none">
                            {dir}
                          </span>
                          <span className="leading-snug">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground border-l-2 border-border pl-3">
                    Hệ thống giao thông thủy – bộ phát triển đồng bộ. Kinh tế
                    tập trung vào thương mại, dịch vụ và du lịch, kết hợp định
                    hướng nông nghiệp ứng dụng công nghệ cao.
                  </p>
                </div>

                {/* Right: Map */}
                <div className="min-h-70 overflow-hidden rounded-xl border">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d75122.46348379116!2d105.58999479176944!3d10.445531319141818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310a65057df94f39%3A0x1d6b899429240cd4!2zQ2FvIEzDo25oLCDEkOG7k25nIFRow6FwLCBWaeG7h3QgTmFt!5e1!3m2!1svi!2s!4v1774287641651!5m2!1svi!2s"
                    className="min-h-70 h-full w-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Bản đồ Phường Cao Lãnh"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Dịch vụ + Thống kê ── */}
        <section
          aria-labelledby="heading-services"
          className="grid gap-6 lg:grid-cols-5"
        >
          {/* Liên kết dịch vụ */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-4">
              <CardTitle
                id="heading-services"
                className="text-xl font-semibold"
              >
                Liên kết dịch vụ
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Truy cập nhanh các nhóm dịch vụ và thông tin thường dùng.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {serviceLinks.map((service) => {
                  const Icon = service.icon;
                  return (
                    <Link
                      key={service.title}
                      href={service.href}
                      className="group flex items-center gap-4 rounded-xl border bg-muted/20 px-4 py-3.5 transition-all duration-150 hover:bg-muted/50 hover:shadow-sm"
                    >
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${service.color}`}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {service.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {service.description}
                        </p>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Thống kê nhanh */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">
                Thống kê nhanh
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Các chỉ số nổi bật về dân cư và hoạt động địa phương.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {basicStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="flex flex-col gap-2 rounded-xl border bg-muted/20 px-3 py-4"
                    >
                      <Icon className="size-4 text-muted-foreground" />
                      <p className="text-2xl font-semibold text-primary leading-none">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground leading-snug">
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Kết nối nhanh ── */}
        <section aria-labelledby="heading-cta">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle id="heading-cta" className="text-xl font-semibold">
                Kết nối nhanh
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Gửi phản ánh, theo dõi tin tức mới hoặc tra cứu dịch vụ công
                trực tuyến.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                >
                  <Link href="/lien-he">Gửi phản ánh</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full">
                  <Link href="/tin-tuc">Xem tin tức</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="w-full"
                >
                  <Link href="/dich-vu">Tra cứu dịch vụ</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
