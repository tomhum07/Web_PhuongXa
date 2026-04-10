export interface Category {
  categoryId: number;
  parentId?: number;
  name: string;
  slug: string;
}

export interface Article {
  articleId: number;
  categoryId: number;
  categoryName?: string;
  authorId: number;
  authorName?: string;
  approverId?: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  thumbnailUrl?: string;
  viewCount?: number;
  status?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArticleRequest {
  categoryId: number;
  authorId: number;
  title: string;
  summary?: string;
  content: string;
  thumbnailUrl?: string;
  status?: string;
}
