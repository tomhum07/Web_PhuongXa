import type { Metadata } from "next";
import { getArticleById, getPublicArticles } from "@/lib/api/article";
import { Article } from "@/types";
import { Separator } from "@/components/ui/separator";
import { ArticleComments } from "@/components/article-comments";
import { generatePageMetadata } from "@/lib/seo";

// ISR - Revalidate every 10 minutes (600 seconds) for article detail pages
// Articles are updated periodically so we revalidate more frequently
export const revalidate = 600;

// For dynamic routes not in generateStaticParams, automatically show 404
// Set to true if you want to generate new pages on-demand (slower)
export const dynamicParams = false;

// Pre-generate static pages for articles
export async function generateStaticParams() {
  try {
    const articles = (await getPublicArticles()) as Article[];
    return articles.map((article) => ({ id: String(article.articleId) }));
  } catch {
    return [];
  }
}

// Generate metadata dynamically for each article
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;
    const articleId = Number(id);

    if (Number.isNaN(articleId)) {
      return generatePageMetadata({
        title: "Bài viết không tìm thấy | Phường Cao Lãnh",
        description: "Bài viết này không tồn tại.",
        url: `/tin-tuc/${id}`,
      });
    }

    const article = (await getArticleById(articleId)) as Article | null;

    if (!article) {
      return generatePageMetadata({
        title: "Bài viết không tìm thấy | Phường Cao Lãnh",
        description: "Bài viết này không tồn tại.",
        url: `/tin-tuc/${id}`,
      });
    }

    return generatePageMetadata({
      title: `${article.title} | Phường Cao Lãnh`,
      description:
        article.summary ||
        article.content?.substring(0, 160) ||
        "Bài viết từ Phường Cao Lãnh",
      keywords: [article.categoryName, "Phường Cao Lãnh", "tin tức"].filter(
        Boolean,
      ) as string[],
      ogImage: article.thumbnailUrl,
      url: `/tin-tuc/${id}`,
    });
  } catch {
    return generatePageMetadata({
      title: "Lỗi | Phường Cao Lãnh",
      description: "Lỗi khi tải bài viết.",
    });
  }
}

type DetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TinTucDetailPage({ params }: DetailPageProps) {
  const { id } = await params;
  const articleId = Number(id);

  if (Number.isNaN(articleId)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-red-600">ID bài viết không hợp lệ.</p>
      </div>
    );
  }

  const article = (await getArticleById(articleId)) as Article | null;

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-muted-foreground">Không tìm thấy bài viết.</p>
      </div>
    );
  }

  return (
    <main>
      <section>
        <div id="content" className="mx-auto max-w-3xl px-4 py-6">
          <h1 className="text-3xl font-bold">{article.title}</h1>
          {article.summary ? (
            <p className="mt-3 text-muted-foreground">{article.summary}</p>
          ) : null}

          <div className="mt-6 prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: article.content || "" }} />
          </div>
        </div>
      </section>

      <Separator />
      <section>
        <div id="comments" className=" px-4 py-6  ">
          <ArticleComments
            key={articleId}
            articleId={articleId}
            initialComments={[]}
          />
        </div>
      </section>
    </main>
  );
}
