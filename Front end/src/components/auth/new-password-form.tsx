"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/lib/auth";
import { toast } from "sonner";

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

export default function NewPasswordForm({
  email = "m@example.com",
  otp = "",
}: NewPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim();
    const normalizedOtp = otp.trim();

    if (!normalizedEmail || !normalizedOtp) {
      setError(
        "Thiếu email hoặc mã OTP. Vui lòng thực hiện lại bước xác thực OTP.",
      );
      return;
    }

    if (password.length < 8) {
      setError("Mật khẩu mới phải có ít nhất 8 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setError(null);

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/api/Auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            otp: normalizedOtp,
            newPassword: password,
            confirmPassword,
          }),
        },
      );

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg =
          payload?.message ??
          payload?.Message ??
          "Đăng nhập thất bại. Vui lòng thử lại.";
        toast.error(errorMsg, { position: "top-center" });
        return;
      }

      const successMsg =
        payload?.message ?? payload?.Message ?? "Đăng nhập thành công!";
      toast.success(successMsg, { position: "top-center" });
      router.push("/dang-nhap");
    } catch {
      setError("Không kết nối được tới máy chủ. Vui lòng thử lại sau.");
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
              <FieldDescription>
                Mật khẩu nên có chữ hoa, chữ thường, số và ký tự đặc biệt.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>

        <CardFooter>
          <Field>
            <Button type="submit" className="w-full">
              {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </Button>
          </Field>
        </CardFooter>
      </form>
    </Card>
  );
}
