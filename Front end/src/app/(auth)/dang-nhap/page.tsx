import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

function LoginFallback() {
  return (
    <div className="w-full rounded-lg border bg-background/90 p-6 shadow-sm">
      <p className="text-sm text-muted-foreground">
        Đang tải form đăng nhập...
      </p>
    </div>
  );
}

export default function DangNhap() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[url('/cau-cao-lanh.jpg')] bg-cover bg-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<LoginFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
