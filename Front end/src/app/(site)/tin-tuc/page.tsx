import Link from "next/link";
import { getPublicArticles } from "@/lib/api/article";
import { Article } from "@/types";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/api/config";
import { BellRing, CalendarDays, Newspaper } from "lucide-react";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export const revalidate = 300;

function formatPublishedDate(article: Article): string {
  const rawDate = article.publishedAt || article.createdAt || article.updatedAt;

  if (!rawDate) {
    return "Dang cap nhat";
  }

  return new Date(rawDate).toLocaleDateString("vi-VN");
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

export default async function TinTuc() {
  const articles = (await getPublicArticles()) as Article[];

  return (
    <div>
      <div className="relative overflow-hidden border-b bg-rose-50/70">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Newspaper className="absolute left-6 top-4 size-10 -rotate-12 text-rose-300/60 sm:size-14" />
          <Newspaper className="absolute right-8 top-6 size-12 rotate-12 text-emerald-300/55 sm:size-16" />
          <Newspaper className="absolute left-[14%] bottom-5 size-9 rotate-6 text-rose-300/50 sm:size-12" />
          <Newspaper className="absolute right-[18%] bottom-4 size-10 -rotate-6 text-emerald-300/50 sm:size-14" />
          <Newspaper className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rotate-[8deg] text-slate-300/20" />
        </div>
        <div className="container relative mx-auto flex flex-col items-center gap-4 p-5 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            <BellRing className="size-3.5" />
            Cập nhật mỗi ngày
          </span>
          <h1 className="text-3xl font-black tracking-tight text-pink-600 ">
            Tin tức
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            Tổng hợp thông tin mới nhất về hoạt động địa phương, thông báo hành
            chính và các sự kiện nổi bật.
          </p>

          <Badge
            variant="secondary"
            className=" border-rose-200 bg-white/80 px-4 py-3 text-sm font-semibold text-rose-600"
          >
            <Newspaper className="size-4" />
            Bản tin địa phương
          </Badge>
        </div>
      </div>
      <main className="container mx-auto mt-8 space-y-10 px-6">
        <div>
          <Tabs defaultValue="all">
            <TabsList variant="default">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="1">1</TabsTrigger>
              <TabsTrigger value="2">2</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        {articles.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Chưa có bài viết để hiển thị.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {articles.map((article) => {
              const thumbnailUrl = resolveThumbnailUrl(article.thumbnailUrl);
              return (
                <Link
                  href={`/tin-tuc/${article.articleId}`}
                  key={article.articleId}
                  className="hover:text-pink-600 transition-colors duration-100"
                >
                  <Card className="group h-full gap-0 overflow-hidden rounded-3xl bg-[#f3f5f4] py-0 shadow-[0_12px_32px_rgba(15,23,42,0.08)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(15,23,42,0.14)]">
                    <div className="relative aspect-video w-full overflow-hidden">
                      {thumbnailUrl ? (
                        <Image
                          src={thumbnailUrl}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                          Không có ảnh
                        </div>
                      )}
                    </div>

                    <CardContent className="flex flex-1 flex-col space-y-4 px-6 pt-5">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="size-4" />
                          {formatPublishedDate(article)}
                        </span>
                        <Badge
                          variant="secondary"
                          className="h-6 rounded-full bg-emerald-100 px-3 text-emerald-700 hover:bg-emerald-100"
                        >
                          {article.categoryName || "Tin tức"}
                        </Badge>
                      </div>

                      <CardTitle className="line-clamp-2 min-h-14 text-xl font-bold leading-tight text-pink-600">
                        {article.title}
                      </CardTitle>

                      <CardDescription className="line-clamp-3 min-h-16 text-base leading-8">
                        {article.summary || "Đang cập nhật nội dung bài viết."}
                      </CardDescription>
                    </CardContent>

                    <CardFooter className="mt-auto border-0 bg-transparent px-6 pb-6 pt-2">
                      Đọc tiếp
                      <span aria-hidden>→</span>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
