import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Thư Viện Hình Ảnh & Tài Liệu | Phường Cao Lãnh",
  description:
    "Thư viện hình ảnh, tài liệu và tài nguyên về Phường Cao Lãnh. Các hình ảnh du lịch, di tích lịch sử, sự kiện cộng đồng.",
  keywords: [
    "thư viện",
    "hình ảnh",
    "tài liệu",
    "Phường Cao Lãnh",
    "Cao Lãnh",
    "du lịch",
  ],
  url: "/thu-vien",
});

// Dynamic rendering for gallery with image loading
// Gallery content may be fetched from API and updated frequently
export const dynamic = "force-dynamic";
export const revalidate = 1800; // 30 minutes

export default function ThuVienLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
