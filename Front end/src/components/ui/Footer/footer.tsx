"use client";

import { MapPin, Phone, Mail, ChevronRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white text-slate-700 border-t-2 border-pink-600 text-[13px] shadow-[0_-4px_10px_-2px_rgba(0,0,0,0.05)]">
      <div className="container mx-auto px-6 py-6 md:py-8">
        {/* Phần Header của Footer */}
        <div className="border-b border-slate-200 pb-4 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="uppercase font-bold text-base md:text-lg text-pink-700 tracking-wide">
              Trang thông tin điện tử Phường Cao Lãnh
            </h2>
            <p className="uppercase text-[11px] font-semibold mt-1 text-slate-500">
              Ủy ban nhân dân Phường Cao Lãnh - Tỉnh Đồng Tháp
            </p>
          </div>
          {/* Badge chứng nhận - Ẩn trên mobile cho gọn */}
          <div className="hidden md:flex items-center gap-2 text-pink-700 bg-pink-50 border border-pink-100 px-3 py-1.5 rounded-full">
            <ShieldCheck size={18} strokeWidth={2} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Cổng thông tin chính thức
            </span>
          </div>
        </div>

        {/* Phần Nội dung chính (Chia 3 cột) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6 leading-relaxed">
          {/* Cột 1: Thông tin cơ quan (Rộng nhất) */}
          <div className="md:col-span-5 space-y-3">
            <p className="font-bold text-slate-800 text-[14px]">
              Cơ quan chủ quản: UBND Phường Cao Lãnh
            </p>
            <div className="space-y-2 text-slate-600">
              <p className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 text-pink-600 shrink-0" />
                <span>Số 3 Đường 30 Tháng 4, Phường Cao Lãnh, Đồng Tháp</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} className="text-pink-600 shrink-0" />
                <a
                  href="tel:02773851601"
                  className="hover:text-pink-700 transition-colors"
                >
                  02773851601
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={16} className="text-pink-600 shrink-0" />

                <a
                  href="mailto:support@caolanh.gov.vn"
                  className="hover:text-pink-700 transition-colors"
                >
                  Gửi email
                </a>
              </p>
            </div>
          </div>

          {/* Cột 2: Ban biên tập */}
          <div className="md:col-span-4 space-y-3">
            <p className="font-bold text-slate-800 text-[14px]">
              Ban biên tập Cổng thông tin
            </p>
            <div className="space-y-1.5 text-slate-600">
              <p>
                <strong className="text-slate-700 font-semibold">
                  Chịu trách nhiệm:
                </strong>{" "}
                Ông Nguyễn Văn A
              </p>
              <p>
                <strong className="text-slate-700 font-semibold">
                  Chức vụ:
                </strong>{" "}
                Chủ tịch UBND Phường
              </p>
              <p className="pt-1 text-[11px] text-slate-500 italic">
                Giấy phép số: 123/GP-TTĐT cấp ngày 01/01/2024
              </p>
            </div>
          </div>

          {/* Cột 3: Liên kết nhanh */}
          <div className="md:col-span-3 space-y-3">
            <p className="font-bold text-slate-800 text-[14px]">
              Liên kết nhanh
            </p>
            <ul className="space-y-2 text-slate-600">
              <li>
                <Link
                  href="/"
                  className="hover:text-pink-700 transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight
                    size={14}
                    className="text-pink-500 group-hover:translate-x-1 transition-transform"
                  />
                  Cổng dịch vụ công
                </Link>
              </li>
              <li>
                <Link
                  href="/tin-tuc"
                  className="hover:text-pink-700 transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight
                    size={14}
                    className="text-pink-500 group-hover:translate-x-1 transition-transform"
                  />
                  Thông báo - Điều hành
                </Link>
              </li>
              <li>
                <Link
                  href="/lien-he"
                  className="hover:text-pink-700 transition-colors flex items-center gap-1.5 group"
                >
                  <ChevronRight
                    size={14}
                    className="text-pink-500 group-hover:translate-x-1 transition-transform"
                  />
                  Hòm thư góp ý
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dòng Copyright dưới cùng */}
      <div className="bg-slate-50 py-3 text-center text-[11px] md:text-xs text-slate-500 border-t border-slate-200">
        <p>© 2026 Bản quyền thuộc về Ủy ban nhân dân Phường Cao Lãnh.</p>
        <p className="mt-0.5">{`Ghi rõ nguồn "Trang TTĐT Phường Cao Lãnh" khi phát hành lại thông tin từ website này.`}</p>
      </div>
    </footer>
  );
}
