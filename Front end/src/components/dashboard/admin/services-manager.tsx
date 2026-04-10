"use client";

import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { Plus, Search, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  fetchAdminFields,
  createAdminField,
  updateAdminField,
  hideAdminField,
  showAdminField,
  fetchAdminProcedures,
  createAdminProcedure,
  updateAdminProcedure,
  hideAdminProcedure,
  showAdminProcedure,
} from "@/lib/api/admin-applications";

// Lĩnh Vực
type AdminField = {
  serviceCategoryId?: number;
  categoryCode: string;
  name: string;
  description?: string;
  status?: number;
  childCount?: number;
};

type AdminFieldResponse = {
  serviceCategoryId?: number;
  categoryCode?: string;
  name?: string;
  fieldName?: string;
  description?: string;
  status?: number;
  procedureCount?: number;
  childCount?: number;
};

// Thủ Tục
type AdminProcedure = {
  serviceId?: number;
  serviceCategoryId: number;
  serviceCode: string;
  name: string;
  description?: string;
  procedureFileUrl?: string;
  templateFileUrl?: string;
  procedureFile?: File | null;
  templateFile?: File | null;
  status?: number;
};

export default function QuanLyThuTuc() {
  const [activeTab, setActiveTab] = useState("fields");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // States for Fields (Lĩnh vực)
  const [fields, setFields] = useState<AdminField[]>([]);
  const [isFieldSheetOpen, setIsFieldSheetOpen] = useState(false);
  const [currentField, setCurrentField] = useState<Partial<AdminField>>({});

  // States for Procedures (Thủ tục)
  const [procedures, setProcedures] = useState<AdminProcedure[]>([]);
  const [isProcedureSheetOpen, setIsProcedureSheetOpen] = useState(false);
  const [currentProcedure, setCurrentProcedure] = useState<
    Partial<AdminProcedure>
  >({});

  const toArray = <T,>(res: unknown): T[] => {
    if (Array.isArray(res)) return res as T[];
    if (res && typeof res === "object") {
      const record = res as Record<string, unknown>;
      if (Array.isArray(record.value)) {
        return record.value as T[];
      }
    }
    return [];
  };

  const normalizeField = useCallback((item: AdminFieldResponse): AdminField => {
    const serviceCategoryId =
      typeof item.serviceCategoryId === "number"
        ? item.serviceCategoryId
        : undefined;

    return {
      serviceCategoryId,
      categoryCode: item.categoryCode ?? "",
      name: item.name ?? item.fieldName ?? "",
      description: item.description,
      status: typeof item.status === "number" ? item.status : 1,
      childCount:
        typeof item.childCount === "number"
          ? item.childCount
          : (item.procedureCount ?? 0),
    };
  }, []);

  const normalizeFields = useCallback(
    (res: unknown): AdminField[] =>
      toArray<AdminFieldResponse>(res)
        .map(normalizeField)
        .filter(
          (item) =>
            typeof item.serviceCategoryId === "number" &&
            item.name.trim().length > 0,
        ),
    [normalizeField],
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === "fields") {
        const res = await fetchAdminFields();
        setFields(normalizeFields(res));
      } else {
        const res = await fetchAdminProcedures();
        setProcedures(toArray<AdminProcedure>(res));

        if (fields.length === 0) {
          const catRes = await fetchAdminFields();
          setFields(normalizeFields(catRes));
        }
      }
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, fields.length, normalizeFields]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // -- Fields (Lĩnh vực) Handlers --
  const handleSaveField = async () => {
    if (!currentField.name || !currentField.categoryCode)
      return toast.error("Vui lòng nhập tên và mã lĩnh vực");

    try {
      if (currentField.serviceCategoryId) {
        await updateAdminField(currentField.serviceCategoryId, {
          name: currentField.name,
          categoryCode: currentField.categoryCode,
          description: currentField.description,
        });
        toast.success("Cập nhật lĩnh vực thành công!");
        void loadData();
      } else {
        const result = (await createAdminField({
          name: currentField.name,
          categoryCode: currentField.categoryCode,
          description: currentField.description,
        })) as { Field?: AdminFieldResponse; field?: AdminFieldResponse };

        const createdFieldRaw = result?.Field ?? result?.field;
        const createdField = createdFieldRaw
          ? normalizeField(createdFieldRaw)
          : {
              serviceCategoryId: undefined,
              categoryCode: currentField.categoryCode,
              name: currentField.name,
              description: currentField.description,
              status: 1,
              childCount: 0,
            };

        setFields((prev) => {
          if (createdField.serviceCategoryId == null) {
            return prev;
          }

          const existedIndex = prev.findIndex(
            (item) => item.serviceCategoryId === createdField.serviceCategoryId,
          );

          if (existedIndex >= 0) {
            const next = [...prev];
            next[existedIndex] = { ...next[existedIndex], ...createdField };
            return next;
          }

          return [...prev, createdField];
        });

        toast.success("Thêm lĩnh vực thành công!");
      }
      setIsFieldSheetOpen(false);
    } catch {
      toast.error("Lỗi lưu lĩnh vực");
    }
  };

  const handleToggleFieldStatus = async (field: AdminField) => {
    if (!field.serviceCategoryId) return;
    try {
      if (field.status === 1) {
        await hideAdminField(field.serviceCategoryId);
      } else {
        await showAdminField(field.serviceCategoryId);
      }
      toast.success("Đã cập nhật trạng thái");
      void loadData();
    } catch {
      toast.error("Lỗi chuyển trạng thái!");
    }
  };

  // -- Procedures (Thủ tục) Handlers --
  const handleFileUpload = (
    e: ChangeEvent<HTMLInputElement>,
    field: "procedureFile" | "templateFile",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isPdf = lowerName.endsWith(".pdf") || file.type === "application/pdf";
    const isDoc =
      lowerName.endsWith(".doc") || file.type === "application/msword";
    const isDocx =
      lowerName.endsWith(".docx") ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const isAllowedFile = isPdf || isDoc || isDocx;

    if (!isAllowedFile) {
      const fieldLabel = field === "procedureFile" ? "thủ tục" : "biểu mẫu";
      toast.error(
        `File ${fieldLabel} chỉ được phép định dạng PDF, DOC hoặc DOCX`,
      );
      e.target.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File không được vượt quá 20MB");
      e.target.value = "";
      return;
    }

    setCurrentProcedure((prev) => ({ ...prev, [field]: file }));
    toast.success(`Đã chọn file: ${file.name}`);
  };

  const handleSaveProcedure = async () => {
    if (
      !currentProcedure.name ||
      !currentProcedure.serviceCode ||
      !currentProcedure.serviceCategoryId
    ) {
      return toast.error("Vui lòng nhập đủ các trường bắt buộc");
    }

    try {
      const formData = new FormData();
      formData.append("Name", currentProcedure.name);
      formData.append("ServiceCode", currentProcedure.serviceCode);
      formData.append(
        "ServiceCategoryId",
        String(currentProcedure.serviceCategoryId),
      );

      if (currentProcedure.description) {
        formData.append("Description", currentProcedure.description);
      }

      // Send string URLs if existing, or might be empty if we upload file instead
      if (
        currentProcedure.procedureFileUrl &&
        !currentProcedure.procedureFile
      ) {
        formData.append("ProcedureFileUrl", currentProcedure.procedureFileUrl);
      }
      if (currentProcedure.templateFileUrl && !currentProcedure.templateFile) {
        formData.append("TemplateFileUrl", currentProcedure.templateFileUrl);
      }

      if (currentProcedure.procedureFile) {
        formData.append("ProcedureFile", currentProcedure.procedureFile);
      }

      if (currentProcedure.templateFile) {
        formData.append("TemplateFile", currentProcedure.templateFile);
      }

      if (currentProcedure.serviceId) {
        formData.append("ServiceId", String(currentProcedure.serviceId));
        await updateAdminProcedure(currentProcedure.serviceId, formData);
        toast.success("Cập nhật thủ tục thành công!");
      } else {
        await createAdminProcedure(formData);
        toast.success("Thêm thủ tục thành công!");
      }
      setIsProcedureSheetOpen(false);
      loadData();
    } catch (error) {
      toast.error("Lỗi lưu thủ tục");
      console.error(error);
    }
  };

  const handleToggleProcedureStatus = async (proc: AdminProcedure) => {
    if (!proc.serviceId) return;
    try {
      if (proc.status === 1) {
        await hideAdminProcedure(proc.serviceId);
      } else {
        await showAdminProcedure(proc.serviceId);
      }
      toast.success("Đã cập nhật trạng thái thủ tục");
      loadData();
    } catch (error) {
      toast.error("Lỗi chuyển trạng thái!");
      console.error(error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý Lĩnh vực & Thủ tục
          </h1>
          <p className="text-muted-foreground mt-1">
            Thiết lập danh mục các Lĩnh vực (Fields) và cấu hình các Thủ tục
            (Services) cho cổng dịch vụ công.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center bg-muted/50 p-1 rounded-lg">
              <TabsList className="bg-transparent">
                <TabsTrigger
                  value="fields"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Lĩnh Vực
                </TabsTrigger>
                <TabsTrigger
                  value="procedures"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Thủ Tục (Dịch Vụ)
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2 px-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Tìm kiếm..."
                    className="w-64 pl-8 h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {activeTab === "fields" ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      setCurrentField({});
                      setIsFieldSheetOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Thêm Lĩnh vực
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setCurrentProcedure({});
                      setIsProcedureSheetOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Thêm Thủ tục
                  </Button>
                )}
              </div>
            </div>

            <TabsContent value="fields" className="mt-0">
              <div className="rounded-md border mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã Lĩnh Vực</TableHead>
                      <TableHead>Tên Lĩnh Vực</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields
                      .filter(
                        (f) =>
                          f.name
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          f.categoryCode
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                      )
                      .map((field) => (
                        <TableRow
                          key={field.serviceCategoryId ?? field.categoryCode}
                        >
                          <TableCell className="font-medium">
                            {field.categoryCode}
                          </TableCell>
                          <TableCell>{field.name}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {field.description}
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={field.status === 1}
                              onCheckedChange={() =>
                                handleToggleFieldStatus(field)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCurrentField(field);
                                setIsFieldSheetOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {fields.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Chưa có dữ liệu Lĩnh vực
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="procedures" className="mt-0">
              <div className="rounded-md border mt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã TT</TableHead>
                      <TableHead>Tên Thủ Tục</TableHead>
                      <TableHead>Lĩnh Vực</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {procedures
                      .filter(
                        (p) =>
                          p.name
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          p.serviceCode
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                      )
                      .map((proc) => (
                        <TableRow key={proc.serviceId ?? proc.serviceCode}>
                          <TableCell className="font-medium">
                            {proc.serviceCode}
                          </TableCell>
                          <TableCell>{proc.name}</TableCell>
                          <TableCell>
                            {fields.find(
                              (f) =>
                                f.serviceCategoryId === proc.serviceCategoryId,
                            )?.name || proc.serviceCategoryId}
                          </TableCell>
                          <TableCell
                            className="max-w-[200px] truncate"
                            title={proc.description}
                          >
                            {proc.description}
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={proc.status === 1}
                              onCheckedChange={() =>
                                handleToggleProcedureStatus(proc)
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCurrentProcedure(proc);
                                setIsProcedureSheetOpen(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {procedures.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Chưa có dữ liệu Thủ tục
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Field/Category Sheet */}
      <Sheet open={isFieldSheetOpen} onOpenChange={setIsFieldSheetOpen}>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>
              {currentField.serviceCategoryId
                ? "Chỉnh sửa Lĩnh vực"
                : "Thêm mới Lĩnh vực"}
            </SheetTitle>
            <SheetDescription>
              Khai báo Lĩnh vực để nhóm các loại thủ tục, hình thức cho dịch vụ
              công.
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-2">
              <Label>
                Mã Lĩnh vực <span className="text-red-500">*</span>
              </Label>
              <Input
                value={currentField.categoryCode || ""}
                onChange={(e) =>
                  setCurrentField({
                    ...currentField,
                    categoryCode: e.target.value,
                  })
                }
                placeholder="VD: LV_TUPHAP"
                disabled={!!currentField.serviceCategoryId} // Code should typically not be changed once set, based on standard design
              />
            </div>
            <div className="grid gap-2">
              <Label>
                Tên Lĩnh vực <span className="text-red-500">*</span>
              </Label>
              <Input
                value={currentField.name || ""}
                onChange={(e) =>
                  setCurrentField({ ...currentField, name: e.target.value })
                }
                placeholder="Nhập tên Lĩnh vực..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Mô tả ngắn</Label>
              <Input
                value={currentField.description || ""}
                onChange={(e) =>
                  setCurrentField({
                    ...currentField,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4"></div>
          <SheetFooter>
            <Button onClick={handleSaveField}>Lưu Lĩnh vực</Button>
            <SheetClose asChild>
              <Button variant="outline">Huỷ</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Procedure/Service Sheet */}
      <Sheet open={isProcedureSheetOpen} onOpenChange={setIsProcedureSheetOpen}>
        <SheetContent className=" overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {currentProcedure.serviceId
                ? "Chỉnh sửa Thủ tục"
                : "Thêm Thủ tục mới"}
            </SheetTitle>
            <SheetDescription>
              Khai báo mã thủ tục và tên của Thủ tục phục vụ Đăng ký.
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Label>
                Lĩnh vực <span className="text-red-500">*</span>
              </Label>
              <Select
                value={
                  currentProcedure.serviceCategoryId
                    ? String(currentProcedure.serviceCategoryId)
                    : ""
                }
                onValueChange={(val) => {
                  const id = Number(val);
                  if (!Number.isNaN(id)) {
                    setCurrentProcedure({
                      ...currentProcedure,
                      serviceCategoryId: id,
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn Lĩnh vực cha" />
                </SelectTrigger>
                <SelectContent>
                  {fields
                    .filter((f) => f.serviceCategoryId != null)
                    .map((f) => (
                      <SelectItem
                        key={f.serviceCategoryId}
                        value={String(f.serviceCategoryId)}
                      >
                        {f.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>
                Mã Thủ tục <span className="text-red-500">*</span>
              </Label>
              <Input
                value={currentProcedure.serviceCode || ""}
                onChange={(e) =>
                  setCurrentProcedure({
                    ...currentProcedure,
                    serviceCode: e.target.value,
                  })
                }
                placeholder="VD: TT_KH_01"
              />
            </div>
            <div className="grid gap-2">
              <Label>
                Tên Thủ tục <span className="text-red-500">*</span>
              </Label>
              <Input
                value={currentProcedure.name || ""}
                onChange={(e) =>
                  setCurrentProcedure({
                    ...currentProcedure,
                    name: e.target.value,
                  })
                }
                placeholder="Nhập tên thủ tục..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Mô tả ngắn</Label>
              <Input
                value={currentProcedure.description || ""}
                onChange={(e) =>
                  setCurrentProcedure({
                    ...currentProcedure,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Tải file Thủ tục (định dạng .PDF / .DOC / .DOCX)</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => handleFileUpload(e, "procedureFile")}
                  className="w-1/3 cursor-pointer"
                />
                <Input
                  value={
                    currentProcedure.procedureFile?.name ||
                    currentProcedure.procedureFileUrl ||
                    ""
                  }
                  onChange={(e) =>
                    setCurrentProcedure({
                      ...currentProcedure,
                      procedureFileUrl: e.target.value,
                    })
                  }
                  disabled
                  readOnly
                  className="flex-1"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Tải file Biểu mẫu (định dạng .DOC / .DOCX)</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => handleFileUpload(e, "templateFile")}
                  className="w-1/3 cursor-pointer"
                  title="Chọn file biểu mẫu"
                />
                <Input
                  value={
                    currentProcedure.templateFile?.name ||
                    currentProcedure.templateFileUrl ||
                    ""
                  }
                  onChange={(e) =>
                    setCurrentProcedure({
                      ...currentProcedure,
                      templateFileUrl: e.target.value,
                    })
                  }
                  disabled
                  readOnly
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <SheetFooter>
            <Button onClick={handleSaveProcedure}>Lưu Thủ tục</Button>
            <SheetClose asChild>
              <Button variant="outline">Huỷ</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
