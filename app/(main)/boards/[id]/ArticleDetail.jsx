"use client";

import Link from "next/link";
import useArticle from "@/hooks/useArticle";
import DeleteArticleButton from "@/components/DeleteArticleButton";
import ArticleComments from "@/components/ArticleComments";
import { ARTICLE_AUTHOR, ARTICLE_LIKES, formatArticleDate } from "@/app/_utils/article";
import styles from "./ArticleDetail.module.scss";

export default function ArticleDetail({ articleId }) {
  const { article, error, isLoading } = useArticle(articleId);

  return (
    <main className={styles.main}>
      {isLoading ? <p role="status">게시글을 불러오는 중...</p> : error ? <p role="alert">{error}</p> : (
        <article>
          <div className={styles.heading}>
            <h1>{article.title}</h1>
            <details className={styles.menu}>
              <summary aria-label="게시글 메뉴"><img src="/asset/board/kebab.svg" alt="" /></summary>
              <div className={styles.menuItems}><Link href={`/boards/${article.id}/edit`}>수정하기</Link><DeleteArticleButton articleId={article.id} /></div>
            </details>
          </div>
          <div className={styles.meta}>
            <div className={styles.identity}>
              <span className={styles.profile} aria-hidden="true">
                <img src="/asset/board/detail-profile-background.svg" alt="" />
                <img className={styles.face} src="/asset/board/detail-profile-face.svg" alt="" />
                <img src="/asset/board/detail-profile-mask.svg" alt="" />
              </span>
              <div className={styles.authorText}>
                <span>{ARTICLE_AUTHOR}</span>
                <time dateTime={article.createdAt}>{formatArticleDate(article.createdAt)}</time>
              </div>
            </div>
            <div className={styles.stats}>
              <img src="/asset/board/detail-meta-divider.svg" alt="" />
              <span className={styles.likes} aria-label={`좋아요 ${ARTICLE_LIKES}개`}>
                <picture>
                  <source media="(max-width: 743px)" srcSet="/asset/board/heart.svg" />
                  <img src="/asset/board/detail-heart.svg" alt="" />
                </picture>
                {ARTICLE_LIKES}
              </span>
            </div>
          </div>
          <span className={styles.divider} aria-hidden="true"><img src="/asset/board/detail-divider.svg" alt="" /></span>
          <p className={styles.content}>{article.content}</p>
          <ArticleComments key={article.id} articleId={article.id} />
        </article>
      )}
      <Link className={styles.back} href="/boards">
        목록으로 돌아가기<span className={styles.backIcon}><img src="/asset/board/back.svg" alt="" /></span>
      </Link>
    </main>
  );
}
