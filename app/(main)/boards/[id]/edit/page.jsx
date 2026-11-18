import { notFound } from "next/navigation";
import { isArticleId } from "@/app/_utils/article";
import EditArticlePage from "./EditArticlePage";

export const metadata = { title: "게시글 수정 | 판다마켓" };

export default async function EditPage({ params }) {
  const { id } = await params;
  if (!isArticleId(id)) notFound();
  return <EditArticlePage articleId={id} />;
}
