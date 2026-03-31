"use client";

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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";

type ForgotPasswordResponse = {
  message?: string;
};

export default function RecoveryForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5265";
  const forgotPasswordEndpoint =
    process.env.NEXT_PUBLIC_API_FORGOT_PASSWORD_ENDPOINT ??
    "/api/Auth/forgot-password";

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      setSubmitStatus({
        type: "error",
        message: "Vui lòng nhập email.",
      });
      return;
    }

    setSubmitStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}${forgotPasswordEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | ForgotPasswordResponse
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "Không thể gửi mã OTP. Vui lòng thử lại.");
      }

      setSubmitStatus({
        type: "success",
        message: payload?.message || "Đã gửi mã OTP tới email của bạn.",
      });

      router.push(`/xac-minh-otp?email=${encodeURIComponent(email.trim())}`);
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không thể gửi mã OTP lúc này. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full max-w-sm hover:shadow-2xl/50 transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Quên mật khẩu</CardTitle>
          <CardDescription>
            Nhập email của bạn bên dưới để khôi phục mật khẩu
          </CardDescription>
          <CardAction>
            <Link href="/">
              <Button variant="link">Trở về trang chủ</Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <FieldError />
              </Field>

              <Field>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Đang gửi..." : "Gửi mã OTP"}
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
              </Field>
            </FieldGroup>
          </form>
          <Link href="/dang-nhap" className="mx-auto">
            <Button variant="link">Quay lại đăng nhập</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
