"use client";

import { useEffect, useState } from "react";
import { SidebarAdmin } from "@/components/dashboard/admin/sidebar-admin";
import { SiteHeaderAdmin } from "@/components/dashboard/admin/site-header-admin";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CategoryTable } from "@/components/dashboard/admin/category-table";
import { getCategories, ApiCategory } from "@/lib/api/category";

export default function Page() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const rawData = await getCategories();
        
        const mappedData = Array.isArray(rawData) ? rawData.map(item => ({
          id: item.categoryId ?? (item as any).id,
          name: item.name,
          slug: item.slug,
          parentId: item.parentId,
          parentName: item.parentName,
          status: item.status === 1 || item.status === "Hiển thị" ? "Hiển thị" : "Ẩn",
          isActive: item.status === 1 || item.status === "Hiển thị",
        })) : [];

        setCategories(mappedData);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    }
    fetchCategories();
  }, []);

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
        <SiteHeaderAdmin title="Quản lý danh mục" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <CategoryTable data={categories} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
