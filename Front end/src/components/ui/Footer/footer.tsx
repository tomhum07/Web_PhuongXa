"use client";

import { Separator } from "@/components/ui/separator";
import {
  Phone,
  MapPin,
  House,
  Newspaper,
  FileText,
  Info,
  Contact,
  Mail,
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-muted mt-5">
      <div className="container mx-auto px-6 py-10 flex flex-col gap-6 md:flex-row md:items-stretch">
        {/* Cột 1 */}
        <div className="md:flex-1">
          <h2 className="font-bold text-xl">Phường Cao Lãnh</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Trang web quảng bá Phường Cao Lãnh, cung cấp thông tin về lịch sử,
            văn hóa và các sự kiện nổi bật của địa phương.
          </p>
        </div>

        <Separator orientation="vertical" className="hidden md:block" />

        {/* Cột 2 */}
        <div className="md:flex-1">
          <h2 className="font-semibold text-xl">Liên kết</h2>
          <ul className="mt-2 space-y-2 text-base">
            <li>
              <Link href="/" className="flex items-center gap-2">
                <House size={16} /> Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/gioi-thieu" className="flex items-center gap-2">
                <Info size={16} /> Giới thiệu
              </Link>
            </li>
            <li>
              <Link href="/lien-he" className="flex items-center gap-2">
                <Contact size={16} /> Liên hệ
              </Link>
            </li>
            <li>
              <Link href="/tin-tuc" className="flex items-center gap-2">
                <Newspaper size={16} /> Tin tức
              </Link>
            </li>
            <li>
              <Link
                href="/dich-vu"
                className="flex items-center text-justify gap-2"
              >
                <FileText size={16} /> Dịch vụ
              </Link>
            </li>
          </ul>
        </div>

        <Separator orientation="vertical" className="hidden md:block" />

        {/* Cột 3 */}
        <div className="md:flex-1">
          <h2 className="font-semibold text-xl">Liên hệ</h2>
          <p className="flex items-center gap-2 text-base">
            <MapPin size={16} /> Phường Cao Lãnh, Đồng Tháp
          </p>

          <Link
            href="mailto:support@caolanh.gov.vn"
            className="flex items-center gap-2 text-base"
          >
            <Mail size={16} /> support@caolanh.gov.vn
          </Link>
          <Link
            href="tel:0123456789"
            className="flex items-center gap-2 text-base"
          >
            <Phone size={16} /> 0123 456 789
          </Link>
        </div>
      </div>

      <Separator />

      <div className="text-center py-4 text-sm text-muted-foreground">
        © 2026 Phường Cao Lãnh. All rights reserved.
      </div>
    </footer>
  );
}
