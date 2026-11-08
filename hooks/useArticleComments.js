"use client";

import { useEffect, useRef, useState } from "react";
import { getArticleComments } from "@/app/_api/articleApi";

export default function useArticleComments(articleId) {
  const [retryCount, setRetryCount] = useState(0);
  const requestKey = JSON.stringify([articleId, retryCount]);
  const [result, setResult] = useState({ key: null, list: [], nextCursor: null, error: "", moreError: "" });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const moreRequest = useRef(null);
  const isLoading = result.key !== requestKey;

  useEffect(() => {
    const controller = new AbortController();
    async function loadComments() {
      try {
        const data = await getArticleComments(articleId, { signal: controller.signal });
        if (!controller.signal.aborted) setResult({ ...data, key: requestKey, error: "", moreError: "" });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ key: requestKey, list: [], nextCursor: null, error: error.message, moreError: "" });
      }
    }
    loadComments();
    return () => { controller.abort(); moreRequest.current?.abort(); };
  }, [articleId, requestKey]);

  async function loadMore() {
    if (isLoading || result.nextCursor === null || moreRequest.current) return;
    const controller = new AbortController();
    moreRequest.current = controller;
    setIsLoadingMore(true);
    try {
      const data = await getArticleComments(articleId, { cursor: result.nextCursor, signal: controller.signal });
      if (!controller.signal.aborted) setResult((current) => {
        if (current.key !== requestKey) return current;
        const existing = new Set(current.list.map((comment) => comment.id));
        return { ...current, list: [...current.list, ...data.list.filter((comment) => !existing.has(comment.id))], nextCursor: data.nextCursor, moreError: "" };
      });
    } catch (error) {
      if (!controller.signal.aborted) setResult((current) => current.key === requestKey ? { ...current, moreError: error.message } : current);
    } finally {
      moreRequest.current = null;
      setIsLoadingMore(false);
    }
  }

  function addComment(comment) {
    setResult((current) => current.key === requestKey ? { ...current, list: [comment, ...current.list.filter((row) => row.id !== comment.id)] } : current);
  }
  function updateComment(comment) {
    setResult((current) => current.key === requestKey ? { ...current, list: current.list.map((row) => row.id === comment.id ? comment : row) } : current);
  }
  function removeComment(commentId) {
    setResult((current) => current.key === requestKey ? { ...current, list: current.list.filter((row) => row.id !== commentId) } : current);
  }

  return { ...result, isLoading, isLoadingMore, loadMore, addComment, updateComment, removeComment, retry: () => setRetryCount((count) => count + 1) };
}
