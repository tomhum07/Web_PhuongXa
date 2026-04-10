"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import { Button } from "@/components/ui/button";

import {
  clearAuthSession,
  getCurrentUserDisplay,
  type CurrentUserDisplay,
  getRedirectPathByRole,
  getAuthSnapshot,
  hasDashboardAccess,
  hydrateAuthCookiesFromStorage,
  isViewerRole,
} from "@/lib/auth";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// (Giữ nguyên mảng components và services của bạn)
const components = [
  {
    id: 1,
    title: "Trang chủ",
    href: "/",
    description: "Trang chủ của website.",
  },
  {
    id: 2,
    title: "Giới thiệu",
    href: "/gioi-thieu",
    description: "Thông tin về Phường Cao Lãnh.",
  },
  {
    id: 3,
    title: "Liên hệ",
    href: "/lien-he",
    description: "Thông tin liên hệ với Phường Cao Lãnh.",
  },
  {
    id: 4,
    title: "Tin tức",
    href: "/tin-tuc",
    description: "Cập nhật tin tức mới nhất về Phường Cao Lãnh.",
  },
  {
    id: 5,
    title: "Thư viện",
    href: "/thu-vien",
    description: "Thư viện hình ảnh và tài liệu.",
  },
];

const services = [
  {
    id: 1,
    title: "Thủ tục hành chính",
    url: "/thu-tuc-hanh-chinh",
    description: "Cung cấp thông tin và hướng dẫn về các thủ tục hành chính.",
  },
  {
    id: 2,
    title: "Nộp hồ sơ",
    url: "/nop-ho-so",
    description: "Hỗ trợ nộp hồ sơ trực tuyến cho các dịch vụ công.",
  },
  {
    id: 3,
    title: "Tra cứu hồ sơ",
    url: "/tra-cuu-ho-so",
    description: "Cho phép người dân tra cứu tình trạng hồ sơ đã nộp.",
  },
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "ND";
  const first = parts[0]?.charAt(0) ?? "";
  const last =
    parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  return `${first}${last}`.toUpperCase() || "ND";
}

export function Navbar() {
  const [authRole, setAuthRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUserDisplay | null>(
    null,
  );
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = authRole !== null;
  const canAccessAdmin =
    isAuthenticated &&
    hasDashboardAccess(authRole ?? "") &&
    !isViewerRole(authRole ?? "");
  const dashboardHref = getRedirectPathByRole(authRole ?? "");

  const isRouteActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = () => {
    clearAuthSession();
    setAuthRole(null);
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    const syncAuthState = () => {
      hydrateAuthCookiesFromStorage();
      const { token, role } = getAuthSnapshot();
      if (!token) {
        setAuthRole(null);
        setCurrentUser(null);
        return;
      }
      setAuthRole(role ?? "");
      setCurrentUser(getCurrentUserDisplay());
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("focus", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("focus", syncAuthState);
    };
  }, [pathname]);

  return (
    // Sticky top để thanh menu ghim lại khi cuộn, viền trên hồng giống footer
    <header className="sticky top-0 z-50 w-full bg-white border-b-2 border-pink-600 shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        {/* LOGO & BRAND */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative h-10 w-10 sm:h-12 sm:w-12">
            <Image
              src="/Logo_TPCaoLanh.svg"
              alt="Logo Phường Cao Lãnh"
              width={48}
              height={48}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="uppercase font-bold text-pink-600 tracking-wide text-sm">
              Phường Cao Lãnh
            </span>
            <span className="hidden sm:block text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
              Cổng thông tin điện tử
            </span>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <NavigationMenu
          viewport={false}
          className="hidden lg:block flex-1 justify-center"
        >
          <NavigationMenuList className="gap-2">
            {components.map((component) => (
              <NavigationMenuItem key={component.id}>
                <NavigationMenuLink
                  asChild
                  className={`relative px-4 py-2.5 text-[14px] rounded-md transition-all duration-200 ${
                    isRouteActive(component.href)
                      ? "bg-pink-50 text-pink-700 font-bold"
                      : "text-slate-600 font-medium hover:bg-slate-50 hover:text-pink-600"
                  }`}
                >
                  <Link href={component.href}>{component.title}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}

            <NavigationMenuItem>
              <NavigationMenuTrigger className="px-4 py-2.5 text-[14px] text-slate-600 font-medium rounded-md transition-all hover:bg-slate-50 hover:text-pink-600 data-[state=open]:bg-pink-50 data-[state=open]:text-pink-700">
                <Link href="/dich-vu">Dịch vụ</Link>
              </NavigationMenuTrigger>
              <NavigationMenuContent className="z-50">
                {/* Menu Dropdown thiết kế dạng thẻ (Card) trắng sạch sẽ */}
                <ul className="grid w-[400px] gap-2 p-3 bg-white border border-slate-100 rounded-lg shadow-xl">
                  {services.map((service) => (
                    <NavigationMenuLink asChild key={service.id}>
                      <Link
                        href={`/dich-vu/${service.url}`}
                        className="block px-4 py-3 rounded-md transition-colors hover:bg-slate-50 group"
                      >
                        <div className="text-[14px] font-bold text-slate-800 group-hover:text-pink-700 transition-colors">
                          {service.title}
                        </div>
                        <div className="text-[13px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                          {service.description}
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* USER / AUTH */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="rounded-full hover:bg-slate-50 transition-all gap-2 px-2 py-1.5 h-auto border border-transparent hover:border-slate-200"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-pink-100">
                    <AvatarImage
                      src={currentUser?.avatarUrl ?? undefined}
                      alt="Avatar"
                    />
                    <AvatarFallback className="bg-pink-100 text-pink-700 text-xs font-bold">
                      {getInitials(currentUser?.fullName ?? "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:grid flex-1 text-left leading-tight">
                    <span className="text-[13px] font-bold text-slate-700">
                      {currentUser?.fullName ?? "Người dùng"}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 truncate max-w-[120px]">
                      {currentUser?.email ?? ""}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-lg shadow-lg border-slate-200"
              >
                <DropdownMenuGroup>
                  <div className="px-2 py-1.5 text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                    Tài khoản
                  </div>
                  {canAccessAdmin && (
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer font-medium text-slate-700 focus:text-pink-700 focus:bg-pink-50"
                    >
                      <Link href={dashboardHref} className="w-full">
                        Quản trị Hệ Thống
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 font-medium"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/dang-nhap">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-md px-5 shadow-sm transition-all text-sm h-10">
                Đăng nhập
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
