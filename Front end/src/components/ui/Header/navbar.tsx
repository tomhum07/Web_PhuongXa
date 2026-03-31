"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";

const components: {
  id: number;
  title: string;
  href: string;
  description: string;
}[] = [
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
    description: "Thư viện hình ảnh và tài liệu về Phường Cao Lãnh.",
  },
];

type Service = {
  serviceId: number;
  name: string;
  description: string;
  procedureDetails?: string;
  isActive: boolean;
};

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const hasFetchedServices = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  const isRouteActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5265";

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    if (hasFetchedServices.current) {
      return;
    }

    hasFetchedServices.current = true;
    let isMounted = true;

    const cacheKey = "navbar_services_v1";
    const cacheTtlMs = 5 * 60 * 1000;

    try {
      const cachedRaw = sessionStorage.getItem(cacheKey);
      if (cachedRaw) {
        const cached: { timestamp: number; data: Service[] } =
          JSON.parse(cachedRaw);
        const isFresh = Date.now() - cached.timestamp < cacheTtlMs;

        if (isFresh && Array.isArray(cached.data) && cached.data.length > 0) {
          setServices(cached.data);
        }
      }
    } catch {
      // Ignore cache parsing errors and continue with network request.
    }

    const loadServices = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        const response = await fetch(`${apiBaseUrl}/api/Services`, {
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to load services: ${response.status}`);
        }

        const data: Service[] = await response.json();
        const activeServices = data.filter((service) => service.isActive);

        if (isMounted) {
          setServices(activeServices);
        }

        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              timestamp: Date.now(),
              data: activeServices,
            }),
          );
        } catch {
          // Ignore storage quota errors.
        }
      } catch (error) {
        console.error("Cannot fetch services", error);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, [apiBaseUrl]);

  return (
    <div className="relative">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-2 sm:px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Image
            src="/Logo_TPCaoLanh.svg"
            alt="Logo"
            width={45}
            height={45}
            className="h-9 w-9 rounded-full object-cover sm:h-11 sm:w-11"
          />
          <span className="truncate text-base font-bold sm:text-xl">
            Phường Cao Lãnh
          </span>
        </Link>

        <NavigationMenu viewport={false} className="hidden md:block">
          <NavigationMenuList className="gap-2">
            {components.map((component) => (
              <NavigationMenuItem key={component.id}>
                <NavigationMenuLink
                  asChild
                  className={`${navigationMenuTriggerStyle()} text-lg ${
                    isRouteActive(component.href)
                      ? "bg-pink-100 text-pink-600"
                      : ""
                  }`}
                >
                  <Link href={component.href}>{component.title}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}

            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-lg hover:text-pink-600 hover:bg-pink-100 focus:bg-pink-100 focus:text-pink-600">
                Dịch vụ
              </NavigationMenuTrigger>
              <NavigationMenuContent className="z-50 md:left-auto md:right-0">
                <ul className="grid w-1000 gap-2 md:w-96 md:grid-cols-2 lg:w-96">
                  {services.map((service) => (
                    <NavigationMenuLink
                      key={service.serviceId}
                      className="hover:text-pink-600 hover:bg-pink-100"
                      asChild
                    >
                      <Link
                        href={`/dich-vu/${service.serviceId}?name=${encodeURIComponent(service.name)}`}
                      >
                        <div className="flex flex-col gap-1 text-base">
                          <div className="leading-none font-medium">
                            {service.name}
                          </div>
                          <div className="line-clamp-2 text-muted-foreground">
                            {service.description}
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <Link href="/dang-nhap" className="hidden md:block">
          <Button size="lg" className="text-lg" variant="outline">
            Đăng nhập
          </Button>
        </Link>

        <button
          type="button"
          aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
          className="inline-flex items-center justify-center rounded-md border p-2 md:hidden"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMobileMenuOpen ? (
        <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-xl border bg-white p-4 shadow-lg md:hidden">
          <nav className="flex flex-col gap-1">
            {components.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={closeMobileMenu}
                className={`rounded-md px-3 py-2 text-base font-medium hover:bg-muted ${
                  isRouteActive(item.href) ? "bg-pink-100 text-pink-600" : ""
                }`}
              >
                {item.title}
              </Link>
            ))}
            <div className="px-3">
              <Select
                onValueChange={(value) => {
                  const selectedService = services.find(
                    (service) => service.serviceId.toString() === value,
                  );
                  const serviceQuery = selectedService
                    ? `?name=${encodeURIComponent(selectedService.name)}`
                    : "";

                  router.push(`/dich-vu/${value}${serviceQuery}`);
                  closeMobileMenu();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Dịch vụ" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectGroup>
                    {services.map((service) => (
                      <SelectItem
                        key={service.serviceId}
                        value={service.serviceId.toString()}
                      >
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Link href="/dang-nhap" onClick={closeMobileMenu} className="mt-3">
              <Button className="w-full" variant="outline">
                Đăng nhập
              </Button>
            </Link>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
