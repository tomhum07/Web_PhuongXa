"use client";

import * as React from "react";

import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  CirclePlusIcon,
  FilePen,
  Trash2Icon,
  ImagePlus,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { NavMainEditor } from "@/components/dashboard/editor/nav-main-editor";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatar.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Tạo bài viết",
      url: "/tao-bai-viet",
      icon: <CirclePlusIcon />,
    },
    {
      title: "Sửa bài viết",
      url: "/sua-bai-viet",
      icon: <FilePen />,
    },
    {
      title: "Xoá bài viết",
      url: "/xoa-bai-viet",
      icon: <Trash2Icon />,
    },
    {
      title: "Up ảnh thư viện",
      url: "/up-anh-thu-vien",
      icon: <ImagePlus />,
    },
  ],
  navSecondary: [
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: <Settings2Icon />,
    // },
    // {
    //   title: "Get Help",
    //   url: "#",
    //   icon: <CircleHelpIcon />,
    // },
    {
      title: "Trở về trang chủ",
      url: "/",
      icon: <ArrowLeft />,
    },
  ],
  //   documents: [
  //     {
  //       name: "Data Library",
  //       url: "#",
  //       icon: <DatabaseIcon />,
  //     },
  //     {
  //       name: "Reports",
  //       url: "#",
  //       icon: <FileChartColumnIcon />,
  //     },
  //     {
  //       name: "Word Assistant",
  //       url: "#",
  //       icon: <FileIcon />,
  //     },
  //   ],
};

export function SidebarArticle({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <a className="flex items-center gap-2 py-2 w-full">
            <Image
              src="/Logo_TPCaoLanh.svg"
              alt="logo"
              width={52}
              height={52}
              className="size-13"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-semibold tracking-tight">
                Phường Cao Lãnh
              </span>
              <span className="text-base text-muted-foreground">
                Quản lý hệ thống
              </span>
            </div>
          </a>
        </SidebarMenu>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <NavMainEditor items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <Separator />
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
