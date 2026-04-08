import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
// import { GoogleAnalytics } from "@next/third-parties/google";
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Phường Cao Lãnh",
  description: "Trang web quảng bá Phường Cao Lãnh",
  icons: {
    icon: "/Logo_TPCaoLanh.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        {children}
        <Toaster />
      </body>
      {/* <GoogleAnalytics gaId="G-877FJRKM7J" /> */}
    </html>
  );
}
