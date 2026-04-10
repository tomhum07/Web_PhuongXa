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
import { getDocumentViewerUrl } from "@/lib/utils/document-viewer";

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
      <span className="font-semibold text-slate-900">
        {row.original.procedureName}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: "Mô tả",
    cell: ({ row }) => (
      <span className="line-clamp-2 text-slate-500">
        {row.original.description || "-"}
      </span>
    ),
  },
  {
    id: "viewProcedure",
    header: () => <div className="text-center">Xem</div>,
    cell: ({ row }) => {
      const url = row.original.procedureFileUrl;

      if (!url) {
        return <div className="text-center text-slate-400">-</div>;
      }

      return (
        <div className="flex justify-center">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="hover:bg-blue-600 hover:text-white transition-all"
          >
            <a href={getDocumentViewerUrl(url)} target="_blank">
              <Eye className="mr-1 h-4 w-4" />
              Xem
            </a>
          </Button>
        </div>
      );
    },
  },
  {
    id: "downloadTemplate",
    header: () => <div className="text-center">Tải</div>,
    cell: ({ row }) => {
      const url = row.original.templateFileUrl;

      if (!url) {
        return <div className="text-center text-slate-400">-</div>;
      }

      return (
        <div className="flex justify-center">
          <Button
            asChild
            size="sm"
            className="bg-blue-600 text-white hover:bg-blue-700 transition-all"
          >
            <a href={url} target="_blank" download>
              <Download className="mr-1 h-4 w-4" />
              Tải
            </a>
          </Button>
        </div>
      );
    },
  },
];

export function ProcedureDataTable({ data }: ProcedureDataTableProps) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Table>
        {/* HEADER */}
        <TableHeader className="sticky top-0 z-10 bg-slate-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
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

        {/* BODY */}
        <TableBody>
          {table.getRowModel().rows.map((row, index) => (
            <TableRow
              key={row.id}
              className={`
                transition
                ${index % 2 === 0 ? "bg-white" : "bg-slate-50"}
                hover:bg-blue-50
              `}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="text-sm text-slate-700 py-3"
                >
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
