"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type NewsCategorySelectProps = {
  categories: Array<{
    categoryId: number;
    name: string;
  }>;
  selectedValue: string;
};

export function NewsCategorySelect({
  categories,
  selectedValue,
}: NewsCategorySelectProps) {
  const router = useRouter();

  const handleValueChange = React.useCallback(
    (value: string) => {
      if (value === "all") {
        router.push("/tin-tuc");
        return;
      }

      router.push(`/tin-tuc?category=${value}`);
    },
    [router],
  );

  return (
    <div className="w-full max-w-xs">
      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Chọn danh mục" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả danh mục</SelectItem>
          {categories.map((item) => (
            <SelectItem key={item.categoryId} value={String(item.categoryId)}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
