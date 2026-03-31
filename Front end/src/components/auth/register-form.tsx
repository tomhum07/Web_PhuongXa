"use client";

import { FormEvent, KeyboardEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type RegisterResponse = {
  message?: string;
};

function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5265";

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    rePassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleEnterToNextField = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    if (target.tagName.toLowerCase() === "textarea") {
      return;
    }

    const elements = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(
      (element) =>
        !element.hasAttribute("disabled") &&
        element.getAttribute("type") !== "hidden" &&
        element.tabIndex !== -1,
    );

    const currentIndex = elements.indexOf(target);
    if (currentIndex === -1 || currentIndex === elements.length - 1) {
      return;
    }

    event.preventDefault();
    elements[currentIndex + 1]?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus(null);

    if (
      !formData.fullname.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.rePassword
    ) {
      setSubmitStatus({
        type: "error",
        message: "Vui lòng nhập đầy đủ thông tin đăng ký.",
      });
      return;
    }

    if (formData.password !== formData.rePassword) {
      setSubmitStatus({
        type: "error",
        message: "Mật khẩu nhập lại không khớp.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/Auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullname.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.rePassword,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | RegisterResponse
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "Đăng ký thất bại. Vui lòng thử lại.");
      }

      setSubmitStatus({
        type: "success",
        message: payload?.message || "Đăng ký thành công. Đang chuyển đến trang đăng nhập...",
      });

      setTimeout(() => {
        router.push("/dang-nhap");
      }, 1200);
    } catch (error) {
      console.error("Cannot register", error);
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không thể đăng ký lúc này. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full max-w-sm hover:shadow-2xl/50 transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Đăng ký</CardTitle>
          <CardDescription>
            Nhập thông tin của bạn bên dưới để tạo tài khoản
          </CardDescription>
          <CardAction>
            <Link href="/">
              <Button variant="link">Trở về trang chủ</Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} onKeyDown={handleEnterToNextField}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="fullname">Họ và tên</FieldLabel>
                <Input
                  id="fullname"
                  type="text"
                  placeholder="Nhập họ và tên"
                  autoComplete="name"
                  value={formData.fullname}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      fullname: event.target.value,
                    }))
                  }
                  disabled={isSubmitting}
                />
                <FieldError />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                  disabled={isSubmitting}
                />
                <FieldError />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  disabled={isSubmitting}
                />
                <FieldError />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="rePassword">
                    Nhập lại mật khẩu
                  </FieldLabel>
                </div>
                <Input
                  id="rePassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.rePassword}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      rePassword: event.target.value,
                    }))
                  }
                  disabled={isSubmitting}
                />
                <FieldError />
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
                </Button>
                <Button variant="outline" type="button" disabled={isSubmitting}>
                  Đăng ký với Google
                </Button>

                {submitStatus && (
                  <FieldError
                    className={
                      submitStatus.type === "success" ? "text-green-600" : undefined
                    }
                  >
                    {submitStatus.message}
                  </FieldError>
                )}

                <FieldDescription className="text-center">
                  Bạn đã có tài khoản?
                  <Link href="/dang-nhap">
                    <Button variant="link" className="ml-auto p-1">
                      Đăng nhập
                    </Button>
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterForm;