"use client";

import * as React from "react";
import {
  Loader2,
  Send,
  Copy,
  CheckCircle2,
  ChevronDownIcon,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { submitPublicApplication } from "@/lib/api/procedure";
import Link from "next/link";

type PublicApplicationFormProps = {
  selectedProcedureId?: number;
};

export function PublicApplicationForm({
  selectedProcedureId,
}: PublicApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submittedCode, setSubmittedCode] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const successPanelRef = React.useRef<HTMLDivElement>(null);
  const [date, setDate] = React.useState<Date>();

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Đã sao chép mã hồ sơ!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Không thể sao chép.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedProcedureId) {
      toast.error("Vui lòng chọn thủ tục.");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    const fullName = String(formData.get("fullName") || "").trim();
    const cccd = String(formData.get("cccd") || "").trim();
    const address = String(formData.get("address") || "").trim();

    if (!fullName || !cccd || !address || !date) {
      toast.error("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    const birthDate = format(date, "yyyy-MM-dd");
    const file = formData.get("attachments") as File;

    if (!file || file.size === 0) {
      toast.error("Vui lòng chọn file.");
      return;
    }

    formData.set("ServiceId", String(selectedProcedureId));
    formData.set("ApplicantName", fullName);
    formData.set("IdentityNumber", cccd);
    formData.set("Address", address);
    formData.set("DateOfBirth", birthDate);
    formData.set("AttachedFile", file);

    setIsSubmitting(true);

    try {
      const res = await submitPublicApplication(formData);
      setSubmittedCode(res.applicationCode || "");
      setIsSubmitted(true);
      form.reset();
      setDate(undefined);

      setTimeout(() => {
        successPanelRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      toast.success("Nộp hồ sơ thành công!");
    } catch {
      toast.error("Lỗi khi nộp hồ sơ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SUCCESS */}
      {isSubmitted && (
        <div
          ref={successPanelRef}
          className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm animate-in fade-in zoom-in-95"
        >
          <div className="absolute -top-10 -right-10 h-32 w-32 bg-emerald-200 blur-3xl opacity-30" />

          <div className="flex items-center gap-2 text-emerald-800 font-semibold mb-3">
            <CheckCircle2 />
            Thành công!
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/80 p-4 border shadow-sm">
            <code className="flex-1 font-mono font-bold tracking-widest text-lg">
              {submittedCode}
            </code>

            <Button
              size="sm"
              onClick={() => handleCopyCode(submittedCode)}
              className="bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            </Button>
          </div>

          <div className="py-2">
            <p className="text-emerald-600">
              Bạn có thể tra cứu trạng thái{" "}
              <Link
                href="/tra-cuu-ho-so"
                className="text-emerald-600 font-bold hover:underline"
              >
                tại đây
              </Link>
            </p>
          </div>
          <Button variant="ghost" onClick={() => setIsSubmitted(false)}>
            Nộp lại
          </Button>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="rounded-xl bg-slate-50 p-3 text-xs shadow-sm">
          Nhập đầy đủ thông tin và đính kèm hồ sơ.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ tên</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Nguyễn Văn A"
              required
              className="focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="font-medium text-slate-700">
              Ngày tháng năm sinh *
            </Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="birthDate"
                  type="button"
                  variant="outline"
                  data-empty={!date}
                  className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                >
                  {date ? (
                    format(date, "PPP")
                  ) : (
                    <span>Chọn ngày, tháng, năm sinh</span>
                  )}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  captionLayout="dropdown"
                  defaultMonth={date}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cccd">CCCD</Label>
            <Input
              id="cccd"
              name="cccd"
              placeholder="012345678901"
              maxLength={12}
              minLength={12}
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              name="address"
              placeholder="123 Đường ABC, Quận XYZ"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="file">File</Label>
          <Input
            id="file"
            type="file"
            name="attachments"
            className="border-dashed border-2"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
          Nộp hồ sơ
        </Button>
      </form>
    </div>
  );
}
