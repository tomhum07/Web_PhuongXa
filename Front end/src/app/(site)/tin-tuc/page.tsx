import Link from "next/link";
import { getPublicArticles } from "@/lib/api/article";
import { Article } from "@/types";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/api/config";
import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { BellRing, CalendarDays, Newspaper } from "lucide-react";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewsCategorySelect } from "@/components/site/news-category-select";

export const metadata: Metadata = generatePageMetadata({
  title: "Tin Tức & Thông Báo | Phường Cao Lãnh",
  description:
    "Cập nhật tin tức, thông báo và sự kiện mới nhất từ Phường Cao Lãnh. Thông tin chính thống từ chính quyền địa phương.",
  keywords: ["tin tức", "thông báo", "Phường Cao Lãnh", "Cao Lãnh", "sự kiện"],
  url: "/tin-tuc",
});

// ISR - Revalidate every 5 minutes (300 seconds)
// This page will be statically generated and revalidated in the background
export const revalidate = 300;

// Use dynamic rendering for query parameters
export const dynamic = "force-dynamic";

type TinTucPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

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

export default async function TinTuc({ searchParams }: TinTucPageProps) {
  const { category } = await searchParams;
  const selectedCategoryId = Number(category);
  const hasValidCategoryFilter =
    Number.isFinite(selectedCategoryId) && selectedCategoryId > 0;

  const articles = (await getPublicArticles()) as Article[];
  const categoriesWithArticles = Array.from(
    new Map(
      articles
        .filter((article) => article.categoryId > 0)
        .map((article) => [
          article.categoryId,
          {
            categoryId: article.categoryId,
            name: article.categoryName || `Danh mục ${article.categoryId}`,
          },
        ]),
    ).values(),
  );

  const filteredArticles = hasValidCategoryFilter
    ? articles.filter((article) => article.categoryId === selectedCategoryId)
    : articles;
  const selectedCategoryValue = hasValidCategoryFilter
    ? String(selectedCategoryId)
    : "all";

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
          <NewsCategorySelect
            categories={categoriesWithArticles}
            selectedValue={selectedCategoryValue}
          />
        </div>

        {filteredArticles.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Không có bài viết trong danh mục đã chọn.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {filteredArticles.map((article) => {
              const thumbnailUrl = resolveThumbnailUrl(article.thumbnailUrl);
              return (
                <Link
                  href={`/tin-tuc/${article.articleId}`}
                  key={article.articleId}
                  className="hover:text-pink-600 transition-colors duration-100 "
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
