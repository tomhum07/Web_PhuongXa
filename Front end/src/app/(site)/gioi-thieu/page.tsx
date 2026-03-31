import Link from "next/link";

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
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
      <div className="rounded-2xl border bg-linear-to-r from-sky-50 via-white to-cyan-50 p-6 md:p-8">
        <h1 className="text-3xl font-bold text-slate-900 md:text-4xl">
          Giới thiệu Phường Cao Lãnh
        </h1>
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
                className="mt-4 inline-flex items-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700"
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
