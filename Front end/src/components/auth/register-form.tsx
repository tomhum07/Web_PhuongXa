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
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "../../lib/auth";
import { toast } from "sonner";
const registerSchema = z
  .object({
    fullName: z.string().trim().min(1, "Vui lòng nhập họ và tên."),
    email: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập email.")
      .email("Email không đúng định dạng."),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự."),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu và xác nhận mật khẩu không khớp.",
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/Auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg =
          payload?.message ??
          payload?.Message ??
          "Đăng ký thất bại. Vui lòng thử lại.";
        toast.error(errorMsg, { position: "top-center" });
        return;
      }

      const successMsg =
        payload?.message ?? payload?.Message ?? "Đăng ký thành công!";
      toast.success(successMsg, { position: "top-center" });
      setTimeout(() => {
        router.push("/dang-nhap");
      }, 800);
    } catch {
      setErrorMessage("Không kết nối được tới máy chủ. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="w-full max-w-sm hover:shadow-2xl/50 transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Đăng ký</CardTitle>
          <CardDescription>
            Nhập tên tài khoản hoặc email của bạn bên dưới để tạo tài khoản
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
                <FieldLabel htmlFor="fullname">Họ và tên</FieldLabel>
                <Input
                  id="fullname"
                  type="text"
                  placeholder="Nhập họ và tên"
                  autoComplete="name"
                  {...register("fullName")}
                  disabled={isSubmitting}
                />
                <FieldError errors={[errors.fullName]} />
              </Field>
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
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="******"
                  {...register("password")}
                  disabled={isSubmitting}
                />
                <FieldError errors={[errors.password]} />
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
                  placeholder="******"
                  {...register("confirmPassword")}
                  disabled={isSubmitting}
                />
                <FieldError errors={[errors.confirmPassword]} />
              </Field>
              <Field>
                {errorMessage ? (
                  <p className="mb-2 text-sm text-destructive">
                    {errorMessage}
                  </p>
                ) : null}
                {successMessage ? (
                  <p className="mb-2 text-sm text-emerald-600">
                    {successMessage}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
                </Button>
                <Button variant="outline" type="button" disabled={isSubmitting}>
                  Đăng ký với Google
                </Button>
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
