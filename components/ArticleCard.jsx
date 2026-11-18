import Link from "next/link";
const defaultImage = "/asset/default-image.png";
import styles from "./ArticleCard.module.scss";
import { ARTICLE_AUTHOR, ARTICLE_LIKES, formatArticleDate } from "@/app/_utils/article";

function ProfileIcon() {
  return (
    <span className={styles.profile} aria-hidden="true">
      <img src="/asset/board/profile-background.svg" alt="" />
      <img className={styles.face} src="/asset/board/profile-face.svg" alt="" />
      <img src="/asset/board/profile-mask.svg" alt="" />
    </span>
  );
}

export default function ArticleCard({ article, best = false }) {
  return (
    <article className={best ? styles.bestCard : styles.row}>
      <Link href={`/boards/${article.id}`} className={styles.link}>
        {best && <span className={styles.badge}><img src="/asset/board/medal.svg" alt="" />Best</span>}
        <div className={styles.content}>
          <h3 className={styles.title}>{article.title}</h3>
          <span className={styles.thumbnail}>
            <img src={defaultImage} alt="게시글 기본 이미지" width="48" height="48" />
          </span>
        </div>
        <div className={styles.meta}>
          <span className={styles.author}>
            {!best && <ProfileIcon />}
            <span>{ARTICLE_AUTHOR}</span>
          </span>
          <time className={styles.date} dateTime={article.createdAt}>{formatArticleDate(article.createdAt)}</time>
          <span className={styles.likes} aria-label={`좋아요 ${ARTICLE_LIKES}개`}>
            <img src={best ? "/asset/board/heart-small.svg" : "/asset/board/heart.svg"} alt="" />
            {ARTICLE_LIKES}
          </span>
        </div>
      </Link>
      {!best && <span className={styles.divider} aria-hidden="true"><img src="/asset/board/divider.svg" alt="" /></span>}
    </article>
  );
}
