import RecoveryForm from "@/components/auth/recovery-form";
export default function QuenMatKhau() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[url('/cau-cao-lanh.jpg')] bg-cover bg-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RecoveryForm />
      </div>
    </div>
  );
}
