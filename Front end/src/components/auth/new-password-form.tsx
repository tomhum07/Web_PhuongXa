"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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

type NewPasswordFormProps = {
  email?: string;
  otp?: string;
};

type ResetPasswordResponse = {
  message?: string;
};

export default function NewPasswordForm({
  email = "m@example.com",
  otp,
}: NewPasswordFormProps) {
  const router = useRouter();
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5265";
  const resetPasswordEndpoint =
    process.env.NEXT_PUBLIC_API_RESET_PASSWORD_ENDPOINT ?? "/api/Auth/reset-password";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email?.trim()) {
      setError("Không tìm thấy email. Vui lòng quay lại bước khôi phục mật khẩu.");
      return;
    }

    if (!otp?.trim()) {
      setError("Không tìm thấy mã OTP. Vui lòng xác minh OTP lại.");
      return;
    }
// test nên tắt tạm
    // if (password.length < 8) {
    //   setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
    //   return;
    // }

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setError(null);
    setSubmitStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}${resetPasswordEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword: password,
          confirmPassword,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | ResetPasswordResponse
        | null;

      if (!response.ok) {
        throw new Error(payload?.message || "Không thể cập nhật mật khẩu. Vui lòng thử lại.");
      }

      setSubmitStatus({
        type: "success",
        message:
          payload?.message || "Cập nhật mật khẩu thành công. Đang chuyển đến trang đăng nhập...",
      });

      setTimeout(() => {
        router.push("/dang-nhap");
      }, 1200);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể cập nhật mật khẩu lúc này. Vui lòng thử lại sau.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-sm hover:shadow-2xl/50 transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Tạo mật khẩu mới</CardTitle>
        <CardDescription>
          Thiết lập mật khẩu mới cho tài khoản:{" "}
          <span className="font-medium text-blue-500">{email}</span>
        </CardDescription>
        <CardAction>
          <Link href="/dang-nhap">
            <Button variant="link">Trở về đăng nhập</Button>
          </Link>
        </CardAction>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="new-password">Mật khẩu mới</FieldLabel>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="Nhập mật khẩu mới"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-new-password">
                Nhập lại mật khẩu mới
              </FieldLabel>
              <Input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={isSubmitting}
                required
              />
              <FieldError>{error}</FieldError>
              {submitStatus && (
                <FieldError
                  className={
                    submitStatus.type === "success" ? "text-green-600" : undefined
                  }
                >
                  {submitStatus.message}
                </FieldError>
              )}
              <FieldDescription>
                Mật khẩu nên có chữ hoa, chữ thường, số và ký tự đặc biệt.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter>
          <Field>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </Button>
          </Field>
        </CardFooter>
      </form>
    </Card>
  );
}
