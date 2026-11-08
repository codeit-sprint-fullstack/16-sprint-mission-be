"use client";

import Link from "next/link";
import ArticleForm from "@/components/ArticleForm";
import useArticle from "@/hooks/useArticle";
import styles from "@/components/ArticleForm.module.scss";

export default function EditArticlePage({ articleId }) {
  const { article, error, isLoading } = useArticle(articleId);

  if (isLoading) return <main className={styles.main}><p role="status">게시글을 불러오는 중...</p></main>;
  if (error) return <main className={styles.main}><p role="alert">{error}</p><Link href="/boards">목록으로 돌아가기</Link></main>;

  // 조회가 끝난 뒤 폼을 생성해야 기존 제목과 내용이 useState의 초기값으로 들어갑니다.
  return <ArticleForm key={articleId} article={article} />;
}
