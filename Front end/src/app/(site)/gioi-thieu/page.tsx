import Image from "next/image";
import Link from "next/link";
export const dynamic = "force-static"; // SSG
const introSections = [
  {
    title: "Lịch sử hình thành",
    description:
      "Theo dõi các cột mốc phát triển quan trọng của vùng đất Cao Lãnh từ quá khứ đến hiện tại.",
    href: "/gioi-thieu/lich-su",
    action: "Xem lịch sử",
  },
  {
    title: "Vị trí địa lý, điều kiện tự nhiên",
    description:
      "Khám phá vị trí, ranh giới hành chính và các đặc điểm tự nhiên nổi bật của phường Cao Lãnh.",
    href: "/gioi-thieu/vi-tri-dia-ly-dieu-kien-tn",
    action: "Xem vị trí địa lý, điều kiện tự nhiên",
  },
  {
    title: "Cơ cấu dân cư, cơ sở hạ tầng",
    description:
      "Khám phá vị trí, ranh giới hành chính và các đặc điểm tự nhiên nổi bật của phường Cao Lãnh.",
    href: "/gioi-thieu/co-cau-dan-cu-ha-tang",
    action: "Xem cơ cấu dân cư, cơ sở hạ tầng",
  },
];

export default function GioiThieuPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <div className="relative h-[260px] overflow-hidden rounded-2xl border-2 border-pink-200 shadow-sm sm:h-[320px] md:h-[380px]">
        {/* <div className="absolute inset-0 bg-[url('/khu-di-tich-nguyen-sinh-sac-cover.png')] bg-cover bg-center"></div> */}
        <Image
          src="/khu-di-tich-nguyen-sinh-sac-cover.webp"
          alt="Khu di tích Nguyên Sinh Sắc"
          fill
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10"></div>

        {/* <h1 className="absolute top-40 left-5 text-2xl font-bold text-pink-100 md:text-4xl">
          Giới thiệu Phường Cao Lãnh
        </h1> */}
      </div>
      <section className="mt-8">
        <div className="mt-4 grid gap-4 lg:grid-cols-3 md:grid-cols-2">
          {introSections.map((section) => (
            <article
              key={section.href}
              className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {section.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {section.description}
              </p>
              <Link
                href={section.href}
                className="w-full mt-4 flex justify-center items-center rounded-md bg-pink-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-700"
              >
                {section.action}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
