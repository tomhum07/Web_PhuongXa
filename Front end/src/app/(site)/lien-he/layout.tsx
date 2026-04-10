import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Liên Hệ | Phường Cao Lãnh",
  description:
    "Thông tin liên hệ Phường Cao Lãnh. Địa chỉ, số điện thoại, email và các kênh liên hệ khác với chính quyền địa phương.",
  keywords: ["liên hệ", "Phường Cao Lãnh", "địa chỉ", "điện thoại", "email"],
  url: "/lien-he",
});

// Static generation with ISR - Revalidate every 7 days
// Contact info changes rarely
export const revalidate = 604800; // 7 days
export const dynamic = "force-static";

export default function LienHeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
