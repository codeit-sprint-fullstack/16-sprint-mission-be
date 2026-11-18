"use client";

import { useRef, useState } from "react";
import { createArticleComment } from "@/app/_api/articleApi";
import useArticleComments from "@/hooks/useArticleComments";
import ArticleCommentItem from "./ArticleCommentItem";
import styles from "./ArticleComments.module.scss";

export default function ArticleComments({ articleId }) {
  const comments = useArticleComments(articleId);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const canSubmit = Boolean(content.trim()) && !isSubmitting && !comments.isLoading && !comments.error;

  async function submit(event) {
    event.preventDefault();
    if (!canSubmit || submitting.current) return;
    submitting.current = true;
    setIsSubmitting(true);
    setError("");
    try {
      const created = await createArticleComment(articleId, { content: content.trim() });
      comments.addComment(created);
      setContent("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.section} aria-labelledby="comment-heading">
      <h2 className={styles.heading} id="comment-heading">댓글달기</h2>
      <form className={styles.composer} onSubmit={submit} aria-busy={isSubmitting}>
        <textarea aria-label="댓글" placeholder="댓글을 입력해주세요." value={content} required disabled={isSubmitting}
          onChange={(event) => setContent(event.target.value)} />
        {error && <p className={styles.error} role="alert">{error}</p>}
        <button className={styles.primary} type="submit" disabled={!canSubmit}>{isSubmitting ? "등록 중..." : "등록"}</button>
      </form>
      {comments.isLoading ? <p className={styles.status} role="status">댓글을 불러오는 중...</p> : comments.error ? (
        <div className={styles.status}><p role="alert">{comments.error}</p><button className={styles.more} type="button" onClick={comments.retry}>다시 시도</button></div>
      ) : (
        <>
          {comments.list.length === 0 && comments.nextCursor === null ? (
            <div className={styles.empty}>
              <span className={styles.emptyImage} aria-hidden="true">
                <img className={styles.bubbles} src="/asset/board/comment-empty-bubbles.svg" alt="" />
                <img className={styles.topDots} src="/asset/board/comment-empty-dots.svg" alt="" />
                <img className={styles.bottomDots} src="/asset/board/comment-empty-dots.svg" alt="" />
              </span>
              <p>아직 댓글이 없어요,<br />지금 댓글을 달아보세요!</p>
            </div>
          ) : (
            <ul className={styles.list}>{comments.list.map((comment) => (
              <ArticleCommentItem key={comment.id} articleId={articleId} comment={comment} onUpdate={comments.updateComment} onDelete={comments.removeComment} />
            ))}</ul>
          )}
          {comments.moreError && <p className={styles.error} role="alert">{comments.moreError}</p>}
          {comments.nextCursor !== null && <button className={styles.more} type="button" onClick={comments.loadMore} disabled={comments.isLoadingMore}>
            {comments.isLoadingMore ? "불러오는 중..." : "댓글 더 보기"}
          </button>}
        </>
      )}
    </section>
  );
}
