"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createArticle, updateArticle } from "@/app/_api/articleApi";
import styles from "./ArticleForm.module.scss";

export default function ArticleForm({ article = null }) {
  const router = useRouter();
  const isEditing = article !== null;
  const [title, setTitle] = useState(article?.title ?? "");
  const [content, setContent] = useState(article?.content ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const isValid = Boolean(title.trim() && content.trim());

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isValid || submitting.current) return;
    submitting.current = true;
    setIsSubmitting(true);
    setError("");

    try {
      const data = { title: title.trim(), content: content.trim() };
      const saved = isEditing ? await updateArticle(article.id, data) : await createArticle(data);
      router.push(`/boards/${saved.id}`);
    } catch (requestError) {
      setError(requestError.message);
      setIsSubmitting(false);
      submitting.current = false;
    }
  }

  return (
    <main className={styles.main}>
      <form onSubmit={handleSubmit} aria-busy={isSubmitting}>
        <div className={styles.header}>
          <h1>{isEditing ? "게시글 수정" : "게시글 쓰기"}</h1>
          <button className={styles.submit} type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "저장 중..." : isEditing ? "수정" : "등록"}
          </button>
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <div className={styles.fields}>
          <div className={styles.field}>
            <label htmlFor="article-title"><span aria-hidden="true">*</span>제목</label>
            <input id="article-title" name="title" required placeholder="제목을 입력해주세요" value={title}
              onChange={(event) => setTitle(event.target.value)} disabled={isSubmitting} />
          </div>
          <div className={styles.field}>
            <label htmlFor="article-content"><span aria-hidden="true">*</span>내용</label>
            <textarea id="article-content" name="content" required placeholder="내용을 입력해주세요" value={content}
              onChange={(event) => setContent(event.target.value)} disabled={isSubmitting} />
          </div>
        </div>
      </form>
    </main>
  );
}
