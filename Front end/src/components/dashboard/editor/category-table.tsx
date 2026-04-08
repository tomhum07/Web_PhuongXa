"use client";

import { Category } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CategoryTableProps {
  categories: Category[];
}

export function CategoryTable({ categories }: CategoryTableProps) {
  return (
    <div className="rounded-lg border bg-white">
      <div className="border-b px-6 py-4">
        <h3 className="text-lg font-semibold">Danh mục</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Tên danh mục</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Danh mục cha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.categoryId}>
              <TableCell className="font-medium">
                {category.categoryId}
              </TableCell>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.slug}</TableCell>
              <TableCell>{category.parentId || "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
