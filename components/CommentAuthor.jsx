import { formatArticleDate } from "@/app/_utils/article";
import styles from "./ArticleComments.module.scss";

function formatCommentTime(value) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (seconds < 60) return "방금 전";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;
  return formatArticleDate(value);
}

export default function CommentAuthor({ createdAt }) {
  return (
    <div className={styles.author}>
      <span className={styles.profile} aria-hidden="true">
        <img src="/asset/board/comment-profile-background.svg" alt="" />
        <img className={styles.face} src="/asset/board/comment-profile-face.svg" alt="" />
        <img src="/asset/board/comment-profile-mask.svg" alt="" />
      </span>
      <span className={styles.authorText}><span>똑똑한판다</span><time dateTime={createdAt}>{formatCommentTime(createdAt)}</time></span>
    </div>
  );
}
