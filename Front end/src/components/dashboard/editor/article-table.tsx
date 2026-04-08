"use client";

import { Article } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit2Icon, Trash2Icon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ArticleTableProps {
  articles: Article[];
}

export function ArticleTable({ articles }: ArticleTableProps) {
  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "published":
        return "bg-green-100 text-green-800";
      case "pendingapproval":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "published":
        return "Xuất bản";
      case "pendingapproval":
        return "Chờ duyệt";
      case "draft":
        return "Nháp";
      case "rejected":
        return "Từ chối";
      default:
        return status || "Nháp";
    }
  };

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Tác giả</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Lượt xem</TableHead>
            <TableHead>Ngày tạo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                Không có bài viết nào
              </TableCell>
            </TableRow>
          ) : (
            articles.map((article) => (
              <TableRow key={article.articleId}>
                <TableCell className="font-medium">
                  {article.articleId}
                </TableCell>
                <TableCell>{truncateText(article.title, 40)}</TableCell>
                <TableCell>
                  {article.categoryName || `ID: ${article.categoryId}`}
                </TableCell>
                <TableCell>
                  {article.authorName || `ID: ${article.authorId}`}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                      article.status,
                    )}`}
                  >
                    {getStatusLabel(article.status)}
                  </span>
                </TableCell>
                <TableCell>{article.viewCount || 0}</TableCell>
                <TableCell>
                  {article.createdAt
                    ? new Date(article.createdAt).toLocaleDateString("vi-VN")
                    : "-"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
