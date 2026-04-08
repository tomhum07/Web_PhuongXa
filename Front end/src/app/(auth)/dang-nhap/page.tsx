import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

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
<<<<<<< HEAD
        <Suspense fallback={<div>Loading...</div>}>
=======
        <Suspense fallback={<LoginFallback />}>
>>>>>>> 6dad0d803cdb2498e58b360c22d2c7971b199c19
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
