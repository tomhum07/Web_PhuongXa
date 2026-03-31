import GioiThieuBreadcrumb from "@/components/ui/gioi-thieu-breadcrumb";

const naturalConditions = [
  {
    id: 1,
    title: "Địa hình",
    content: `Đặc điểm chung: Địa hình khá bằng phẳng, thấp dần từ hướng Bắc xuống Nam và từ Đông sang Tây.
Cao độ: Cao trình phổ biến từ 1,0m đến 2,0m so với mực nước biển. Do địa hình thấp nên khu vực này dễ bị ảnh hưởng bởi chế độ thủy văn của sông Tiền và lũ lụt hàng năm.`,
  },
  {
    id: 2,
    title: "Khí hậu",
    content: `Mùa mưa: Thường kéo dài từ tháng 5 đến tháng 11, tập trung lượng mưa lớn (chiếm khoảng 90% lượng mưa cả năm).
Mùa khô: Từ tháng 12 đến tháng 4 năm sau, ít mưa, độ ẩm thấp.
Nhiệt độ: Trung bình hàng năm khoảng 27°C, biên độ nhiệt trong ngày thấp, nắng nhiều và ổn định, rất thuận lợi cho canh tác nông nghiệp.`,
  },
  {
    id: 3,
    title: "Thủy văn và Tài nguyên nước",
    content: `Hệ thống sông ngòi: Thành phố có mạng lưới kênh rạch chằng chịt, trong đó quan trọng nhất là sông Tiền và các con sông/kênh lớn như sông Cao Lãnh, kênh Cái Tôm.
Chế độ thủy văn: Chịu ảnh hưởng trực tiếp của chế độ triều biển Đông và lũ nguồn từ sông Mê Kông đổ về. Mùa lũ thường diễn ra từ tháng 8 đến tháng 11, mang theo phù sa bồi đắp cho đất đai nhưng cũng gây ra một số khó khăn cho hạ tầng đô thị.
Nguồn nước: Nguồn nước ngọt dồi dào quanh năm, phục vụ tốt cho sinh hoạt, sản xuất công nghiệp và tưới tiêu nông nghiệp.`,
  },
  {
    id: 4,
    title: "Thổ nhưỡng và Tài nguyên thiên nhiên",
    content: `Nhóm đất: Chủ yếu là đất phù sa được bồi đắp bởi sông Tiền, rất màu mỡ và phù hợp cho các loại cây ăn trái đặc sản (như xoài Cao Lãnh) và lúa nước.
Cảnh quan: Có hệ sinh thái sông nước đặc trưng, nhiều vườn cây ăn trái xanh mát, tạo điều kiện phát triển du lịch sinh thái.`,
  },
];

export default function GioiThieu() {
  return (
    <>
      <div className="text-center my-6">
        <h1 className="text-3xl font-bold">Giới thiệu</h1>
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
        id="geography"
        className="mx-auto my-5 w-full max-w-5xl space-y-8 px-4"
      >
        <div className="grid gap-6">
          <article className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-2xl font-semibold">Vị trí địa lý</h2>
            <p className="mt-3">
              Cao Lãnh là một phường nằm ở phía Tây tỉnh Đồng Tháp, cách phường
              Mỹ Tho 100km về phía Tây, cách phường Sa Đéc 30km về phía Tây bắc,
              phường có vị trí địa lý:
            </p>
            <ul className="list-disc pl-5">
              <li>Phía đông giáp xã Mỹ Thọ</li>
              <li>Phía tây giáp xã Cù Lao Giêng, tỉnh An Giang</li>
              <li>Phía nam giáp xã Mỹ An Hưng và Tân Khánh Trung</li>
              <li>Phía bắc giáp phường Mỹ Ngãi và phường Mỹ Trà</li>
            </ul>
            <p>
              Phường Cao Lãnh có diện tích 73,33 km², dân số năm 2025 là 137.387
              người, mật độ dân số đạt 1.873 người/km².
            </p>
            <h3 className="text-xl font-semibold mt-1.5">
              Vị trí Phường Cao Lãnh
            </h3>
            <div className="relative mt-2 h-72 w-full overflow-hidden rounded-lg sm:h-80">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d75122.46348379116!2d105.58999479176944!3d10.445531319141818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x310a65057df94f39%3A0x1d6b899429240cd4!2zQ2FvIEzDo25oLCDEkOG7k25nIFRow6FwLCBWaeG7h3QgTmFt!5e1!3m2!1svi!2s!4v1774287641651!5m2!1svi!2s"
                className="w-full h-full"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </article>
        </div>
      </section>
      <section
        id="natural-conditions"
        className="mx-auto my-5 w-full max-w-5xl space-y-8 px-4"
      >
        <div className="grid gap-6">
          <article className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-2xl font-semibold mb-3">Điều kiện tự nhiên</h2>
            {naturalConditions.map((condition) => (
              <div key={condition.id} className="mb-6 last:mb-0">
                <h2 className="text-xl font-semibold">{condition.title}</h2>
                <ul className="mt-3 space-y-2 leading-6 list-none">
                  {condition.content
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0)
                    .map((line, index) => (
                      <li key={`${condition.id}-${index}`}>{line}</li>
                    ))}
                </ul>
              </div>
            ))}
          </article>
        </div>
      </section>
    </>
  );
}
