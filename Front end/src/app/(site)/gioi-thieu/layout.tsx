import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Giới Thiệu | Phường Cao Lãnh",
  description:
    "Giới thiệu về Phường Cao Lãnh bao gồm lịch sử, vị trí địa lý, điều kiện tự nhiên, dân cư và hạ tầng của phường.",
  keywords: [
    "giới thiệu",
    "lịch sử",
    "Phường Cao Lãnh",
    "Cao Lãnh",
    "thông tin địa phương",
  ],
  url: "/gioi-thieu",
});

// Static generation with ISR - Revalidate every 24 hours
// About pages change infrequently, so long revalidation time
export const revalidate = 86400; // 24 hours
export const dynamic = "force-static";

export default function GioiThieuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
