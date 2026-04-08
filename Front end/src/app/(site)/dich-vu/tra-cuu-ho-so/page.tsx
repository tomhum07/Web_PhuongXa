import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export const revalidate = 3600;

export default function Page() {
  return (
    <main className="container mx-auto px-4 py-10">
      <Button asChild variant="ghost" size="sm" className="mb-4 px-0">
        <Link href="/dich-vu">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại trang Dịch vụ
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
          Tra cứu hồ sơ
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Nội dung trang tra cứu hồ sơ sẽ được tách và triển khai tại đây.
        </p>
      </div>
    </main>
  );
}
