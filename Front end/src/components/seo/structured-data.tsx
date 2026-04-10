import { ReactNode } from "react";

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Phường Cao Lãnh",
    url: "https://phuongcaolanhdongtap.com",
    logo: "https://phuongcaolanhdongtap.com/Logo_TPCaoLanh.svg",
    description:
      "Trang web thông tin chính thức Phường Cao Lãnh, Thành Phố Cao Lãnh, Tỉnh Đồng Tháp",
    areaServed: {
      "@type": "City",
      name: "Cao Lãnh",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      telephone: "+84-277-xxxxx",
      email: "info@phuongcaolanhdongtap.vn",
      areaServed: "VN",
      availableLanguage: ["vi", "en"],
    },
    sameAs: ["https://www.facebook.com", "https://www.youtube.com"],
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Phường Cao Lãnh",
    image: "https://phuongcaolanhdongtap.com/Logo_TPCaoLanh.svg",
    description: "Cơ quan chính quyền địa phương",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cao Lãnh",
      addressRegion: "Đồng Tháp",
      postalCode: "87000",
      addressCountry: "VN",
    },
    telephone: "+84-277-xxxxx",
    email: "info@phuongcaolanhdongtap.vn",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
    </>
  );
}
