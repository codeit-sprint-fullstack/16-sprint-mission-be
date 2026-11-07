"use client";

import { useRef, useState } from "react";
import { deleteArticleComment, updateArticleComment } from "@/app/_api/articleApi";
import ConfirmDialog from "./ConfirmDialog";
import CommentAuthor from "./CommentAuthor";
import styles from "./ArticleComments.module.scss";

export default function ArticleCommentItem({ articleId, comment, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const busy = useRef(false);
  const menu = useRef(null);

  async function save(event) {
    event.preventDefault();
    if (!draft.trim() || busy.current) return;
    busy.current = true;
    setPending("save");
    setError("");
    try {
      const updated = await updateArticleComment(articleId, comment.id, { content: draft.trim() });
      onUpdate(updated);
      setIsEditing(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      busy.current = false;
      setPending("");
    }
  }

  async function remove() {
    if (busy.current) return;
    busy.current = true;
    setPending("delete");
    setError("");
    try {
      await deleteArticleComment(articleId, comment.id);
      onDelete(comment.id);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      busy.current = false;
      setPending("");
    }
  }

  return (
    <li className={`${styles.item} ${isEditing ? styles.editing : ""}`}>
      {isEditing ? (
        <form onSubmit={save} aria-label="댓글 수정" aria-busy={pending === "save"}>
          <textarea className={styles.editInput} aria-label="수정할 댓글" placeholder="댓글을 입력해주세요." value={draft}
            onChange={(event) => setDraft(event.target.value)} required disabled={Boolean(pending)} />
          <div className={styles.editFooter}>
            <CommentAuthor createdAt={comment.createdAt} />
            <div className={styles.editActions}>
              <button className={styles.cancel} type="button" disabled={Boolean(pending)} onClick={() => { setIsEditing(false); setError(""); }}>취소</button>
              <button className={styles.primary} type="submit" disabled={!draft.trim() || Boolean(pending)}>{pending ? "저장 중..." : "수정 완료"}</button>
            </div>
          </div>
          {error && <p className={styles.error} role="alert">{error}</p>}
        </form>
      ) : (
        <>
          <div className={styles.itemHeading}>
            <p className={styles.commentContent}>{comment.content}</p>
            <details className={styles.menu} ref={menu}>
              <summary aria-label="댓글 메뉴"><img src="/asset/board/kebab.svg" alt="" /></summary>
              <div className={styles.menuItems}>
                <button type="button" disabled={Boolean(pending)} onClick={() => { menu.current.open = false; setDraft(comment.content); setError(""); setIsEditing(true); }}>수정하기</button>
                <button type="button" disabled={Boolean(pending)} onClick={() => { menu.current.open = false; setError(""); setConfirmDelete(true); }}>삭제하기</button>
              </div>
            </details>
          </div>
          <CommentAuthor createdAt={comment.createdAt} />
        </>
      )}
      <span className={styles.divider} aria-hidden="true"><img src="/asset/board/detail-divider.svg" alt="" /></span>
      {confirmDelete && <ConfirmDialog title="댓글을 삭제할까요?" message="삭제한 댓글은 되돌릴 수 없습니다." error={error}
        isPending={pending === "delete"} onConfirm={remove} onCancel={() => { setConfirmDelete(false); setError(""); }} />}
    </li>
  );
}
