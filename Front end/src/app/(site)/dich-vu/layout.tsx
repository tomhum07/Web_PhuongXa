import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Dịch Vụ Công | Phường Cao Lãnh",
  description:
    "Danh sách các dịch vụ công tại Phường Cao Lãnh bao gồm thủ tục hành chính, nộp hồ sơ trực tuyến và tra cứu hồ sơ.",
  keywords: [
    "dịch vụ công",
    "thủ tục",
    "Phường Cao Lãnh",
    "nộp hồ sơ",
    "tra cứu",
  ],
  url: "/dịch-vụ",
});

// Static generation with ISR - Revalidate every 1 hour
// Services are relatively stable but may have policy updates
export const revalidate = 3600; // 1 hour
export const dynamic = "force-static";

export default function DichVuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
