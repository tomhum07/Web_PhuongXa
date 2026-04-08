import Image from "next/image";
import GioiThieuBreadcrumb from "@/components/ui/gioi-thieu-breadcrumb";

const historyContent = [
  {
    id: 1,
    title: "1. Nguồn gốc địa danh (Thế kỷ 18-19)",
    image: "/mieu-ong-ba-dct.jpg",
    imageAlt: "Miếu thờ Ông bà Đỗ Công Tường",
    content: `Vào thế kỷ XVIII, vùng đất Cao Lãnh còn hoang sơ. Tên gọi Cao Lãnh gắn liền với ông bà Đỗ Công Tường.
Ông bà từ miền Trung vào khai khẩn, lập vườn quýt và dựng chợ cho dân mua bán. Do ông giữ chức Câu đương, bà tên Lãnh, dân làng kính trọng gọi tên chợ là chợ Câu Lãnh, sau đọc trại thành Cao Lãnh.
Chợ Câu Lãnh: Ông được dân làng kính trọng, bầu làm chức "Câu đương" (phân xử việc nhỏ), lập chợ để dân trao đổi hàng hóa. Người dân gọi chợ là "Câu Lãnh", sau đọc trại thành "Cao Lãnh". Hiện nay, Miếu thờ Ông bà Đỗ Công Tường được đặt tại chợ Cao Lãnh và đây là biểu tượng văn hoá tâm linh lớn tại thành phố Cao Lãnh.`,
  },
  {
    id: 2,
    title: "2. Giai đoạn Pháp thuộc và Chiến tranh (1913-1975)",
    image: "/tinh-kien-phong.jpg",
    imageAlt: "hình ảnh Tỉnh Kiến Phong",
    content: `Năm 1913: Pháp thành lập quận Cao Lãnh thuộc tỉnh Sa Đéc.
Giai đoạn 1956-1975: Chính quyền Việt Nam Cộng hòa thành lập tỉnh Kiến Phong, lấy vùng đất Cao Lãnh làm tỉnh lỵ, đánh dấu bước phát triển quan trọng về hành chính. 
`,
  },
  {
    id: 3,
    title: "3. Sau năm 1975 - 2020",
    image: "/cong-chao-cao-lanh.jpg",
    imageAlt: "Hình ảnh thành phố Cao Lãnh hiện nay",
    content: `1976: Hợp nhất tỉnh Kiến Phong và Sa Đéc thành tỉnh Đồng Tháp. Thị xã Cao Lãnh ban đầu là thị trấn thuộc huyện Cao Lãnh.
Năm 1983-1994: Tái lập thị xã Cao Lãnh. Năm 1994, tỉnh lỵ Đồng Tháp chính thức dời từ Sa Đéc về thị xã Cao Lãnh. Lúc này, địa bàn thị xã cũ được chia thành các đơn vị nhỏ hơn. Trong đó, trung tâm của thị xã cũ được chuyển đổi thành thị trấn Cao Lãnh (đóng vai trò là huyện lỵ của huyện Cao Lãnh).
Năm 2007: Chính phủ ban hành Nghị định 10/2007/NĐ-CP thành lập thành phố Cao Lãnh trực thuộc tỉnh Đồng Tháp. 
Năm 2020: Thành phố Cao Lãnh chính thức được công nhận là đô thị loại II.
`,
  },
  {
    id: 4,
    title: "4. Bước ngoặt hội nhập quốc tế (Năm 2022)",
    image: "/thanh-pho-hoc-tap.jpg",
    imageAlt: "Hình ảnh bước ngoặt hội nhập quốc tế",
    content: `Ghi danh vào mạng lưới toàn cầu của UNESCO:
Sự kiện: Ngày 02/9/2022, Tổ chức Giáo dục, Khoa học và Văn hóa Liên Hợp Quốc (UNESCO) chính thức ghi danh thành phố Cao Lãnh vào Mạng lưới các Thành phố học tập toàn cầu (GNLC). Cao Lãnh trở thành một trong số ít các thành phố tại Việt Nam (cùng với Sa Đéc và các thành phố khác như Vinh, Hải Dương...) được quốc tế công nhận về nỗ lực thúc đẩy học tập suốt đời cho mọi người dân.`,
  },
  {
    id: 5,
    title:
      "5. Giai đoạn tái hợp nhất và Tái cấu trúc không gian đô thị (2025 – 2026)",
    image: "/sat-nhap-cao-lanh.jpg",
    imageAlt: "Hình ảnh lễ công bố thực hiện Nghị quyết số 1663/NQ-UBTVQH15 ",
    content: `Theo Nghị quyết số 202/2025/QH15 của Quốc hội về việc sắp xếp đơn vị hành chính cấp tỉnh, tỉnh Đồng Tháp và tỉnh An Giang chính thức được sáp nhập.
Thực hiện Nghị quyết số 1663/NQ-UBTVQH15 ngày 16/6/2025 của ỦY BAN THƯỜNG VỤ QUỐC HỘI cấu trúc hành chính nội tại cũng được tinh gọn. Thành phố Cao Lãnh chính thức kết thúc vai trò là đơn vị hành chính cấp Thành phố thuộc tỉnh để chuyển đổi thành Phường Cao Lãnh trên cơ sở hợp nhất 09 xã, phường thuộc thành phố Cao Lãnh (cũ), với diện tích tự nhiên 73,33 km² và dân số trên 137.000 người, mật độ dân số 1.873 người/km2.
`,
  },
];

export default function GioiThieu() {
  return (
    <>
      <div className="text-center my-6">
        <h1 className="text-3xl font-bold">Lịch sử hình thành</h1>
      </div>
      <div className="mx-auto max-w-5xl px-4">
        <GioiThieuBreadcrumb
          items={[
            { label: "Giới thiệu", href: "/gioi-thieu" },
            { label: "Lịch sử" },
          ]}
        />
      </div>
      <section
        id="history"
        className="mx-auto my-5 w-full max-w-5xl space-y-8 px-4"
      >
        <div className="grid gap-6">
          <article className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-2xl font-semibold">Lịch sử</h2>
            <p className="text-muted-foreground mt-3 leading-6">
              Thành phố Cao Lãnh, tỉnh lỵ tỉnh Đồng Tháp, hình thành từ thế kỷ
              18-19, gắn liền với công lao khẩn hoang của vợ chồng ông Đỗ Công
              Tường (Câu Lãnh). Từng là tỉnh lỵ Kiến Phong (1956-1975), nơi đây
              trở thành thủ phủ Đồng Tháp từ năm 1994, công nhận thành phố năm
              2007, nổi tiếng là trung tâm văn hóa - lịch sử miền Tây.{" "}
            </p>
            {historyContent.map((item) => (
              <div key={item.id} className="mt-4">
                <h3 className="mt-3 text-lg font-medium">{item.title}</h3>
                <div className="mt-3 overflow-hidden ">
                  <figure>
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={1200}
                      height={675}
                      className="mx-auto h-auto w-full max-w-2xl rounded-lg object-cover"
                    />
                    <figcaption className="pt-4 text-center text-sm text-muted-foreground">
                      {item.imageAlt}
                    </figcaption>
                  </figure>
                </div>
                <ul className="mt-3 space-y-2 pl-5 leading-6 text-muted-foreground list-none">
                  {item.content
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0)
                    .map((line, index) => (
                      <li key={`${item.id}-${index}`}>{line}</li>
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
