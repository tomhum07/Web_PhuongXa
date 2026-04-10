import QuanLyThuTuc from "@/components/dashboard/admin/services-manager";
import { SidebarAdmin } from "@/components/dashboard/admin/sidebar-admin";
import { SiteHeaderAdmin } from "@/components/dashboard/admin/site-header-admin";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

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
        <SiteHeaderAdmin title="Quản lý dịch vụ" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <QuanLyThuTuc />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
