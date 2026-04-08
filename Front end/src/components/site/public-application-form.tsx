"use client";

import * as React from "react";
import { Loader2, Send, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitPublicApplication } from "@/lib/api/procedure";

type PublicApplicationFormProps = {
  selectedProcedureId?: number;
};

export function PublicApplicationForm({
  selectedProcedureId,
}: PublicApplicationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submittedCode, setSubmittedCode] = React.useState<string>("");
  const successPanelRef = React.useRef<HTMLDivElement>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Đã sao chép mã hồ sơ!");
  };

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!selectedProcedureId) {
        toast.error("Vui lòng chọn thủ tục trước khi nộp hồ sơ.");
        return;
      }

      const formElement = event.currentTarget;
      const formData = new FormData(formElement);

      const fullName = String(formData.get("fullName") || "").trim();
      const birthDate = String(formData.get("birthDate") || "").trim();
      const cccd = String(formData.get("cccd") || "").trim();
      const address = String(formData.get("address") || "").trim();
      const attachments = formData.getAll("attachments");
      const firstAttachment = attachments.find(
        (file) => file instanceof File && file.size > 0,
      );

      if (!fullName || !cccd || !address) {
        toast.error("Vui lòng nhập đầy đủ họ tên, CCCD/CMND và địa chỉ.");
        return;
      }

      if (!(firstAttachment instanceof File)) {
        toast.error("Vui lòng đính kèm file hồ sơ.");
        return;
      }

      formData.set("serviceId", String(selectedProcedureId));

      formData.set("ServiceId", String(selectedProcedureId));
      formData.set("ApplicantName", fullName);
      formData.set("IdentityNumber", cccd);
      formData.set("Address", address);
      if (birthDate) {
        formData.set("DateOfBirth", birthDate);
      }
      formData.set("AttachedFile", firstAttachment);

      setIsSubmitting(true);
      try {
        const result = await submitPublicApplication(formData);
        setSubmittedCode(result.applicationCode || "");
        setIsSubmitted(true);
        toast.success(
          result.applicationCode
            ? `Nộp hồ sơ thành công! Mã hồ sơ: ${result.applicationCode}`
            : "Nộp hồ sơ thành công!",
        );
        formElement.reset();
        // Scroll success panel into view
        setTimeout(() => {
          successPanelRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Nộp hồ sơ thất bại. Vui lòng thử lại sau.";
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedProcedureId],
  );

  return (
    <div className="space-y-5">
      {isSubmitted && (
        <div
          ref={successPanelRef}
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 scroll-m-4"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900 mb-3">
            <CheckCircle2 className="size-5" />
            Nộp hồ sơ thành công!
          </div>
          {submittedCode?.trim() ? (
            <>
              <p className="text-xs text-emerald-800 mb-3">
                <strong>Mã hồ sơ của bạn:</strong> Vui lòng lưu lại để tra cứu
                tình trạng xử lý sau này.
              </p>
              <div className="flex items-center gap-2 rounded-md bg-white p-4 border-2 border-emerald-300 mb-3">
                <code className="flex-1 text-base font-mono font-bold text-emerald-900 tracking-widest">
                  {submittedCode}
                </code>
                <Button
                  type="button"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                  onClick={() => handleCopyCode(submittedCode)}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
              <p className="text-xs text-emerald-700">
                💡 Nhấn nút above để sao chép mã hồ sơ hoặc bạn có thể{" "}
                <a
                  href="#"
                  className="font-semibold underline hover:no-underline"
                >
                  tra cứu trạng thái
                </a>
              </p>
            </>
          ) : (
            <p className="text-xs text-emerald-800 mb-3">
              ✓ Hồ sơ của bạn đã được tiếp nhận. Vui lòng liên hệ với cơ quan để
              biết thêm chi tiết hoặc theo dõi tình trạng xử lý.
            </p>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="mt-4 text-emerald-700 hover:bg-emerald-100"
            onClick={() => {
              setIsSubmitted(false);
              setSubmittedCode("");
            }}
          >
            ← Nộp hồ sơ khác
          </Button>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Trường có dấu * là bắt buộc. Vui lòng đính kèm đúng tệp hồ sơ để hệ
          thống tiếp nhận.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="font-medium text-slate-700">
              Họ và tên *
            </Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Nguyễn Văn A"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="font-medium text-slate-700">
              Ngày tháng năm sinh
            </Label>
            <Input id="birthDate" name="birthDate" type="date" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cccd" className="font-medium text-slate-700">
              CCCD/CMND *
            </Label>
            <Input id="cccd" name="cccd" placeholder="012345678901" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address" className="font-medium text-slate-700">
              Địa chỉ *
            </Label>
            <Input
              id="address"
              name="address"
              placeholder="Số nhà, đường, phường..."
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="attachments" className="font-medium text-slate-700">
            Tệp hồ sơ đính kèm *
          </Label>
          <Input id="attachments" name="attachments" type="file" required />
          <p className="text-xs text-muted-foreground">
            Chỉ cần chọn 1 file theo đúng yêu cầu của thủ tục.
          </p>
        </div>

        <Button
          type="submit"
          disabled={!selectedProcedureId || isSubmitting}
          className="w-full bg-[#0f5fc6] text-white hover:bg-[#0c4ea2] md:w-auto"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Send className="mr-2 size-4" />
          )}
          Nộp hồ sơ
        </Button>
      </form>
    </div>
  );
}
