import { SidebarAdmin } from "@/components/dashboard/admin/sidebar-admin";
import { SiteHeaderAdmin } from "@/components/dashboard/admin/site-header-admin";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ArticleModerationTable } from "@/components/dashboard/admin/article-moderation-table";

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
      <SidebarAdmin variant="inset" />
      <SidebarInset>
        <SiteHeaderAdmin title="Quản lý bài viết" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 md:px-6">
                <h1 className="mb-4 text-2xl font-bold">Quản lý bài viết</h1>
                <ArticleModerationTable />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
