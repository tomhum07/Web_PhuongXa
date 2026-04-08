"use client";

import { RefreshCwIcon } from "lucide-react";
import { FormEvent, useState } from "react";

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
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "@/lib/auth";
import { toast } from "sonner";

type OTPFormProps = {
  email?: string;
};

export function OTPForm({ email = "m@example.com" }: OTPFormProps) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const hasOtpError = Boolean(error);

  const handleVerifyOTP = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError("Không tìm thấy email để xác thực OTP.");
      return;
    }

    if (otp.length !== 6) {
      setError("Vui lòng nhập đầy đủ 6 số OTP.");
      return;
    }

    setError(null);

    setIsSubmitting(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/Auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          otp,
        }),
      });

      const payload = await response.json().catch(() => null);
      const message = payload?.message ?? payload?.Message;

      if (!response.ok) {
        setError(message ?? "Mã OTP không hợp lệ.");
        return;
      }

      toast.success(message ?? "Xác thực OTP thành công.");
      router.push(
        `/tao-mat-khau?email=${encodeURIComponent(normalizedEmail)}&otp=${encodeURIComponent(otp)}`,
      );
    } catch {
      setError("Không kết nối được tới máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError("Không tìm thấy email để gửi lại OTP.");
      return;
    }

    setError(null);
    setIsResending(true);
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/Auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email: normalizedEmail }),
        },
      );

      const payload = await response.json().catch(() => null);
      const message = payload?.message ?? payload?.Message;

      if (!response.ok) {
        setError(message ?? "Không thể gửi lại OTP.");
        return;
      }

      toast.success(message ?? "Đã gửi lại OTP.");
    } catch {
      setError("Không kết nối được tới máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Khôi phục mật khẩu</CardTitle>
        <CardAction>
          <Link href="/dang-nhap">
            <Button variant="link">Trở về đăng nhập</Button>
          </Link>
        </CardAction>
        <CardDescription>
          Nhập vào mã OTP mà chúng tôi đã gửi đến email của bạn:{" "}
          <span className="font-medium text-blue-500">{email}</span>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleVerifyOTP}>
        <CardContent>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="otp-verification">Mã xác minh</FieldLabel>
              <Button
                variant="outline"
                size="xs"
                type="button"
                onClick={handleResendOtp}
                disabled={isResending || isSubmitting}
              >
                <RefreshCwIcon />
                {isResending ? "Đang gửi..." : "Gửi lại mã"}
              </Button>
            </div>
            <div className="my-2">
              <InputOTP
                maxLength={6}
                id="otp-verification"
                required
                containerClassName="justify-center"
                value={otp}
                onChange={(value) => {
                  setOtp(value);
                  if (error) setError(null);
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot
                    index={0}
                    aria-invalid={hasOtpError}
                    className="h-12 w-11 text-xl"
                  />
                  <InputOTPSlot
                    index={1}
                    aria-invalid={hasOtpError}
                    className="h-12 w-11 text-xl"
                  />
                  <InputOTPSlot
                    index={2}
                    aria-invalid={hasOtpError}
                    className="h-12 w-11 text-xl"
                  />
                </InputOTPGroup>
                <InputOTPSeparator className="mx-2" />
                <InputOTPGroup>
                  <InputOTPSlot
                    index={3}
                    aria-invalid={hasOtpError}
                    className="h-12 w-11 text-xl"
                  />
                  <InputOTPSlot
                    index={4}
                    aria-invalid={hasOtpError}
                    className="h-12 w-11 text-xl"
                  />
                  <InputOTPSlot
                    index={5}
                    aria-invalid={hasOtpError}
                    className="h-12 w-11 text-xl"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <FieldError>{error}</FieldError>

            <FieldDescription>
              <a href="#">
                Tôi không còn truy cập được vào địa chỉ email này nữa.
              </a>
            </FieldDescription>
          </Field>
        </CardContent>
        <CardFooter>
          <Field>
            <Button
              type="submit"
              className="w-full"
              disabled={otp.length !== 6 || isSubmitting}
            >
              {isSubmitting ? "Đang xác minh..." : "Xác minh"}
            </Button>
            <div className="text-sm text-muted-foreground">
              Bạn gặp sự cố khi đăng nhập?{" "}
              <a
                href="#"
                className="underline underline-offset-4 transition-colors hover:text-primary"
              >
                Liên hệ bộ phận hỗ trợ
              </a>
            </div>
          </Field>
        </CardFooter>
      </form>
    </Card>
  );
}
