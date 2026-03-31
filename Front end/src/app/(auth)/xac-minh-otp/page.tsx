import { OTPForm } from "@/components/auth/otp-form";

type XacMinhOtpPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function XacMinhOtpPage({
  searchParams,
}: XacMinhOtpPageProps) {
  const { email } = await searchParams;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[url('/cau-cao-lanh.jpg')] bg-cover bg-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <OTPForm email={email} />
      </div>
    </div>
  );
}
