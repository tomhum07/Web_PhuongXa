import { SidebarAdmin } from "@/components/dashboard/admin/sidebar-admin";
import { SiteHeaderAdmin } from "@/components/dashboard/admin/site-header-admin";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// import data from "../../data.json";

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
        <SiteHeaderAdmin />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} /> */}
              <div className="px-4 lg:px-6">
                <h1 className="text-5xl font-bold">
                  TRANG NÀY CHƯA BIẾT LÀM SAO!!!
                </h1>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
