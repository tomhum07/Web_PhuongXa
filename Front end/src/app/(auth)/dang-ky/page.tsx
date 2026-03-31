import RegisterForm from "@/components/auth/register-form";

export default function page() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[url('/cau-cao-lanh.jpg')] bg-cover bg-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
