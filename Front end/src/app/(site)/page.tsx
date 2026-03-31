import Hero from "@/components/ui/Hero/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  ArrowRight,
  FileText,
  Landmark,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const featuredNews = [
  {
    title: "Khai mạc tuần lễ văn hóa Phường Cao Lãnh",
    date: "25/03/2026",
    excerpt:
      "Chương trình văn hóa - nghệ thuật với nhiều hoạt động cộng đồng, thu hút đông đảo người dân tham gia.",
  },
  {
    title: "Triển khai cải tạo tuyến đường trung tâm",
    date: "20/03/2026",
    excerpt:
      "Dự án nâng cấp hạ tầng giao thông giúp kết nối thuận tiện giữa các khu dân cư và chợ địa phương.",
  },
  {
    title: "Hội nghị đối thoại giữa chính quyền và người dân",
    date: "15/03/2026",
    excerpt:
      "Nhiều ý kiến thiết thực về môi trường sống, dịch vụ công và an sinh xã hội đã được ghi nhận.",
  },
];

const serviceLinks = [
  {
    title: "Dịch vụ hành chính",
    href: "/dich-vu",
    description:
      "Tra cứu thủ tục, hồ sơ và quy trình giải quyết hồ sơ trực tuyến.",
    icon: FileText,
  },
  {
    title: "Thông tin quy hoạch",
    href: "/gioi-thieu",
    description:
      "Xem định hướng phát triển đô thị và các dự án hạ tầng trọng điểm.",
    icon: Landmark,
  },
  {
    title: "Hỗ trợ doanh nghiệp",
    href: "/lien-he",
    description:
      "Kênh tiếp nhận đề xuất, phản ánh và tư vấn cho hộ kinh doanh, doanh nghiệp.",
    icon: Briefcase,
  },
];

const basicStats = [
  { label: "Dân số", value: "184.297" },
  { label: "Khóm", value: "49" },
  { label: "Dịch vụ công trực tuyến", value: "35" },
  { label: "Sự kiện cộng đồng / năm", value: "40+" },
];

export default function Home() {
  return (
    <div className="pb-12">
      <Hero />

      <main className="container mx-auto mt-8 space-y-10 px-6">
        <section
          aria-labelledby="tong-quan"
          className="grid gap-6 lg:grid-cols-5"
        >
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>
                <h2
                  id="tong-quan"
                  className="text-2xl md:text-3xl font-semibold tracking-tight"
                >
                  Thông tin tổng quan
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Phường Cao Lãnh là trung tâm sinh hoạt cộng đồng năng động,
                  kết hợp hài hòa giữa giá trị truyền thống và định hướng phát
                  triển hiện đại.
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-base">
              <figure className="mb-3 text-center">
                <Image
                  src="/ban-do-phuong-cao-lanh.jpg"
                  alt="Bản đồ phường Cao Lãnh"
                  width={650}
                  height={450}
                  className="mx-auto rounded-md object-cover"
                />
                <figcaption className="mt-2 text-sm text-muted-foreground">
                  Bản đồ hành chính phường Cao Lãnh
                </figcaption>
              </figure>
              <p>
                - Phường Cao Lãnh được thành lập theo Nghị quyết số
                1663/NQ-UBTVQH15 ngày 16/6/2025 của Ủy ban Thường vụ Quốc hội
                trên cơ sở hợp nhất 09 xã, phường thuộc thành phố Cao Lãnh (cũ),
                với diện tích tự nhiên 73,33 km² và dân số trên 137.000 người,
                mật độ dân số 1.873 người/km2.
              </p>
              <p>
                - Phường có vị trí địa lý: <br />
                + Phía đông giáp xã Mỹ Thọ. <br />
                + Phía tây giáp tỉnh An Giang, ranh giới là sông Tiền. <br />
                + Phía nam giáp xã Mỹ An Hưng và Tân Khánh Trung, ranh giới là
                sông Tiền. <br />+ Phía bắc giáp phường Mỹ Ngãi và Mỹ Trà.
              </p>
              <p>
                - Phường Cao Lãnh là đô thị trung tâm có diện tích lớn nhất tỉnh
                Đồng Tháp với hạ tầng giao thông thủy - bộ đồng bộ. Kinh tế chủ
                lực là thương mại, dịch vụ và du lịch với hệ thống tiện ích hiện
                đại; song song đó, nông nghiệp đang chuyển mình theo hướng công
                nghệ cao.
              </p>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Tin tức nổi bật
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Các cập nhật mới nhất về hoạt động và thông báo tại địa
                  phương.
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {featuredNews.map((news) => (
                  <Card key={news.title}>
                    <CardHeader>
                      <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="size-3.5" /> {news.date}
                      </p>
                      <CardTitle className="text-base leading-snug">
                        {news.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                      <p>{news.excerpt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section
          aria-labelledby="dich-vu-va-tin-tuc"
          className="grid gap-6 lg:grid-cols-5"
        >
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>
                <h2
                  id="dich-vu-va-tin-tuc"
                  className="text-2xl md:text-3xl font-semibold tracking-tight"
                >
                  Liên kết dịch vụ
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Truy cập nhanh các nhóm dịch vụ và thông tin thường dùng.
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {serviceLinks.map((service) => {
                  const Icon = service.icon;

                  return (
                    <Card key={service.title} className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="size-4 text-primary" />
                          {service.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                          {service.description}
                        </p>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full justify-between"
                        >
                          <Link href={service.href}>
                            Truy cập
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Thống kê nhanh
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Các chỉ số nổi bật về dân cư và hoạt động địa phương.
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {basicStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg border bg-muted/20 px-3 py-4 text-center"
                  >
                    <p className="text-xl font-semibold text-primary md:text-2xl hover:text-pink-500 hover:translate-y-[-2px]">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="cta-hanh-dong">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2
                  id="cta-hanh-dong"
                  className="text-2xl md:text-3xl font-semibold tracking-tight"
                >
                  Kết nối nhanh
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Gửi phản ánh, theo dõi tin tức mới hoặc tra cứu dịch vụ công
                  trực tuyến.
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              <Button asChild size="lg">
                <Link href="/lien-he">Gửi phản ánh</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/tin-tuc">Xem tin tức</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/dich-vu">Tra cứu dịch vụ</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
