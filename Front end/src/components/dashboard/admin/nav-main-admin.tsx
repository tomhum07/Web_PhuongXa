"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import Link from "next/link";

export function NavMainAdmin({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2"></SidebarMenuItem>
        </SidebarMenu>
        {/* <Separator /> */}
        <SidebarMenu>
          <SidebarGroupLabel>Tác vụ</SidebarGroupLabel>
          {items.map((item) => (
            <Link key={item.title} href={`/admin${item.url}`}>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={item.title} className="text-base">
                  {item.icon}
                  {item.title}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
