"use client";

import { useEffect, useState } from "react";
import Link from "next/link";


import SearchBar from "@/components/SearchBar";
import SortDropdown from "@/components/SortDropdown";
import Pagination from "@/components/Pagination";
import ArticleCard from "@/components/ArticleCard";
import { getArticles } from "@/app/_api/articleApi";
import styles from "./BoardPage.module.scss";

const PAGE_SIZE = 4;

export default function BoardPage() {
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [sort, setSort] = useState("recent");
  const [best, setBest] = useState({ list: null, error: "" });
  const [result, setResult] = useState({ key: null, list: [], totalCount: 0, error: "" });
  const requestKey = JSON.stringify([pageNumber, keyword, sort]);
  const isLoading = result.key !== requestKey;

  useEffect(() => {
    const controller = new AbortController();
    async function loadBest() {
      try {
        const data = await getArticles({ limit: 3, sort: "recent", signal: controller.signal });
        if (!controller.signal.aborted) setBest({ list: data.list, error: "" });
      } catch (error) {
        if (!controller.signal.aborted) setBest({ list: [], error: error.message });
      }
    }
    loadBest();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadArticles() {
      try {
        const data = await getArticles({
          offset: (pageNumber - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
          keyword,
          sort,
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setResult({ ...data, key: requestKey, error: "" });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ key: requestKey, list: [], totalCount: 0, error: error.message });
      }
    }
    loadArticles();

    return () => controller.abort();
  }, [pageNumber, keyword, sort, requestKey]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.srOnly}>자유게시판</h1>
        <section className={styles.bestSection} aria-labelledby="best-heading">
          <h2 id="best-heading" className={styles.heading}>베스트 게시글</h2>
          {best.list === null ? <p role="status">베스트 게시글을 불러오는 중...</p> : best.error ? (
            <p role="alert">{best.error}</p>
          ) : best.list.length === 0 ? <p className={styles.empty}>아직 등록된 게시글이 없습니다.</p> : (
            <div className={styles.bestGrid}>
              {best.list.map((article) => <ArticleCard key={article.id} article={article} best />)}
            </div>
          )}
        </section>

        <section className={styles.articleSection} aria-labelledby="articles-heading">
          <div className={styles.sectionHeader}>
            <h2 id="articles-heading" className={styles.heading}>게시글</h2>
            <Link className={styles.writeButton} href="/boards/new">글쓰기</Link>
          </div>
          <div className={styles.toolbar}>
            <SearchBar searchInput={searchInput} setSearchInput={setSearchInput} setKeyword={setKeyword} setPageNumber={setPageNumber} placeholder="검색할 게시글을 입력해주세요" />
            <SortDropdown orderBy={sort} onChange={setSort} setPageNumber={setPageNumber} className={styles.sort} />
          </div>
          <div className={styles.results} aria-busy={isLoading}>
            {isLoading ? <p className={styles.empty} role="status">게시글을 불러오는 중...</p> : result.error ? (
              <p className={styles.empty} role="alert">{result.error}</p>
            ) : result.list.length === 0 ? (
              <p className={styles.empty}>{keyword ? "검색 결과가 없습니다." : "아직 등록된 게시글이 없습니다."}</p>
            ) : (
              <>
                <ul className={styles.list}>
                  {result.list.map((article) => <li key={article.id}><ArticleCard article={article} /></li>)}
                </ul>
                {result.totalCount > PAGE_SIZE && <Pagination pageNumber={pageNumber} totalCount={result.totalCount} onPageChange={setPageNumber} productPageSize={PAGE_SIZE} />}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
