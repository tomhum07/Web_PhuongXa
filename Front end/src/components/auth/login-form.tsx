"use client";

import { FormEvent, KeyboardEvent, useRef, useState } from "react";
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

type LoginResponse = {
  message?: string;
  token?: string;
  accessToken?: string;
  role?: string;
  roles?: string[];
  user?: {
    role?: string;
    roles?: string[];
  };
};

type AppRole = "admin" | "editor" | "viewer";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normalizeRole(rawRole?: string): AppRole {
  const normalized = rawRole?.trim().toLowerCase();

  if (normalized === "admin") {
    return "admin";
  }

  if (normalized === "editor") {
    return "editor";
  }

  return "viewer";
}

function getRoleFromPayload(payload: LoginResponse | null): string | undefined {
  return (
    payload?.role ?? payload?.roles?.[0] ?? payload?.user?.role ?? payload?.user?.roles?.[0]
  );
}

function getRoleFromToken(token?: string): string | undefined {
  if (!token) {
    return undefined;
  }

  const decoded = decodeJwtPayload(token);
  if (!decoded) {
    return undefined;
  }

  return (
    (decoded.role as string | undefined) ??
    (decoded["roles"] as string[] | undefined)?.[0] ??
    (decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as
      | string
      | undefined)
  );
}

function getRouteByRole(role: AppRole): string {
  if (role === "admin") {
    return "/dashboard";
  }
  if (role === "editor") {
    return "/quan-tri";
  }

  return "/";
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5265";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  const handleEnterKey = (
    event: KeyboardEvent<HTMLInputElement>,
    field: "email" | "password",
  ) => {
    if (event.key !== "Enter") {
      return;
    }

    if (field === "email") {
      event.preventDefault();
      passwordInputRef.current?.focus();
      return;
    }

    event.preventDefault();
    formRef.current?.requestSubmit();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus(null);

    if (!formData.email.trim() || !formData.password.trim()) {
      setSubmitStatus({
        type: "error",
        message: "Vui lòng nhập đầy đủ email và mật khẩu.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | LoginResponse
        | null;

      if (!response.ok) {
        throw new Error(
          payload?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
        );
      }

      const token = payload?.accessToken ?? payload?.token;
      if (token) {
        localStorage.setItem("auth_token", token);
      }

      const role = normalizeRole(getRoleFromPayload(payload) ?? getRoleFromToken(token));
      localStorage.setItem("auth_role", role);

      setSubmitStatus({
        type: "success",
        message: payload?.message || "Đăng nhập thành công.",
      });

      router.push(getRouteByRole(role));
      router.refresh();
    } catch (error) {
      console.error("Cannot login", error);
      setSubmitStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không thể đăng nhập lúc này. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
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
          <form ref={formRef} onSubmit={handleSubmit}>
            <FieldGroup>
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
                  onKeyDown={(event) => handleEnterKey(event, "email")}
                  disabled={isSubmitting}
                />
                <FieldError />
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
                  ref={passwordInputRef}
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  onKeyDown={(event) => handleEnterKey(event, "password")}
                  disabled={isSubmitting}
                />
                <FieldError />
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
                <Button variant="outline" type="button" disabled={isSubmitting}>
                  Đăng nhập với Google
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