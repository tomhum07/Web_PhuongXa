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

export default function LienHe() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5265";

  const [formData, setFormData] = useState({
    hoTen: "",
    email: "",
    numberPhone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/Feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          fullName: formData.hoTen,
          email: formData.email,
          phoneNumber: formData.numberPhone,
          content: formData.message,
        }),
      });

      if (!response.ok) {
        let backendMessage = "";

        try {
          const errorPayload: { message?: string } = await response.json();
          backendMessage = errorPayload.message ?? "";
        } catch {
          // Ignore parse errors and fallback to generic status-based message.
        }

        throw new Error(
          backendMessage || `Failed to submit feedback: ${response.status}`,
        );
      }

      setSubmitStatus({
        type: "success",
        message: "Gửi phản ánh/kiến nghị thành công.",
      });
      setFormData({
        hoTen: "",
        email: "",
        numberPhone: "",
        message: "",
      });
    } catch (error) {
      console.error("Cannot submit feedback", error);
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không thể gửi phản ánh/kiến nghị lúc này. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-center my-6">
        <h1 className="text-3xl font-bold">Liên hệ</h1>
        <div className="mx-auto mt-10 grid max-w-6xl items-stretch gap-6 px-4 md:grid-cols-2 md:px-0">
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
                    className="text-blue-600 hover:underline"
                  >
                    02773851601
                  </a>
                </p>

                <p>
                  Email:{" "}
                  <a
                    href="mailto:ubndpcaolanh@gmail.com"
                    className="text-blue-600 hover:underline"
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
                    className="text-blue-600 hover:underline"
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
              <form id="feedback-form" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="grid">
                    <Label htmlFor="hoTen" className="text-base">
                      Họ & tên
                    </Label>
                    <Input
                      id="hoTen"
                      value={formData.hoTen}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          hoTen: event.target.value,
                        }))
                      }
                      type="text"
                      placeholder="Nguyễn Văn A"
                      className="py-5"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid ">
                    <Label htmlFor="email" className="text-base">
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      type="email"
                      placeholder="mail@example.com"
                      className="py-5"
                      required
                      disabled={isSubmitting}
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
                      value={formData.numberPhone}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          numberPhone: event.target.value,
                        }))
                      }
                      type="tel"
                      placeholder="Nhập số điện thoại"
                      className="py-5"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid ">
                    <Label htmlFor="message" className="text-base">
                      Nội dung phản ánh/kiến nghị
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          message: event.target.value,
                        }))
                      }
                      placeholder="Nhập nội dung phản ánh/kiến nghị"
                      className="h-40"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  {submitStatus ? (
                    <p
                      className={`text-sm ${
                        submitStatus.type === "success"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {submitStatus.message}
                    </p>
                  ) : null}
                </div>
              </form>
            </CardContent>

            <CardFooter>
              <Button
                size="lg"
                className="w-full text-base"
                type="submit"
                form="feedback-form"
                disabled={isSubmitting}
              >
                {isSubmitting ? "ĐANG GỬI..." : "GỬI"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
