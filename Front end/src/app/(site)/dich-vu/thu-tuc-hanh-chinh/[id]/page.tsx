import Link from "next/link";
import { FileText, Download } from "lucide-react";
import { getPublicFields, getPublicProcedures } from "@/lib/api/public-applications";

function getDocumentViewerUrl(url: string) {
  if (!url || url === "#") return "#";
  const lower = url.toLowerCase();
  // Nếu là file Word/Excel thì dùng trình đọc trực tuyến của Microsoft
  if (lower.endsWith('.doc') || lower.endsWith('.docx') || lower.endsWith('.xlsx')) {
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
  }
  // Nếu là PDF hoặc hình ảnh thì giữ nguyên để mở tab mới
  return url;
}

export default async function ThuTucHanhChinhDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fields = await getPublicFields();
  const currentField = fields.find((f: any) => f.serviceCategoryId?.toString() === id) || { fieldName: "KHÔNG XÁC ĐỊNH" };
  const fieldName = currentField.fieldName;

  const proceduresData = await getPublicProcedures(id);
  
  const procedures = proceduresData.length > 0 ? proceduresData.map((p: any, index) => ({
    stt: index + 1,
    code: p.serviceCode || "N/A",
    name: p.procedureName || "N/A",
    procedureFileUrl: p.procedureFileUrl || p.detailUrl || "#",
    templateFileUrl: p.templateFileUrl || ""
  })) : [
    {
      stt: 1,
      code: "TT-0001",
      name: "Tổ chức kinh tế nhận chuyển nhượng, thuê quyền sử dụng đất...",
      procedureFileUrl: "#",
      templateFileUrl: "#"
    },
    {
      stt: 2,
      code: "TT-0002",
      name: "Giao đất, cho thuê đất, giao khu vực biển để lấn biển",
      procedureFileUrl: "#",
      templateFileUrl: ""
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 max-w-7xl">
      <div className="mb-8">
        <Link
          href="/dich-vu/thu-tuc-hanh-chinh"
          className="text-[#1a85c2] hover:text-[#156e9f] transition-colors flex items-center text-sm font-medium mb-6"
        >
          &larr; Quay lại danh sách lĩnh vực
        </Link>
        <h1 className="text-2xl font-bold uppercase text-[#c22143] mb-8">
          LĨNH VỰC {fieldName}
        </h1>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-4 px-6 font-semibold text-slate-700 w-20">STT</th>
              <th className="py-4 px-6 font-semibold text-slate-700 w-32">Mã thủ tục</th>
              <th className="py-4 px-6 font-semibold text-slate-700">Tên thủ tục</th>
              <th className="py-4 px-6 font-semibold text-slate-700 w-32 text-center">Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            {procedures.map((proc: any, index: number) => (
              <tr
                key={proc.code}
                className={`hover:bg-slate-50 transition-colors ${
                  index !== procedures.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <td className="py-4 px-6 text-slate-600">{proc.stt}</td>
                <td className="py-4 px-6 text-slate-600 font-medium">{proc.code}</td>
                <td className="py-4 px-6 text-slate-700">{proc.name}</td>
                <td className="py-4 px-6">
                  <div className="flex justify-center gap-2">
                    <a
                      href={getDocumentViewerUrl(proc.procedureFileUrl)}
                      className="inline-flex items-center gap-2 border border-[#1a85c2] text-[#1a85c2] hover:bg-[#1a85c2] hover:text-white transition-colors px-3 py-1.5 rounded-md text-xs font-medium"
                      title="Xem thủ tục"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileText className="w-4 h-4" />
                      XEM THỦ TỤC
                    </a>
                    {proc.templateFileUrl && (
                      <a
                        href={getDocumentViewerUrl(proc.templateFileUrl)}
                        className="inline-flex items-center gap-2 border border-[#d82a4e] text-[#d82a4e] hover:bg-[#d82a4e] hover:text-white transition-colors px-3 py-1.5 rounded-md text-xs font-medium"
                        title="Tải biểu mẫu"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="w-4 h-4" />
                        BIỂU MẪU
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {procedures.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  Không có thủ tục nào trong lĩnh vực này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
