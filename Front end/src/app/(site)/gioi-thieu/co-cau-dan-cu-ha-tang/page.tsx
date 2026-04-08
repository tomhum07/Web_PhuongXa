import GioiThieuBreadcrumb from "@/components/ui/gioi-thieu-breadcrumb";

const naturalConditions = [
  {
    id: 1,
    title: "Cơ cấu dân cư",
    description:
      "Dân cư thành phố Cao Lãnh mang đặc trưng của dân cư vùng đô thị sông nước miền Tây với sự năng động và hiếu khách.",
    sections: [
      {
        heading: "Thông tin dân cư",
        lines: [
          "Quy mô dân số: Tính đến các báo cáo gần đây, dân số thành phố khoảng 165.000 - 210.000 người (bao gồm cả dân số quy đổi). Mật độ dân số tập trung cao nhất ở các phường nội ô như Phường 1, Phường 2 và Phường Mỹ Phú.",
          'Cơ cấu theo độ tuổi: Đang trong giai đoạn "dân số vàng" với lực lượng lao động dồi dào, chủ yếu làm việc trong các lĩnh vực dịch vụ, thương mại và công nghiệp nhẹ.',
          "Dân tộc: Đại đa số là người Kinh. Bên cạnh đó còn có một bộ phận nhỏ người Hoa và người Khmer sinh sống, tạo nên sự giao thoa văn hóa đặc sắc trong ẩm thực và tín ngưỡng.",
          "Trình độ dân trí: Là trung tâm giáo dục của tỉnh với hệ thống các trường Đại học, Cao đẳng nên tỷ lệ lao động qua đào tạo tại đây cao hơn mặt bằng chung của tỉnh Đồng Tháp.",
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Cơ sở hạ tầng",
    description:
      "Cơ sở hạ tầng của Cao Lãnh đã có bước phát triển đột phá trong những năm gần đây, đặc biệt là sau khi Cầu Cao Lãnh đi vào hoạt động.",
    sections: [
      {
        heading: "Giao thông",
        lines: [
          "Đường bộ: Cầu Cao Lãnh là công trình trọng điểm nối liền thành phố với huyện Lấp Vò, giúp kết nối xuyên suốt tuyến N2 và cao tốc Cao Lãnh - Lộ Tẻ.",
          "Quốc lộ 30: Trục đường huyết mạch kết nối thành phố với Quốc lộ 1A và đi các huyện phía Bắc của tỉnh.",
          "Hệ thống đường nội đô: Các tuyến đường như Nguyễn Huệ, Hùng Vương, Lý Thường Kiệt được quy hoạch rộng rãi, khang trang.",
          "Đường thủy: Nằm bên sông Tiền với hệ thống cảng (Cảng Cao Lãnh) và các bến phà, tàu khách thuận lợi cho vận tải hàng hóa nặng và du lịch liên vùng.",
        ],
      },
      {
        heading: "Y tế và giáo dục",
        lines: [
          "Y tế: Tập trung các bệnh viện lớn nhất tỉnh như Bệnh viện Đa khoa Đồng Tháp (cơ sở mới hiện đại), Bệnh viện Quân y và các phòng khám đa khoa quốc tế.",
          'Giáo dục: Là "đất học" với Trường Đại học Đồng Tháp, các trường Cao đẳng Cộng đồng, Cao đẳng Y tế và hệ thống trường THPT chuyên Nguyễn Quang Diêu nổi tiếng.',
        ],
      },
      {
        heading: "Thương mại và dịch vụ",
        lines: [
          "Khu mua sắm: Có hệ thống siêu thị lớn như Co.opmart, Vincom Plaza Cao Lãnh và các chợ truyền thống sầm uất (Chợ Cao Lãnh).",
          "Khu công nghiệp: Cụm công nghiệp Trần Quốc Toản thu hút nhiều doanh nghiệp chế biến nông sản và may mặc, tạo việc làm lớn cho khu vực.",
        ],
      },
      {
        heading: "Điện, nước và viễn thông",
        lines: [
          "Cấp nước: Hệ thống nước máy bao phủ gần 100% khu vực nội ô và các xã ven.",
          "Viễn thông: Hạ tầng số phát triển mạnh; Cao Lãnh đang hướng tới mô hình Đô thị thông minh (Smart City) để quản lý giao thông và hành chính công hiệu quả hơn.",
        ],
      },
    ],
  },
];

export default function GioiThieu() {
  return (
    <>
      <div className="text-center my-6">
        <h1 className="text-3xl font-bold">Cơ cấu dân cư & cơ sở hạ tầng</h1>
      </div>
      <div className="mx-auto max-w-5xl px-4">
        <GioiThieuBreadcrumb
          items={[
            { label: "Giới thiệu", href: "/gioi-thieu" },
            { label: "Vị trí địa lý & điều kiện tự nhiên" },
          ]}
        />
      </div>
      <section
        id="natural-conditions"
        className="mx-auto my-5 w-full max-w-5xl space-y-8 px-4"
      >
        <div className="grid gap-6">
          {naturalConditions.map((condition) => (
            <article
              key={condition.id}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <h2 className="text-2xl font-semibold">{condition.title}</h2>
              <p className="mt-2 text-muted-foreground">
                {condition.description}
              </p>

              {condition.sections.map((section) => (
                <div
                  key={`${condition.id}-${section.heading}`}
                  className="mt-4"
                >
                  <h3 className="text-xl font-semibold">{section.heading}</h3>
                  <ul className="mt-2 space-y-2 leading-6 list-none">
                    {section.lines.map((line, index) => (
                      <li key={`${condition.id}-${section.heading}-${index}`}>
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
