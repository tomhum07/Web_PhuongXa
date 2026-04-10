"use client";

import * as React from "react";

// import { NavDocuments } from "@/components/nav-documents";
import { NavMainAdmin } from "@/components/dashboard/admin/nav-main-admin";
import { NavSecondary } from "@/components/nav-secondary";
import { NavDocuments } from "@/components/nav-documents";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  Newspaper,
  Users,
  FolderTree,
  DatabaseIcon,
  FileChartColumnIcon,
  FileInput,
  ArrowLeft,
  Briefcase,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

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
      title: "Quản lý bài viết",
      url: "/quan-ly-bai-viet",
      icon: <Newspaper />,
    },
    {
      title: "Quản lý tài khoản",
      url: "/quan-ly-tai-khoan",
      icon: <Users />,
    },
    {
      title: "Quản lý danh mục",
      url: "/quan-ly-danh-muc",
      icon: <FolderTree />,
    },
    {
      title: "Quản lý phản ánh",
      url: "/quan-ly-phan-hoi",
      icon: <Briefcase />,
    },
    {
      title: "Quản lý hồ sơ",
      url: "/quan-ly-ho-so",
      icon: <FileInput />,
    },
    {
      title: "Quản lý lĩnh vực, thủ tục",
      url: "/quan-ly-linhvuc-thutuc",
      icon: <Briefcase />,
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
  // documents: [
  //   {
  //     name: "Quản lý thủ tục hành chính",
  //     url: "#",
  //     icon: <DatabaseIcon />,
  //   },
  //   {
  //     name: "Quản lý hồ sơ",
  //     url: "#",
  //     icon: <FileChartColumnIcon />,
  //   },
  //   {
  //     name: "Cập nhật trạng thái",
  //     url: "#",
  //     icon: <FileIcon />,
  //   },
  // ],
};
export function SidebarAdmin({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <a className="flex items-center gap-2 w-full px-2 py-1 ">
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
        <NavMainAdmin items={data.navMain} />
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
