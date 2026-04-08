import { getArticleById, getPublicArticles } from "@/lib/api/article";
import { Article } from "@/types";
import { Separator } from "@/components/ui/separator";
import { ArticleComments } from "@/components/article-comments";

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const articles = (await getPublicArticles()) as Article[];
    return articles.map((article) => ({ id: String(article.articleId) }));
  } catch {
    return [];
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
