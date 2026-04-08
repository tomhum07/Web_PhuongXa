"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

import { toast } from "sonner";
import { z } from "zod";
import {
  changeUserRole,
  getRoles,
  getUsers,
  lockUser,
  unlockUser,
} from "@/lib/api/user";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GripVerticalIcon,
  EllipsisVerticalIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  LockKeyhole,
  LockKeyholeOpen,
  Loader2,
} from "lucide-react";

type UserTableMeta = {
  onToggleStatus?: (item: z.infer<typeof schema>) => Promise<void>;
  onEditUser?: (item: z.infer<typeof schema>) => void;
  pendingStatusIds?: Set<number>;
};

export const schema = z.object({
  id: z.number(),
  fullname: z.string(),
  role: z.string(),
  roleId: z.number().optional(),
  status: z.string(),
  isActive: z.boolean().optional(),
  email: z.string(),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "fullname",
    header: "Họ và tên",
    cell: ({ row }) => {
      return (
        <label htmlFor={`${row.original.id}-fullname`}>
          {row.original.fullname}
        </label>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "role",
    header: "Vai trò",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.role}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={`px-1.5 ${row.original.status === "Hoạt động" ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}
      >
        {row.original.status === "Hoạt động" ? (
          <LockKeyholeOpen className="text-green-500" />
        ) : (
          <LockKeyhole className="text-red-500" />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "email",
    header: () => <div className="w-full text-left">Email</div>,
    cell: ({ row }) => (
      <Label htmlFor={`${row.original.id}-email`} className="">
        {row.original.email}
      </Label>
    ),
  },
  {
    id: "statusButton",
    cell: ({ row, table }) => {
      const meta = table.options.meta as UserTableMeta | undefined;
      const onToggleStatus = meta?.onToggleStatus;
      const isPending = meta?.pendingStatusIds?.has(row.original.id);

      return (
        <Button
          variant="outline"
          size="icon"
          disabled={!onToggleStatus || Boolean(isPending)}
          onClick={() => {
            if (onToggleStatus) {
              void onToggleStatus(row.original);
            }
          }}
        >
          {isPending ? (
            <Loader2 className="animate-spin" />
          ) : row.original.status === "Hoạt động" ? (
            <LockKeyholeOpen className="text-green-500" />
          ) : (
            <LockKeyhole className="text-red-500" />
          )}
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const meta = table.options.meta as UserTableMeta | undefined;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
              size="icon"
            >
              <EllipsisVerticalIcon />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onSelect={() => {
                meta?.onEditUser?.(row.original);
              }}
            >
              Sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Xoá</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function UserTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[];
}) {
  const [data, setData] = React.useState(() => initialData);
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "active" | "locked"
  >("all");
  const [selectedRoleId, setSelectedRoleId] = React.useState("all");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [roles, setRoles] = React.useState<Array<{ id: number; name: string }>>(
    [
      { id: 1, name: "Admin" },
      { id: 2, name: "Editor" },
      { id: 3, name: "Viewer" },
    ],
  );
  const [pendingStatusIds, setPendingStatusIds] = React.useState<Set<number>>(
    () => new Set(),
  );
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<z.infer<
    typeof schema
  > | null>(null);
  const [editFormRole, setEditFormRole] = React.useState<string>("1");
  const [editFormStatus, setEditFormStatus] = React.useState<
    "Hoạt động" | "Đang khoá"
  >("Hoạt động");
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const handleToggleStatus = React.useCallback(
    async (item: z.infer<typeof schema>) => {
      if (pendingStatusIds.has(item.id)) {
        return;
      }

      setPendingStatusIds((prev) => new Set(prev).add(item.id));

      try {
        const isActive = item.status === "Hoạt động";

        if (isActive) {
          await lockUser(item.id);
        } else {
          await unlockUser(item.id);
        }

        setData((prev) =>
          prev.map((row) =>
            row.id === item.id
              ? {
                  ...row,
                  status: isActive ? "Đang khoá" : "Hoạt động",
                  isActive: !isActive,
                }
              : row,
          ),
        );
        toast.success(
          isActive
            ? "Đã khoá tài khoản thành công."
            : "Đã mở khoá tài khoản thành công.",
        );
      } catch (error) {
        console.error("Cannot update user status", error);
        toast.error("Không thể cập nhật trạng thái tài khoản.");
      } finally {
        setPendingStatusIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }
    },
    [pendingStatusIds],
  );

  const openEditForm = React.useCallback(
    (item: z.infer<typeof schema>) => {
      const fallbackRoleId =
        roles.find(
          (role) => role.name.toLowerCase() === item.role.toLowerCase(),
        )?.id ?? 3;
      const roleIdFromDb = item.roleId ?? fallbackRoleId;
      const isActiveFromDb = item.isActive ?? item.status === "Hoạt động";

      setEditingUser(item);
      setEditFormRole(String(roleIdFromDb));
      setEditFormStatus(isActiveFromDb ? "Hoạt động" : "Đang khoá");
      setIsEditOpen(true);
    },
    [roles],
  );

  const handleSaveEditUser = React.useCallback(async () => {
    if (!editingUser) {
      return;
    }

    if (isSavingEdit) {
      return;
    }

    setIsSavingEdit(true);

    try {
      const fallbackCurrentRoleId =
        roles.find(
          (role) => role.name.toLowerCase() === editingUser.role.toLowerCase(),
        )?.id ?? 3;
      const currentRoleId = editingUser.roleId ?? fallbackCurrentRoleId;
      const nextRoleId = Number(editFormRole);
      const currentIsActive =
        editingUser.isActive ?? editingUser.status === "Hoạt động";
      const nextIsActive = editFormStatus === "Hoạt động";

      if (currentRoleId !== nextRoleId) {
        await changeUserRole(editingUser.id, nextRoleId);
      }

      if (currentIsActive !== nextIsActive) {
        if (nextIsActive) {
          await unlockUser(editingUser.id);
        } else {
          await lockUser(editingUser.id);
        }
      }

      const nextRoleName =
        roles.find((role) => role.id === nextRoleId)?.name ??
        `Role ${nextRoleId}`;

      setData((prev) =>
        prev.map((row) =>
          row.id === editingUser.id
            ? {
                ...row,
                role: nextRoleName,
                roleId: nextRoleId,
                status: nextIsActive ? "Hoạt động" : "Đang khoá",
                isActive: nextIsActive,
              }
            : row,
        ),
      );

      toast.success("Đã cập nhật tài khoản thành công.");
      setIsEditOpen(false);
    } catch (error) {
      console.error("Cannot update user", error);
      toast.error("Không thể cập nhật tài khoản.");
    } finally {
      setIsSavingEdit(false);
    }
  }, [editFormRole, editFormStatus, editingUser, isSavingEdit, roles]);

  React.useEffect(() => {
    const controller = new AbortController();

    const loadUsers = async () => {
      try {
        const users = await getUsers({ signal: controller.signal });

        const toRoleName = (roleId: number) => {
          if (roleId === 1) return "Admin";
          if (roleId === 2) return "Editor";
          if (roleId === 3) return "Viewer";
          return `Role ${roleId}`;
        };

        const mappedUsers: z.infer<typeof schema>[] = users.map((user) => {
          const resolvedIsActive = user.isActive ?? user.status === 1;

          return {
            id: user.userId,
            fullname: user.fullName || user.username || `User #${user.userId}`,
            role: user.roleName || toRoleName(user.roleId),
            roleId: user.roleId,
            status: resolvedIsActive ? "Hoạt động" : "Đang khoá",
            isActive: resolvedIsActive,
            email: user.email || "-",
          };
        });

        setData(mappedUsers);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Cannot fetch users", error);
        toast.error("Không tải được danh sách người dùng từ API.");
      }
    };

    loadUsers();

    return () => {
      controller.abort();
    };
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();

    const loadRoles = async () => {
      try {
        const roleList = await getRoles(controller.signal);
        setRoles(
          roleList.map((role) => ({ id: role.roleId, name: role.roleName })),
        );
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Cannot fetch roles", error);
      }
    };

    loadRoles();

    return () => {
      controller.abort();
    };
  }, []);

  const visibleData = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return data.filter((user) => {
      const matchesRole =
        selectedRoleId === "all" ||
        String(user.roleId ?? "") === selectedRoleId;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.status === "Hoạt động") ||
        (statusFilter === "locked" && user.status === "Đang khoá");

      const matchesSearch =
        normalizedSearch.length === 0 ||
        user.fullname.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.role.toLowerCase().includes(normalizedSearch);

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [data, searchTerm, selectedRoleId, statusFilter]);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data],
  );

  const table = useReactTable({
    data: visibleData,
    columns,
    meta: {
      onToggleStatus: handleToggleStatus,
      onEditUser: openEditForm,
      pendingStatusIds,
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  const renderTable = () => (
    <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
      <div className="overflow-hidden rounded-lg border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id={sortableId}
        >
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row} />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Không có dữ liệu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} của{" "}
          {table.getFilteredRowModel().rows.length} dòng được chọn.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Số dòng trên mỗi trang
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Trang {table.getState().pagination.pageIndex + 1} của{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Tabs
        value={statusFilter}
        onValueChange={(value) =>
          setStatusFilter(value as "all" | "active" | "locked")
        }
        className="w-full flex-col justify-start gap-6"
      >
        <div className="flex items-center justify-between px-4 lg:px-6">
          <h2 className="text-2xl font-semibold">Danh sách tài khoản</h2>
        </div>
        <div className="flex items-center justify-between px-4 lg:px-6">
          <TabsList className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
            <TabsTrigger value="locked">Đang bị khoá</TabsTrigger>
          </TabsList>
        </div>
        <div className="flex items-center gap-2 px-4 lg:px-6">
          <Label htmlFor="role-filter" className="text-sm font-medium">
            Lọc:
          </Label>
          <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
            <SelectTrigger id="role-filter" className="w-44">
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Label htmlFor="search" className="text-sm font-medium">
            Tìm kiếm:
          </Label>
          <Input
            id="search"
            placeholder="Nhập từ khóa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-150"
          />
        </div>
        <TabsContent value="all">{renderTable()}</TabsContent>
        <TabsContent value="active">{renderTable()}</TabsContent>
        <TabsContent value="locked">{renderTable()}</TabsContent>
      </Tabs>

      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Cập nhật tài khoản</SheetTitle>
            <SheetDescription>
              Chỉnh sửa vai trò và trạng thái cho tài khoản đã chọn.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="edit-user-fullname">Họ và tên</Label>
              <Input
                id="edit-user-fullname"
                value={editingUser?.fullname ?? ""}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-user-email">Email</Label>
              <Input
                id="edit-user-email"
                value={editingUser?.email ?? ""}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-user-role">Vai trò</Label>
              <Select value={editFormRole} onValueChange={setEditFormRole}>
                <SelectTrigger id="edit-user-role">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-user-status">Trạng thái</Label>
              <Select
                value={editFormStatus}
                onValueChange={(value: "Hoạt động" | "Đang khoá") =>
                  setEditFormStatus(value)
                }
              >
                <SelectTrigger id="edit-user-status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Hoạt động">Hoạt động</SelectItem>
                    <SelectItem value="Đang khoá">Đang khoá</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isSavingEdit}
            >
              Huỷ
            </Button>
            <Button
              onClick={() => void handleSaveEditUser()}
              disabled={isSavingEdit}
            >
              {isSavingEdit ? <Loader2 className="animate-spin" /> : null}
              Lưu thay đổi
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
