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

type OTPFormProps = {
  email?: string;
};

type OTPResponse = {
  message?: string;
};

export function OTPForm({ email = "m@example.com" }: OTPFormProps) {
  const router = useRouter();
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5265";
  const verifyOtpEndpoint =
    process.env.NEXT_PUBLIC_API_VERIFY_OTP_ENDPOINT ?? "/api/Auth/verify-otp";
  const forgotPasswordEndpoint =
    process.env.NEXT_PUBLIC_API_FORGOT_PASSWORD_ENDPOINT ??
    "/api/Auth/forgot-password";

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleVerifyOTP = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email?.trim()) {
      setStatus({
        type: "error",
        message: "Không tìm thấy email. Vui lòng quay lại bước trước.",
      });
      return;
    }

    if (otp.length !== 6) {
      setStatus({
        type: "error",
        message: "Vui lòng nhập đầy đủ 6 số OTP.",
      });
      return;
    }

    setStatus(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}${verifyOtpEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          otp,
        }),
      });

      const payload = (await response.json().catch(() => null)) as OTPResponse | null;

      if (!response.ok) {
        throw new Error(payload?.message || "Mã OTP không hợp lệ hoặc đã hết hạn.");
      }

      setStatus({
        type: "success",
        message: payload?.message || "Xác minh OTP thành công.",
      });

      router.push(
        `/tao-mat-khau?email=${encodeURIComponent(email.trim())}&otp=${encodeURIComponent(otp)}`,
      );
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không thể xác minh OTP lúc này. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email?.trim()) {
      setStatus({
        type: "error",
        message: "Không tìm thấy email để gửi lại OTP.",
      });
      return;
    }

    setStatus(null);
    setIsResending(true);

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

      const payload = (await response.json().catch(() => null)) as OTPResponse | null;

      if (!response.ok) {
        throw new Error(payload?.message || "Không thể gửi lại OTP. Vui lòng thử lại.");
      }

      setStatus({
        type: "success",
        message: payload?.message || "Đã gửi lại mã OTP tới email của bạn.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không thể gửi lại OTP lúc này. Vui lòng thử lại sau.",
      });
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

            <InputOTP
              maxLength={6}
              id="otp-verification"
              required
              containerClassName="justify-center"
              value={otp}
              onChange={(value: string) => {
                setOtp(value);
                if (status?.type === "error") {
                  setStatus(null);
                }
              }}
              disabled={isSubmitting}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="h-12 w-11 text-xl" />
                <InputOTPSlot index={1} className="h-12 w-11 text-xl" />
                <InputOTPSlot index={2} className="h-12 w-11 text-xl" />
              </InputOTPGroup>
              <InputOTPSeparator className="mx-2" />
              <InputOTPGroup>
                <InputOTPSlot index={3} className="h-12 w-11 text-xl" />
                <InputOTPSlot index={4} className="h-12 w-11 text-xl" />
                <InputOTPSlot index={5} className="h-12 w-11 text-xl" />
              </InputOTPGroup>
            </InputOTP>

            <FieldError
              className={status?.type === "success" ? "text-green-600" : undefined}
            >
              {status?.message}
            </FieldError>

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
