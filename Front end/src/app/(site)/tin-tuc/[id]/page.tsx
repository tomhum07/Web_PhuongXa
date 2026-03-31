'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';

interface Article {
  articleId: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  thumbnailUrl: string | null;
  viewCount: number;
  status: string;
  createdAt: string;
  categoryName: string;
  authorName: string;
}

export default function ArticleDetail() {
  const params = useParams();
  const slug = params.id as string;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5265/api/Article`);
        if (!response.ok) {
          throw new Error('Không thể tải bài viết');
        }
        const data = await response.json();
        const articles = Array.isArray(data) ? data : [];
        const foundArticle = articles.find((a: Article) => a.slug === slug);
        
        if (!foundArticle) {
          throw new Error('Bài viết không tìm thấy');
        }
        
        setArticle(foundArticle);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="w-full h-96 rounded-lg mb-6" />
          <Skeleton className="w-3/4 h-10 mb-4" />
          <Skeleton className="w-1/2 h-6 mb-8" />
          <Skeleton className="w-full h-20" />
          <Skeleton className="w-full h-20 mt-4" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-6">
            <p className="font-semibold">Lỗi:</p>
            <p>{error || 'Bài viết không tìm thấy'}</p>
          </div>
          <Link href="/tin-tuc" className="text-blue-600 hover:underline">
            ← Quay lại danh sách tin tức
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/tin-tuc" className="text-blue-600 hover:text-blue-800 mb-6 inline-block">
          ← Quay lại danh sách tin tức
        </Link>

        <article className="bg-white rounded-lg overflow-hidden">
          {article.thumbnailUrl && (
            <div className="relative w-full h-96 mb-6">
              <Image
                src={article.thumbnailUrl}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="px-6 py-8">
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {article.categoryName}
              </span>
              <span className="text-gray-600">Tác giả: {article.authorName}</span>
              <span className="text-gray-600">
                📅 {new Date(article.createdAt).toLocaleDateString('vi-VN')}
              </span>
              <span className="text-gray-600">👁 {article.viewCount} lượt xem</span>
            </div>

            {article.summary && (
              <div className="bg-gray-50 border-l-4 border-blue-500 p-4 mb-6 italic text-gray-700">
                {article.summary}
              </div>
            )}

            <div className="prose prose-lg max-w-none mb-8">
              {article.content ? (
                <div
                  className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              ) : (
                <p className="text-gray-600">Nội dung bài viết không khả dụng</p>
              )}
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mt-8">
              <p className="text-sm text-gray-600">
                <strong>Trạng thái:</strong> {article.status}
              </p>
            </div>
          </div>
        </article>

        <div className="mt-12">
          <Link href="/tin-tuc" className="text-blue-600 hover:text-blue-800">
            ← Xem thêm tin tức khác
          </Link>
        </div>
      </div>
    </div>
  );
}
