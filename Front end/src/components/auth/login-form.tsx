"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useRouter, useSearchParams } from "next/navigation";
import {
  getApiBaseUrl,
  getRedirectPathByRole,
  setAuthSession,
} from "../../lib/auth";

import { toast } from "sonner";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email.")
    .email("Email không đúng định dạng."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage("");

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: values.email.trim(),
          password: values.password,
        }),
      });

      const payload = await response.json().catch(() => null);
      const token = payload?.token ?? payload?.Token;
      const userInfo = payload?.userInfo ?? payload?.UserInfo;

      if (!response.ok || !token) {
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
      const role = userInfo?.role ?? userInfo?.Role ?? "";
      setAuthSession({
        token,
        role,
        userId: userInfo?.userId ?? userInfo?.UserId,
        fullName: userInfo?.fullName ?? userInfo?.FullName,
        email: userInfo?.email ?? userInfo?.Email ?? values.email.trim(),
        avatarUrl:
          userInfo?.avatarUrl ??
          userInfo?.AvatarUrl ??
          userInfo?.profileImage ??
          userInfo?.ProfileImage,
      });

      const callbackUrl = searchParams.get("callbackUrl");
      const redirectPath =
        callbackUrl && callbackUrl.startsWith("/")
          ? callbackUrl
          : getRedirectPathByRole(role);
      router.replace(redirectPath);
      router.refresh();
    } catch {
      setErrorMessage("Không kết nối được tới máy chủ. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full max-w-sm hover:shadow-2xl/50 transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập email của bạn bên dưới để đăng nhập vào tài khoản
          </CardDescription>
          <CardAction>
            <Link href="/">
              <Button variant="link">Trở về trang chủ</Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  autoComplete="email"
                  {...register("email")}
                  disabled={isSubmitting}
                />
                <FieldError errors={[errors.email]} />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                  <Link
                    href="/quen-mat-khau"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    <Button variant="link" className="ml-auto p-0">
                      Quên mật khẩu?{" "}
                    </Button>
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                  disabled={isSubmitting}
                />
                <FieldError errors={[errors.password]} />
              </Field>
              <Field>
                {errorMessage ? (
                  <p className="mb-2 text-sm text-destructive">
                    {errorMessage}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
                <Button variant="outline" type="button" disabled={isSubmitting}>
                  Đăng nhập với Google
                </Button>

                <FieldDescription className="text-center">
                  Chưa có tài khoản?
                  <Link href="/dang-ky">
                    <Button variant="link" className="ml-auto p-1">
                      Đăng ký
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
