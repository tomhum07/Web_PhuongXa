import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { GoogleAnalytics } from "@next/third-parties/google";
import { StructuredData } from "@/components/seo/structured-data";

const gaId = process.env.NEXT_PUBLIC_GA_ID;
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Phường Cao Lãnh | Trang Thông Tin Chính Thức",
  description:
    "Trang web thông tin chính thức Phường Cao Lãnh, Thành Phố Cao Lãnh, Tỉnh Đồng Tháp. Cung cấp thông tin dành cho cộng đồng, dịch vụ công, thủ tục hành chính và tin tức.",
  keywords: [
    "Phường Cao Lãnh",
    "Cao Lãnh",
    "Đồng Tháp",
    "Chính quyền địa phương",
  ],
  authors: [{ name: "Phường Cao Lãnh" }],
  creator: "Phường Cao Lãnh",
  icons: {
    icon: "/Logo_TPCaoLanh.svg",
    apple: "/Logo_TPCaoLanh.svg",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://phuongcaolanhdongtap.com",
    siteName: "Phường Cao Lãnh",
    title: "Phường Cao Lãnh | Trang Thông Tin Chính Thức",
    description:
      "Trang web thông tin chính thức Phường Cao Lãnh, Thành Phố Cao Lãnh, Tỉnh Đồng Tháp.",
    images: [
      {
        url: "https://phuongcaolanhdongtap.com/Logo_TPCaoLanh.svg",
        width: 200,
        height: 200,
        alt: "Logo Phường Cao Lãnh",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Phường Cao Lãnh",
    description: "Trang web thông tin chính thức Phường Cao Lãnh",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "https://phuongcaolanhdongtap.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ec4899" />
        <link rel="manifest" href="/manifest.json" />
        <StructuredData />
      </head>
      <body className={roboto.className}>
        {children}
        <Toaster />
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
