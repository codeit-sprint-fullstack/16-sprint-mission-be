"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getProduct } from "@/app/_api/productApi";


import styles from "./ProductDetailPage.module.scss";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [result, setResult] = useState({ id: null, product: null, error: "" });

  useEffect(() => {
    const controller = new AbortController();
    async function loadProduct() {
      try {
        const product = await getProduct(id, { signal: controller.signal });
        if (!controller.signal.aborted) setResult({ id, product, error: "" });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ id, product: null, error: error.message });
      }
    }
    loadProduct();
    return () => controller.abort();
  }, [id]);

  const product = result.product;
  return (
    <>
      <main className={styles.main}>
        {result.id !== id ? <p role="status">상품 정보를 불러오는 중...</p> : result.error ? (
          <p role="alert">{result.error}</p>
        ) : (
          <article>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <p>{product.price.toLocaleString()}원</p>
            <div>{product.tags.map((tag) => <span key={tag}>#{tag} </span>)}</div>
          </article>
        )}
        <Link href="/items">목록으로 돌아가기</Link>
      </main>
    </>
  );
}
