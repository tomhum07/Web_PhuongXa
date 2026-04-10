import type { Metadata } from "next";

export interface PageMetadataOptions {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  url?: string;
}

export function generatePageMetadata(options: PageMetadataOptions): Metadata {
  const baseUrl = "https://phuongcaolanhdongtap.com";
  const url = options.url ? `${baseUrl}${options.url}` : baseUrl;
  const ogImage =
    options.ogImage || "https://phuongcaolanhdongtap.com/Logo_TPCaoLanh.svg";

  return {
    title: options.title,
    description: options.description,
    keywords: options.keywords || [],
    openGraph: {
      type: "website",
      locale: "vi_VN",
      url: url,
      siteName: "Phường Cao Lãnh",
      title: options.title,
      description: options.description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: options.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}
