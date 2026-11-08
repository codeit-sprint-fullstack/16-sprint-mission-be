async function requestArticle(
  path,
  options = {},
  fallbackMessage = "게시글 요청에 실패했습니다.",
) {
  const response = await fetch(`/api/articles${path}`, options);
  if (!response.ok) {
    let message = fallbackMessage;
    try {
      const body = await response.json();
      if (typeof body.message === "string") message = body.message;
    } catch {}
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function getArticles({
  offset = 0,
  limit = 4,
  keyword = "",
  sort = "recent",
  signal,
} = {}) {
  const query = new URLSearchParams({
    offset,
    limit,
    keyword,
    sort,
    searchBy: "title",
  });
  return requestArticle(
    `?${query.toString()}`,
    { signal, cache: "no-store" },
    "게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
  );
}

export function getArticle(id, { signal } = {}) {
  return requestArticle(
    `/${encodeURIComponent(id)}`,
    { signal, cache: "no-store" },
    "게시글을 불러오지 못했습니다.",
  );
}

export function createArticle({ title, content }) {
  return requestArticle(
    "",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    },
    "게시글을 등록하지 못했습니다.",
  );
}

export function updateArticle(id, { title, content }) {
  return requestArticle(
    `/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    },
    "게시글을 수정하지 못했습니다.",
  );
}

export function deleteArticle(id) {
  return requestArticle(`/${encodeURIComponent(id)}`, { method: "DELETE" }, "게시글을 삭제하지 못했습니다.");
}

export function getArticleComments(articleId, { limit = 3, cursor, signal } = {}) {
  const query = new URLSearchParams({ limit });
  if (cursor !== undefined && cursor !== null) query.set("cursor", cursor);
  return requestArticle(`/${encodeURIComponent(articleId)}/comments?${query}`, { signal, cache: "no-store" }, "댓글을 불러오지 못했습니다.");
}

export function createArticleComment(articleId, { content }) {
  return requestArticle(`/${encodeURIComponent(articleId)}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  }, "댓글을 등록하지 못했습니다.");
}

export function updateArticleComment(articleId, commentId, { content }) {
  return requestArticle(`/${encodeURIComponent(articleId)}/comments/${encodeURIComponent(commentId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  }, "댓글을 수정하지 못했습니다.");
}

export function deleteArticleComment(articleId, commentId) {
  return requestArticle(`/${encodeURIComponent(articleId)}/comments/${encodeURIComponent(commentId)}`, {
    method: "DELETE",
  }, "댓글을 삭제하지 못했습니다.");
}
