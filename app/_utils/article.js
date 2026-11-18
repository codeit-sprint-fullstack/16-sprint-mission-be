// 미션 7에서는 작성자와 좋아요 수를 프론트엔드의 임의값으로 표시합니다.
export const ARTICLE_AUTHOR = "판다판다";
export const ARTICLE_LIKES = 123;

export function formatArticleDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Seoul",
  }).format(date);
}

export function isArticleId(value) {
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0 && Number(value) <= 2147483647;
}
