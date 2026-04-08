"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Download, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ProcedureByField } from "@/lib/api/procedure";

type ProcedureDataTableProps = {
  data: ProcedureByField[];
};

const columns: ColumnDef<ProcedureByField>[] = [
  {
    id: "index",
    header: "STT",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "serviceCode",
    header: "Mã thủ tục",
    cell: ({ row }) => row.original.serviceCode || "-",
  },
  {
    accessorKey: "procedureName",
    header: "Tên thủ tục",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.procedureName}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => (
      <span className="line-clamp-2 text-muted-foreground">
        {row.original.description || "-"}
      </span>
    ),
  },
  {
    id: "viewProcedure",
    header: () => <div className="text-center">Xem thủ tục</div>,
    cell: ({ row }) => {
      const url = row.original.procedureFileUrl;

      if (!url) {
        return <div className="text-center text-muted-foreground">-</div>;
      }

      return (
        <div className="text-center">
          <Button asChild size="sm" variant="outline">
            <a href={url} target="_blank" rel="noreferrer">
              <Eye className="mr-2 h-4 w-4" />
              Xem
            </a>
          </Button>
        </div>
      );
    },
  },
  {
    id: "downloadTemplate",
    header: () => <div className="text-center">Tải biểu mẫu</div>,
    cell: ({ row }) => {
      const url = row.original.templateFileUrl;

      if (!url) {
        return <div className="text-center text-muted-foreground">-</div>;
      }

      return (
        <div className="text-center">
          <Button asChild size="sm">
            <a href={url} target="_blank" rel="noreferrer" download>
              <Download className="mr-2 h-4 w-4" />
              Tải
            </a>
          </Button>
        </div>
      );
    },
  },
];

export function ProcedureDataTable({ data }: ProcedureDataTableProps) {
  "use no memo";

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
