import { Suspense } from "react";
import { SidebarArticle } from "@/components/dashboard/editor/sidebar-article";
import { SiteHeaderArticle } from "@/components/dashboard/editor/site-header-article";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { MediaUploadForm } from "@/components/dashboard/editor/media-form";
import { getCategories, getAdminArticles } from "@/lib/api/article";

async function ArticlePageContent() {
  const [categories, articles] = await Promise.all([
    getCategories(),
    getAdminArticles(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4">
        <div className="px-4 py-4 md:px-6 md:py-6">
          <h1 className="text-3xl font-bold mb-6">Quản lý ảnh</h1>

          {/* Bảng bài viết */}
          <div className="mb-8">
            <MediaUploadForm />
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 py-4 md:px-6 md:py-6">
        <h1 className="text-3xl font-bold mb-6">Quản lý ảnh</h1>
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
