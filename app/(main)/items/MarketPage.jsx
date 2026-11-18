"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import SearchBar from "@/components/SearchBar";
import SortDropdown from "@/components/SortDropdown";
import Pagination from "@/components/Pagination";

import ProductCard from "@/components/ProductCard";
import styles from "./MarketPage.module.scss";
import { getProducts } from "@/app/_api/productApi";
import usePageSize from "@/hooks/usePageSize";

export default function MarketPage() {
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const { productPageSize } = usePageSize();
  const [pagination, setPagination] = useState({ page: 1, pageSize: productPageSize });
  const pageNumber = pagination.pageSize === productPageSize ? pagination.page : 1;
  const setPageNumber = (page) => setPagination({ page, pageSize: productPageSize });
  const requestKey = JSON.stringify([pageNumber, productPageSize, keyword]);
  const [result, setResult] = useState({ key: null, list: [], totalCount: 0, error: "" });
  const isLoading = result.key !== requestKey;

  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      try {
        const data = await getProducts({
          offset: (pageNumber - 1) * productPageSize,
          limit: productPageSize,
          keyword,
          signal: controller.signal,
        });
        if (!controller.signal.aborted) setResult({ ...data, key: requestKey, error: "" });
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({ key: requestKey, list: [], totalCount: 0, error: error.message });
        }
      }
    }
    loadProducts();
    return () => controller.abort();
  }, [pageNumber, productPageSize, keyword, requestKey]);

  return (
    <>
      <main className={styles.main}>
        <section className={styles.productSection}>
          <div className={styles.productToolbar}>
            <div className={styles.toolbarTop}>
              <h2 className={`${styles.sectionTitle} ${styles.productTitle}`}>판매 중인 상품</h2>
              <Link href="/registration" className={styles.addButton}>상품 등록하기</Link>
            </div>
            <div className={styles.toolbarBottom}>
              <SearchBar searchInput={searchInput} setSearchInput={setSearchInput} setKeyword={setKeyword} setPageNumber={setPageNumber} />
              <SortDropdown orderBy="recent" setPageNumber={setPageNumber} />
            </div>
          </div>
          {isLoading ? <p role="status">상품 목록을 불러오는 중...</p> : result.error ? (
            <p role="alert">{result.error}</p>
          ) : (
            <>
              {result.list.length === 0 ? <p>등록된 상품이 없습니다.</p> : (
                <div className={styles.productGrid}>
                  {result.list.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
              )}
              <Pagination pageNumber={pageNumber} totalCount={result.totalCount} onPageChange={setPageNumber} productPageSize={productPageSize} />
            </>
          )}
        </section>
      </main>
    </>
  );
}
