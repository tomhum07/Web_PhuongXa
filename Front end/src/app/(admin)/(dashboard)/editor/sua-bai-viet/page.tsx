import { Suspense } from "react";
import { SidebarArticle } from "@/components/dashboard/editor/sidebar-article";
import { SiteHeaderArticle } from "@/components/dashboard/editor/site-header-article";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import {
  getCategories,
  getArticles,
  getArticlesByAuthor,
} from "@/lib/api/article";
import { ArticleEditFormPage } from "@/components/dashboard/editor/article-edit-page";

function getAuthorIdFromToken(token?: string): number | null {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = Buffer.from(parts[1], "base64url").toString("utf-8");
    const claims = JSON.parse(payload) as Record<string, unknown>;
    const claimUserId =
      claims.nameid ??
      claims.sub ??
      claims[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ];

    const parsedUserId = Number(claimUserId);
    if (Number.isFinite(parsedUserId) && parsedUserId > 0) {
      return parsedUserId;
    }
  } catch {
    return null;
  }

  return null;
}

async function ArticlePageContent() {
  const cookieStore = await cookies();
  const token = cookieStore.get("px_token")?.value;
  const authorId = getAuthorIdFromToken(token);

  const articles = authorId ? await getArticlesByAuthor(authorId) : [];

  const [categories] = await Promise.all([getCategories()]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4">
        <div className="px-4 py-4 md:px-6 md:py-6">
          <h1 className="text-3xl font-bold mb-6">Sửa bài viết</h1>

          {/* Form sửa bài viết */}
          <ArticleEditFormPage articles={articles} categories={categories} />
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 py-4 md:px-6 md:py-6">
        <h1 className="text-3xl font-bold mb-6">Sửa bài viết</h1>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <SidebarArticle variant="inset" />
      <SidebarInset>
        <SiteHeaderArticle />
        <Suspense fallback={<LoadingFallback />}>
          <ArticlePageContent />
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
}
