'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Article {
  articleId: number;
  title: string;
  slug: string;
  summary: string;
  thumbnailUrl: string | null;
  viewCount: number;
  status: string;
  createdAt: string;
  categoryName: string;
  authorName: string;
}

export default function TinTuc() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5265/api/Article');
        if (!response.ok) {
          throw new Error('Không thể tải bài viết');
        }
        const data = await response.json();
        setArticles(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Tin tức</h1>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          <p className="font-semibold">Lỗi:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Tin tức</h1>
        <p className="text-gray-600">Cập nhật thông tin mới nhất</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <Skeleton className="w-full h-48" />
              <CardHeader>
                <Skeleton className="w-3/4 h-6" />
                <Skeleton className="w-1/2 h-4 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-full h-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">Không có bài viết nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link key={article.articleId} href={`/tin-tuc/${article.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                {article.thumbnailUrl && (
                  <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
                    <Image
                      src={article.thumbnailUrl}
                      alt={article.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="flex items-center justify-between text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {article.categoryName}
                    </span>
                    <span className="text-gray-500">
                      👁 {article.viewCount}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 line-clamp-3 mb-4">
                    {article.summary || 'Không có tóm tắt'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{article.authorName}</span>
                    <span>
                      {new Date(article.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
