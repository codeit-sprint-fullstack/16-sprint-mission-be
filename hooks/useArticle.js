"use client";

import { useEffect, useState } from "react";
import { getArticle } from "@/app/_api/articleApi";

export default function useArticle(id) {
  const [result, setResult] = useState({ id: null, article: null, error: "" });

  useEffect(() => {
    const controller = new AbortController();
    async function loadArticle() {
      try {
        const article = await getArticle(id, { signal: controller.signal });
        if (!controller.signal.aborted) setResult({ id, article, error: "" });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ id, article: null, error: error.message });
      }
    }
    loadArticle();
    return () => controller.abort();
  }, [id]);

  const isLoading = result.id !== id;
  return { article: isLoading ? null : result.article, error: isLoading ? "" : result.error, isLoading };
}
