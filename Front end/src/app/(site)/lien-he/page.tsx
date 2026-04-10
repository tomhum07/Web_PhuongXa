"use client";

import { FormEvent, useState } from "react";
import MapCard from "@/components/ui/Card/CardMap/cardmap";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createFeedback } from "@/lib/api/feedback";
import {
  Loader2,
  Mail,
  MailIcon,
  MapPin,
  MessageSquareMore,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

export default function LienHe() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);

    const fullName = String(formData.get("hoTen") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phoneNumber = String(formData.get("numberPhone") || "").trim();
    const content = String(formData.get("message") || "").trim();

    if (!fullName || !email || !content) {
      toast.error("Vui lòng nhập đầy đủ họ tên, email và nội dung phản ánh.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createFeedback({
        fullName,
        email,
        phoneNumber,
        content,
      });
      toast.success(result.message);
      formElement.reset();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể gửi phản ánh/kiến nghị. Vui lòng thử lại sau.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <header className="relative overflow-hidden border-b bg-rose-50/70">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <Mail className="absolute left-8 top-4 size-10 -rotate-12 text-rose-300/60" />
          <Phone className="absolute right-10 top-8 size-9 rotate-12 text-emerald-300/60" />
          <MessageSquareMore className="absolute left-[14%] bottom-5 size-10 rotate-6 text-rose-300/50" />
          <MapPin className="absolute right-[16%] bottom-4 size-10 -rotate-6 text-emerald-300/50" />
        </div>

        <div className="container relative mx-auto flex flex-col items-center gap-3 p-5 text-center">
          <h1 className="text-4xl font-black tracking-tight text-pink-600 sm:text-5xl">
            Liên hệ
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            Gửi phản ánh, kiến nghị hoặc yêu cầu hỗ trợ đến UBND phường Cao
            Lãnh. Chúng tôi luôn sẵn sàng tiếp nhận và phản hồi sớm nhất.
          </p>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="h-7 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-emerald-700"
            >
              <MailIcon className="size-3.5" />
              Kênh tiếp nhận phản ánh
            </Badge>
            <Badge
              variant="secondary"
              className="h-7 rounded-full border border-emerald-200 bg-emerald-50 px-4 text-emerald-700"
            >
              <Phone className="size-3.5" />
              Hỗ trợ giờ hành chính
            </Badge>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-10 mb-5 grid max-w-6xl items-stretch gap-6 grid-cols-2 px-0">
        <div className="flex h-full flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Thông tin UBND
              </CardTitle>
            </CardHeader>

            <CardContent className="text-left text-base space-y-2">
              <p>
                Địa chỉ: Số 03, đường 30/4, phường Cao Lãnh, tỉnh Đồng Tháp.
              </p>

              <p>
                Số điện thoại:{" "}
                <a
                  href="tel:02773851601"
                  className="text-pink-600 hover:underline"
                >
                  02773851601
                </a>
              </p>

              <p>
                Email:{" "}
                <a
                  href="mailto:ubndpcaolanh@gmail.com"
                  className="text-pink-600 hover:underline"
                >
                  ubndpcaolanh@gmail.com
                </a>
              </p>

              <p>
                Website:{" "}
                <a
                  href="https://caolanh.dongthap.gov.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:underline"
                >
                  caolanh.dongthap.gov.vn
                </a>
              </p>
            </CardContent>
          </Card>

          <MapCard />
        </div>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Phản ánh / kiến nghị
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1">
            <form id="contact-feedback-form" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid">
                  <Label htmlFor="hoTen" className="text-base">
                    Họ & tên
                  </Label>
                  <Input
                    id="hoTen"
                    name="hoTen"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="py-5 outline-pink-100 focus-visible:ring-pink-200 focus-visible:ring-3"
                    required
                  />
                </div>
                <div className="grid ">
                  <Label htmlFor="email" className="text-base">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="mail@example.com"
                    className="py-5 outline-pink-100 focus-visible:ring-pink-200 focus-visible:ring-3"
                    required
                  />
                </div>
                <div className="grid">
                  <div className="flex items-center">
                    <Label htmlFor="numberPhone" className="text-base">
                      Số điện thoại
                    </Label>
                  </div>
                  <Input
                    id="numberPhone"
                    name="numberPhone"
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    className="py-5 outline-pink-100 focus-visible:ring-pink-200 focus-visible:ring-3"
                  />
                </div>
                <div className="grid ">
                  <Label htmlFor="message" className="text-base">
                    Nội dung phản ánh/kiến nghị
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Nhập nội dung phản ánh/kiến nghị"
                    className="h-40 outline-pink-100 focus-visible:ring-pink-200 focus-visible:ring-3"
                    required
                  />
                </div>
              </div>
            </form>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              form="contact-feedback-form"
              size="lg"
              disabled={isSubmitting}
              className="w-full text-base font-semibold bg-pink-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  ĐANG GỬI...
                </>
              ) : (
                "GỬI"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
