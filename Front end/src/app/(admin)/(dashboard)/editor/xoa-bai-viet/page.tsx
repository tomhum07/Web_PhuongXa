import { Suspense } from "react";

import { ArticleDeleteTable } from "@/components/dashboard/editor/article-delete-table";
import { SidebarArticle } from "@/components/dashboard/editor/sidebar-article";
import { SiteHeaderArticle } from "@/components/dashboard/editor/site-header-article";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAdminArticles } from "@/lib/api/article";
import { Article } from "@/types";

async function DeleteArticlePageContent() {
  const articles = (await getAdminArticles()) as Article[];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4">
        <div className="px-4 py-4 md:px-6 md:py-6">
          <h1 className="mb-2 text-3xl font-bold">Xoá bài viết</h1>
          <ArticleDeleteTable initialArticles={articles} />
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 py-4 md:px-6 md:py-6">
        <h1 className="mb-6 text-3xl font-bold">Xoá bài viết</h1>
        <div className="space-y-4">
          <div className="h-10 animate-pulse rounded bg-gray-200" />
          <div className="h-64 animate-pulse rounded bg-gray-200" />
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
          <DeleteArticlePageContent />
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
}
