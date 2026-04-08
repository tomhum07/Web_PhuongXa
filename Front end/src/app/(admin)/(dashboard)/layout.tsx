import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";

const DASHBOARD_ROLE_KEYS = new Set(["admin", "editor", "viewer"]);

function normalizeRole(role: string): string {
  return role
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "");
}

function hasDashboardAccess(role: string): boolean {
  return DASHBOARD_ROLE_KEYS.has(normalizeRole(role));
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("px_token")?.value;
  const role = decodeURIComponent(cookieStore.get("px_role")?.value ?? "");

  if (!token) {
    redirect("/dang-nhap?callbackUrl=%2Fdashboard");
  }

  if (!hasDashboardAccess(role)) {
    redirect("/");
  }

  return <TooltipProvider>{children}</TooltipProvider>;
}
