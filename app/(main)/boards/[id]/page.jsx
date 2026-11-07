import { notFound } from "next/navigation";
import { isArticleId } from "@/app/_utils/article";
import ArticleDetail from "./ArticleDetail";

export const metadata = { title: "게시글 상세 | 판다마켓" };

export default async function ArticlePage({ params }) {
  const { id } = await params;
  if (!isArticleId(id)) notFound();
  return <ArticleDetail articleId={id} />;
}
