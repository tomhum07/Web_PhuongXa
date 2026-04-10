"use client";

// FIND_TAG: DASHBOARD_ANALYTICS_UI

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Clock3, Eye, FileText, Users } from "lucide-react";
import Link from "next/link";
import { Article } from "@/types";

import { TrafficOverviewChart } from "./traffic-overview-chart";
import { getAdminArticles, getCategories } from "@/lib/api/article";
import { getUsers } from "@/lib/api/user";
import { getFeedbacks } from "@/lib/api/admin-feedbacks";
import { getAdminGalleryImages } from "@/lib/api/gallery";
import { fetchAdminApplications } from "@/lib/api/admin-applications";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DateRange = 7 | 14 | 30;
type AnalyticsGranularity = "day" | "hour";

type AnalyticsPoint = {
  date: string;
  sessions: number;
  users: number;
  articleViews: number;
};

type TopPage = {
  page: string;
  views: number;
};

type AnalyticsResponse = {
  ok: boolean;
  rangeDays: number;
  granularity: AnalyticsGranularity;
  measurementId: string | null;
  propertyId: string | null;
  points: AnalyticsPoint[];
  topPages: TopPage[];
  summary: {
    totalSessions: number;
    totalArticleViews: number;
    totalUsers: number;
  };
  source: "ga-data-api";
  message?: string;
  generatedAt: string;
};

type WebsiteOverviewStats = {
  totalArticles: number;
  publishedArticles: number;
  pendingArticles: number;
  rejectedArticles: number;
  totalCategories: number;
  totalUsers: number;
  activeUsers: number;
  totalFeedbacks: number;
  unreadFeedbacks: number;
  repliedFeedbacks: number;
  totalGalleryImages: number;
  visibleGalleryImages: number;
  hiddenGalleryImages: number;
  totalApplications: number;
  processingApplications: number;
  completedApplications: number;
};

type NewsReport = {
  byCategory: Array<{ name: string; count: number }>;
  recent: Article[];
  topViewed: Article[];
};

const RANGE_OPTIONS: DateRange[] = [7, 14, 30];
const ANALYTICS_REFRESH_MS = 60_000;
const OVERVIEW_REFRESH_MS = 45_000;

function normalizeText(value?: string): string {
  return (value || "").trim().toLowerCase();
}

function isArticlePublished(status?: string): boolean {
  const value = normalizeText(status);
  return ["published", "approved", "public", "da duyet"].includes(value);
}

function isArticlePending(status?: string): boolean {
  const value = normalizeText(status);
  return ["pending", "draft", "submitted", "cho duyet"].includes(value);
}

function isArticleRejected(status?: string): boolean {
  const value = normalizeText(status);
  return ["rejected", "denied", "tu choi"].includes(value);
}

function normalizeFeedbackStatus(
  status?: string,
): "unread" | "read" | "replied" {
  const value = normalizeText(status);

  if (
    value.includes("chua doc") ||
    value.includes("chưa đọc") ||
    value.includes("unread")
  ) {
    return "unread";
  }

  if (
    value.includes("phan hoi") ||
    value.includes("phản hồi") ||
    value.includes("replied")
  ) {
    return "replied";
  }

  return "read";
}

function normalizeApplicationStatus(
  status: unknown,
): "processing" | "completed" | "other" {
  const value = normalizeText(String(status ?? ""));

  if (
    value.includes("processing") ||
    value.includes("dang xu ly") ||
    value.includes("đang xử lý")
  ) {
    return "processing";
  }

  if (
    value.includes("approved") ||
    value.includes("completed") ||
    value.includes("da giai quyet") ||
    value.includes("đã giải quyết")
  ) {
    return "completed";
  }

  return "other";
}

function toDisplayDateLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) {
    return isoDate;
  }

  return `${day}/${month}/${year}`;
}

function toDisplayHourLabel(isoDateHour: string): string {
  const [datePart, hourPart] = isoDateHour.split(" ");
  if (!datePart || !hourPart) {
    return isoDateHour;
  }

  const [year, month, day] = datePart.split("-");
  if (!year || !month || !day) {
    return isoDateHour;
  }

  return `${hourPart} ${day}/${month}`;
}

export function AdminAnalyticsDashboard() {
  const [rangeDays, setRangeDays] = useState<DateRange>(7);
  const [granularity, setGranularity] = useState<AnalyticsGranularity>("day");
  const [payload, setPayload] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [overviewStats, setOverviewStats] =
    useState<WebsiteOverviewStats | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState<boolean>(true);
  const [newsReport, setNewsReport] = useState<NewsReport | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const quickAdminLinks = useMemo(() => {
    return [
      {
        name: "Quản lý tài khoản",
        href: "/admin/quan-ly-tai-khoan",
        note: "Phân quyền, khóa/mở tài khoản",
        keyMetric: `${(overviewStats?.totalUsers ?? 0).toLocaleString("vi-VN")} tài khoản`,
      },
      {
        name: "Quản lý bài viết",
        href: "/admin/quan-ly-bai-viet",
        note: "Duyệt và cập nhật nội dung",
        keyMetric: `${(overviewStats?.totalArticles ?? 0).toLocaleString("vi-VN")} bài viết`,
      },
      {
        name: "Quản lý danh mục",
        href: "/admin/quan-ly-danh-muc",
        note: "Sắp xếp taxonomy nội dung",
        keyMetric: `${(overviewStats?.totalCategories ?? 0).toLocaleString("vi-VN")} danh mục`,
      },
    ];
  }, [overviewStats]);

  useEffect(() => {
    let isDisposed = false;

    async function loadOverviewStats() {
      setIsOverviewLoading(true);
      setOverviewError(null);

      try {
        const [
          articlesRes,
          categoriesRes,
          usersRes,
          feedbacksRes,
          galleryRes,
          applicationsRes,
        ] = await Promise.allSettled([
          getAdminArticles(),
          getCategories(),
          getUsers(),
          getFeedbacks(),
          getAdminGalleryImages(),
          fetchAdminApplications(),
        ]);

        const articles =
          articlesRes.status === "fulfilled" && Array.isArray(articlesRes.value)
            ? (articlesRes.value as Article[])
            : [];
        const categories =
          categoriesRes.status === "fulfilled" &&
          Array.isArray(categoriesRes.value)
            ? categoriesRes.value
            : [];
        const users =
          usersRes.status === "fulfilled" && Array.isArray(usersRes.value)
            ? usersRes.value
            : [];
        const feedbacks =
          feedbacksRes.status === "fulfilled" &&
          Array.isArray(feedbacksRes.value)
            ? feedbacksRes.value
            : [];
        const galleryItems =
          galleryRes.status === "fulfilled" && Array.isArray(galleryRes.value)
            ? galleryRes.value
            : [];
        const applications =
          applicationsRes.status === "fulfilled" &&
          Array.isArray(applicationsRes.value)
            ? applicationsRes.value
            : [];

        const unreadFeedbacks = feedbacks.filter(
          (item) => normalizeFeedbackStatus(item.status) === "unread",
        ).length;
        const repliedFeedbacks = feedbacks.filter(
          (item) => normalizeFeedbackStatus(item.status) === "replied",
        ).length;

        const processingApplications = applications.filter((item) => {
          const record = item as Record<string, unknown>;
          return (
            normalizeApplicationStatus(
              record.status ?? record.Status ?? record.statusText,
            ) === "processing"
          );
        }).length;

        const completedApplications = applications.filter((item) => {
          const record = item as Record<string, unknown>;
          return (
            normalizeApplicationStatus(
              record.status ?? record.Status ?? record.statusText,
            ) === "completed"
          );
        }).length;

        const nextStats: WebsiteOverviewStats = {
          totalArticles: articles.length,
          publishedArticles: articles.filter((item) =>
            isArticlePublished(item.status),
          ).length,
          pendingArticles: articles.filter((item) =>
            isArticlePending(item.status),
          ).length,
          rejectedArticles: articles.filter((item) =>
            isArticleRejected(item.status),
          ).length,
          totalCategories: categories.length,
          totalUsers: users.length,
          activeUsers: users.filter((item) =>
            Boolean(item.isActive ?? item.status === 1),
          ).length,
          totalFeedbacks: feedbacks.length,
          unreadFeedbacks,
          repliedFeedbacks,
          totalGalleryImages: galleryItems.length,
          visibleGalleryImages: galleryItems.filter((item) => item.isVisible)
            .length,
          hiddenGalleryImages: galleryItems.filter((item) => !item.isVisible)
            .length,
          totalApplications: applications.length,
          processingApplications,
          completedApplications,
        };

        const byCategoryMap = new Map<string, number>();
        for (const article of articles) {
          const categoryName = article.categoryName || "Chưa phân loại";
          byCategoryMap.set(
            categoryName,
            (byCategoryMap.get(categoryName) ?? 0) + 1,
          );
        }

        const byCategory = Array.from(byCategoryMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        const toTime = (value?: string) => {
          if (!value) return 0;
          const timestamp = new Date(value).getTime();
          return Number.isFinite(timestamp) ? timestamp : 0;
        };

        const recent = [...articles]
          .sort((a, b) => {
            const aTime =
              toTime(a.updatedAt) ||
              toTime(a.publishedAt) ||
              toTime(a.createdAt);
            const bTime =
              toTime(b.updatedAt) ||
              toTime(b.publishedAt) ||
              toTime(b.createdAt);
            return bTime - aTime;
          })
          .slice(0, 6);

        const topViewed = [...articles]
          .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
          .slice(0, 6);

        if (!isDisposed) {
          setOverviewStats(nextStats);
          setNewsReport({ byCategory, recent, topViewed });
        }
      } catch (error) {
        if (!isDisposed) {
          setOverviewError(
            error instanceof Error
              ? error.message
              : "Không thể tải thống kê hệ thống.",
          );
          setOverviewStats(null);
          setNewsReport(null);
        }
      } finally {
        if (!isDisposed) {
          setIsOverviewLoading(false);
        }
      }
    }

    void loadOverviewStats();
    const intervalId = window.setInterval(() => {
      void loadOverviewStats();
    }, OVERVIEW_REFRESH_MS);

    return () => {
      isDisposed = true;
      window.clearInterval(intervalId);
    };
  }, [refreshTick]);

  useEffect(() => {
    let isDisposed = false;

    async function loadAnalyticsData() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(
          `/api/admin/analytics?range=${rangeDays}&granularity=${granularity}`,
          {
            cache: "no-store",
          },
        );

        const data = (await response.json()) as AnalyticsResponse;

        if (!response.ok || !data.ok) {
          throw new Error("Không thể tải dữ liệu analytics.");
        }

        if (!isDisposed) {
          setPayload(data);
        }
      } catch (error) {
        if (!isDisposed) {
          setErrorMessage(
            error instanceof Error ? error.message : "Không thể tải dữ liệu.",
          );
          setPayload(null);
        }
      } finally {
        if (!isDisposed) {
          setIsLoading(false);
        }
      }
    }

    void loadAnalyticsData();
    const intervalId = window.setInterval(() => {
      void loadAnalyticsData();
    }, ANALYTICS_REFRESH_MS);

    return () => {
      isDisposed = true;
      window.clearInterval(intervalId);
    };
  }, [rangeDays, granularity, refreshTick]);

  const points = useMemo(() => payload?.points ?? [], [payload?.points]);
  const chartLabels = useMemo(
    () =>
      points.map((item) =>
        granularity === "hour"
          ? toDisplayHourLabel(item.date)
          : toDisplayDateLabel(item.date),
      ),
    [points, granularity],
  );
  const sessionSeries = useMemo(
    () => points.map((item) => item.sessions),
    [points],
  );
  const articleViewSeries = useMemo(
    () => points.map((item) => item.articleViews),
    [points],
  );

  const totalSessions = payload?.summary.totalSessions ?? 0;
  const totalArticleViews = payload?.summary.totalArticleViews ?? 0;
  const totalUsers = payload?.summary.totalUsers ?? 0;
  const averageArticleViews = points.length
    ? Math.round(totalArticleViews / points.length)
    : 0;
  const latest = points[points.length - 1];
  const previous = points[points.length - 2];
  const sessionGrowth =
    latest && previous ? latest.sessions - previous.sessions : 0;
  const dateRange = points.length
    ? granularity === "hour"
      ? `${toDisplayHourLabel(points[0].date)} - ${toDisplayHourLabel(points[points.length - 1].date)}`
      : `${toDisplayDateLabel(points[0].date)} - ${toDisplayDateLabel(points[points.length - 1].date)}`
    : "-";
  const topPages = payload?.topPages ?? [];

  const kpis = [
    {
      title: `Phiên truy cập ${rangeDays} ngày`,
      value: totalSessions.toLocaleString("vi-VN"),
      change: `${sessionGrowth >= 0 ? "+" : ""}${sessionGrowth.toLocaleString("vi-VN")} so với ngày trước`,
      icon: Eye,
    },
    {
      title: "Người dùng 7 ngày",
      value: totalUsers.toLocaleString("vi-VN"),
      change: latest ? `${latest.users.toLocaleString("vi-VN")} hôm nay` : "-",
      icon: Users,
    },
    {
      title: "Lượt xem bài viết",
      value: totalArticleViews.toLocaleString("vi-VN"),
      change: `${averageArticleViews.toLocaleString("vi-VN")}/ngày`,
      icon: FileText,
    },
  ];

  const trafficSummary = [
    {
      label: "Tổng phiên 7 ngày",
      value: totalSessions.toLocaleString("vi-VN"),
      icon: Clock3,
    },
    {
      label: "Thời gian truy cập TB",
      value: "01:18",
      icon: Clock3,
    },
  ];

  const websiteOverviewCards = [
    {
      title: "Bài viết",
      value: (overviewStats?.totalArticles ?? 0).toLocaleString("vi-VN"),
      helper: `${(overviewStats?.publishedArticles ?? 0).toLocaleString("vi-VN")} đã duyệt · ${(overviewStats?.pendingArticles ?? 0).toLocaleString("vi-VN")} chờ duyệt`,
    },
    {
      title: "Danh mục",
      value: (overviewStats?.totalCategories ?? 0).toLocaleString("vi-VN"),
      helper: "Tổng số taxonomy nội dung",
    },
    {
      title: "Tài khoản",
      value: (overviewStats?.totalUsers ?? 0).toLocaleString("vi-VN"),
      helper: `${(overviewStats?.activeUsers ?? 0).toLocaleString("vi-VN")} đang hoạt động`,
    },
    {
      title: "Phản hồi",
      value: (overviewStats?.totalFeedbacks ?? 0).toLocaleString("vi-VN"),
      helper: `${(overviewStats?.unreadFeedbacks ?? 0).toLocaleString("vi-VN")} chưa đọc · ${(overviewStats?.repliedFeedbacks ?? 0).toLocaleString("vi-VN")} đã phản hồi`,
    },
    {
      title: "Ảnh thư viện",
      value: (overviewStats?.totalGalleryImages ?? 0).toLocaleString("vi-VN"),
      helper: `${(overviewStats?.visibleGalleryImages ?? 0).toLocaleString("vi-VN")} hiển thị · ${(overviewStats?.hiddenGalleryImages ?? 0).toLocaleString("vi-VN")} đã ẩn`,
    },
    {
      title: "Hồ sơ trực tuyến",
      value: (overviewStats?.totalApplications ?? 0).toLocaleString("vi-VN"),
      helper: `${(overviewStats?.processingApplications ?? 0).toLocaleString("vi-VN")} đang xử lý · ${(overviewStats?.completedApplications ?? 0).toLocaleString("vi-VN")} đã giải quyết`,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-card p-5">
        <h2 className="text-2xl font-bold">Tổng quan Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Biểu đồ dùng Chart.js, dữ liệu lấy trực tiếp từ Google Analytics Data
          API.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Nguồn: {payload?.source ?? "dang tai"} | Chế độ:{" "}
          {granularity === "hour" ? "Theo giờ (24h)" : "Theo ngày"} | Khoảng dữ
          liệu: {dateRange}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={granularity === "day" ? "default" : "outline"}
          size="sm"
          disabled={isLoading}
          onClick={() => setGranularity("day")}
        >
          Theo ngày
        </Button>
        <Button
          variant={granularity === "hour" ? "default" : "outline"}
          size="sm"
          disabled={isLoading}
          onClick={() => setGranularity("hour")}
        >
          Theo giờ (24h)
        </Button>

        {RANGE_OPTIONS.map((option) => (
          <Button
            key={option}
            variant={rangeDays === option ? "default" : "outline"}
            size="sm"
            disabled={isLoading || granularity === "hour"}
            onClick={() => setRangeDays(option)}
          >
            {option} ngày
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRefreshTick((current) => current + 1)}
          disabled={isLoading || isOverviewLoading}
        >
          Làm mới ngay
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Tự động làm mới: lượt truy cập mỗi {ANALYTICS_REFRESH_MS / 1000}s, thống
        kê hệ thống mỗi {OVERVIEW_REFRESH_MS / 1000}s.
      </p>

      {overviewError ? (
        <Card>
          <CardHeader>
            <CardTitle>Không thể tải thống kê hệ thống</CardTitle>
            <CardDescription>{overviewError}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Thống kê hệ thống website</CardTitle>
          <CardDescription>
            Dữ liệu tổng hợp từ các phân hệ quản trị nội dung và dịch vụ công.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {websiteOverviewCards.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border bg-muted/20 p-4"
              >
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className="mt-2 text-3xl font-bold leading-none">
                  {item.value}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {isOverviewLoading ? "Đang tải dữ liệu..." : item.helper}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Báo cáo tin tức theo danh mục</CardTitle>
            <CardDescription>
              Top danh mục có nhiều bài viết nhất.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Danh mục</TableHead>
                  <TableHead className="text-right">Số bài</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsReport?.byCategory?.length ? (
                  newsReport.byCategory.map((item) => (
                    <TableRow key={item.name}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">
                        {item.count.toLocaleString("vi-VN")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      {isOverviewLoading
                        ? "Đang tải dữ liệu..."
                        : "Chưa có dữ liệu."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Báo cáo tin tức mới cập nhật</CardTitle>
            <CardDescription>
              6 bài viết gần đây nhất theo thời gian cập nhật.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead className="text-right">Lượt xem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsReport?.recent?.length ? (
                  newsReport.recent.map((article) => (
                    <TableRow key={article.articleId}>
                      <TableCell
                        className="max-w-[18rem] truncate font-medium"
                        title={article.title}
                      >
                        {article.title}
                      </TableCell>
                      <TableCell className="text-right">
                        {(article.viewCount ?? 0).toLocaleString("vi-VN")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      {isOverviewLoading
                        ? "Đang tải dữ liệu..."
                        : "Chưa có dữ liệu."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Báo cáo tin tức theo lượt xem</CardTitle>
            <CardDescription>
              Top bài viết có lượt xem cao nhất.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead className="text-right">Lượt xem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsReport?.topViewed?.length ? (
                  newsReport.topViewed.map((article) => (
                    <TableRow key={article.articleId}>
                      <TableCell
                        className="max-w-[18rem] truncate font-medium"
                        title={article.title}
                      >
                        {article.title}
                      </TableCell>
                      <TableCell className="text-right">
                        {(article.viewCount ?? 0).toLocaleString("vi-VN")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      {isOverviewLoading
                        ? "Đang tải dữ liệu..."
                        : "Chưa có dữ liệu."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {errorMessage ? (
        <Card>
          <CardHeader>
            <CardTitle>Không thể tải dữ liệu analytics</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardHeader className="pb-2">
                <CardDescription>{item.title}</CardDescription>
                <CardTitle className="text-2xl">{item.value}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="flex items-center gap-1 text-xs font-medium text-blue-700">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {item.change}
                </p>
                <span className="rounded-md bg-muted p-1.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Biểu đồ lượt truy cập từ Google Analytics</CardTitle>
          <CardDescription>
            Dữ liệu theo ngày từ GA Data API, hiển thị bằng Chart.js.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TrafficOverviewChart
            labels={chartLabels}
            sessions={sessionSeries}
            articleViews={articleViewSeries}
          />
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {trafficSummary.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-md border px-3 py-2 text-xs"
                >
                  <p className="text-muted-foreground">{item.label}</p>
                  <p className="mt-1 flex items-center gap-1.5 font-medium">
                    <Icon className="h-3.5 w-3.5" />
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top trang bài viết theo lượt xem</CardTitle>
            <CardDescription>
              Dữ liệu từ Google Analytics Data API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trang</TableHead>
                  <TableHead className="text-right">Lượt xem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topPages.length ? (
                  topPages.map((item) => (
                    <TableRow key={item.page}>
                      <TableCell className="font-medium">{item.page}</TableCell>
                      <TableCell className="text-right">
                        {item.views.toLocaleString("vi-VN")}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="text-muted-foreground" colSpan={2}>
                      {isLoading
                        ? "Đang tải dữ liệu..."
                        : "Không có dữ liệu trong khoảng ngày đã chọn."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Truy cập nhanh quản lý</CardTitle>
            <CardDescription>
              Điểm vào nhanh đến các phân hệ quản trị
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mục quản lý</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>Chỉ số</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quickAdminLinks.map((item) => (
                  <TableRow key={item.href}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.note}</TableCell>
                    <TableCell>{item.keyMetric}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={item.href}>Mở mục</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
