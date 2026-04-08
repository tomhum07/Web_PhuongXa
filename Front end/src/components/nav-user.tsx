"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { EllipsisVerticalIcon, LogOutIcon } from "lucide-react";

import { useRouter } from "next/navigation";
import {
  clearAuthSession,
  CurrentUserDisplay,
  getAuthSnapshot,
  getCurrentUserDisplay,
  hydrateAuthCookiesFromStorage,
} from "@/lib/auth";
import { useEffect, useState } from "react";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "ND";
  }

  const first = parts[0]?.charAt(0) ?? "";
  const last =
    parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  const initials = `${first}${last}`.toUpperCase();

  return initials || "ND";
}

export function NavUser() {
  const [currentUser, setCurrentUser] = useState<CurrentUserDisplay | null>(
    null,
  );
  const { isMobile } = useSidebar();
  const router = useRouter();
  useEffect(() => {
    const syncAuthState = () => {
      hydrateAuthCookiesFromStorage();
      const { token } = getAuthSnapshot();

      if (!token) {
        setCurrentUser(null);
        return;
      }

      setCurrentUser(getCurrentUserDisplay());
    };

    syncAuthState();
  }, []);
  const handleLogout = () => {
    clearAuthSession();
    router.push("/");
    router.refresh();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage
                  src={currentUser?.avatarUrl ?? undefined}
                  alt={currentUser?.fullName ?? "Tài khoản"}
                  width={15}
                  height={15}
                />
                <AvatarFallback className="rounded-lg">
                  {getInitials(currentUser?.fullName ?? "")}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {currentUser?.fullName ?? "Người dùng"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {currentUser?.email ?? "Chưa cập nhật email"}
                </span>
              </div>
              <EllipsisVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) max-w-60 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  <AvatarImage
                    src={currentUser?.avatarUrl ?? undefined}
                    alt={currentUser?.fullName ?? "Tài khoản"}
                    width={15}
                    height={15}
                  />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(currentUser?.fullName ?? "")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className=" font-medium">
                    {currentUser?.fullName ?? "Người dùng"}
                  </span>
                  <span className="text-muted-foreground">
                    {currentUser?.email ?? "Chưa cập nhật email"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              className="flex justify-center"
            >
              <LogOutIcon />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
