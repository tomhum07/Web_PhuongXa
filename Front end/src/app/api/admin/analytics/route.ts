import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type RangeDays = 7 | 14 | 30;
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

function toRangeDays(value: string | null): RangeDays {
  const parsed = Number(value ?? "7");
  if (parsed === 14 || parsed === 30) {
    return parsed;
  }

  return 7;
}

function toGranularity(value: string | null): AnalyticsGranularity {
  return value === "hour" ? "hour" : "day";
}

function readEnv(keys: string[]): string | null {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return null;
}

function normalizePrivateKey(rawValue: string): string {
  // Support escaped newlines in .env.local secrets.
  return rawValue.replace(/\\n/g, "\n");
}

function toIsoDateFromGa(gaDate: string): string {
  if (!/^\d{8}$/.test(gaDate)) {
    return gaDate;
  }

  const year = gaDate.slice(0, 4);
  const month = gaDate.slice(4, 6);
  const day = gaDate.slice(6, 8);
  return `${year}-${month}-${day}`;
}

function toIsoDateHourFromGa(gaDateHour: string): string {
  if (!/^\d{10}$/.test(gaDateHour)) {
    return gaDateHour;
  }

  const year = gaDateHour.slice(0, 4);
  const month = gaDateHour.slice(4, 6);
  const day = gaDateHour.slice(6, 8);
  const hour = gaDateHour.slice(8, 10);

  return `${year}-${month}-${day} ${hour}:00`;
}

export async function GET(request: NextRequest) {
  const rangeDays = toRangeDays(request.nextUrl.searchParams.get("range"));
  const granularity = toGranularity(
    request.nextUrl.searchParams.get("granularity"),
  );

  const measurementId = readEnv(["NEXT_PUBLIC_GA_ID", "GA_MEASUREMENT_ID"]);
  const propertyId = readEnv([
    "GA4_PROPERTY_ID",
    "NEXT_PUBLIC_GA4_PROPERTY_ID",
  ]);
  const clientEmail = readEnv(["GOOGLE_CLIENT_EMAIL"]);
  const privateKeyRaw = readEnv(["GOOGLE_PRIVATE_KEY"]);

  if (!measurementId || !propertyId || !clientEmail || !privateKeyRaw) {
    return NextResponse.json(
      {
        ok: false,
        message: "Thiếu cấu hình Google Analytics trong biến môi trường.",
        rangeDays,
        granularity,
        measurementId: measurementId ?? null,
        propertyId: propertyId ?? null,
        points: [],
        topPages: [],
        summary: {
          totalSessions: 0,
          totalArticleViews: 0,
          totalUsers: 0,
        },
        source: "ga-data-api",
        generatedAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }

  try {
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: normalizePrivateKey(privateKeyRaw),
      },
    });

    const [trafficReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate:
            granularity === "hour" ? "1daysAgo" : `${rangeDays}daysAgo`,
          endDate: "today",
        },
      ],
      dimensions: [{ name: granularity === "hour" ? "dateHour" : "date" }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "screenPageViews" },
      ],
      orderBys: [
        {
          dimension: {
            dimensionName: granularity === "hour" ? "dateHour" : "date",
          },
        },
      ],
    });

    const [topPagesReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate:
            granularity === "hour" ? "1daysAgo" : `${rangeDays}daysAgo`,
          endDate: "today",
        },
      ],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [
        {
          metric: {
            metricName: "screenPageViews",
          },
          desc: true,
        },
      ],
      limit: 50,
    });

    const points: AnalyticsPoint[] = (trafficReport.rows ?? []).map((row) => {
      const rawDate = row.dimensionValues?.[0]?.value ?? "";
      const sessions = Number(row.metricValues?.[0]?.value ?? "0");
      const users = Number(row.metricValues?.[1]?.value ?? "0");
      const pageViews = Number(row.metricValues?.[2]?.value ?? "0");

      return {
        date:
          granularity === "hour"
            ? toIsoDateHourFromGa(rawDate)
            : toIsoDateFromGa(rawDate),
        sessions,
        users,
        articleViews: pageViews,
      };
    });

    const topPages: TopPage[] = (topPagesReport.rows ?? [])
      .map((row) => ({
        page: row.dimensionValues?.[0]?.value ?? "",
        views: Number(row.metricValues?.[0]?.value ?? "0"),
      }))
      .filter((item) => item.page.startsWith("/tin-tuc"))
      .slice(0, 10);

    const summary = points.reduce(
      (acc, item) => {
        acc.totalSessions += item.sessions;
        acc.totalArticleViews += item.articleViews;
        acc.totalUsers += item.users;
        return acc;
      },
      {
        totalSessions: 0,
        totalArticleViews: 0,
        totalUsers: 0,
      },
    );

    return NextResponse.json({
      ok: true,
      rangeDays,
      granularity,
      measurementId,
      propertyId,
      points,
      topPages,
      summary,
      source: "ga-data-api",
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể lấy dữ liệu từ Google Analytics Data API.",
        rangeDays,
        granularity,
        measurementId,
        propertyId,
        points: [],
        topPages: [],
        summary: {
          totalSessions: 0,
          totalArticleViews: 0,
          totalUsers: 0,
        },
        source: "ga-data-api",
        generatedAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
