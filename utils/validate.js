import { BadRequestError } from "../errors.js";

// 0 또는 자연수인지 검증하는 함수
const isWholeNumber = (num) => {
  if (!Number.isInteger(num) || num < 0) return false;
  return true;
};

// 상품, 게시글 쿼리 검증
export const validateQuery = ({
  page = 1,
  pageSize = 10,
  orderBy = "recent",
  keyword = "",
}) => {
  // page, pageSize 검증
  page = Number(page);
  pageSize = Number(pageSize);

  if (!isWholeNumber(page)) page = 1;
  if (!isWholeNumber(pageSize)) pageSize = 10;
  if (pageSize > 100) pageSize = 100;

  // orderBy desc로 고정
  orderBy = "desc";

  // keyword 앞뒤 공백제거 + 특수문자 이스케이프
  keyword = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return {
    page,
    pageSize,
    orderBy,
    keyword,
  };
};

export const validateCommentQuery = ({
  id,
  resource,
  page = 1,
  pageSize = 10,
  cursor,
}) => {
  // id 검증
  const resourceId = Number(id);
  if (!isWholeNumber(resourceId)) {
    throw new BadRequestError("보낸 내용이 규칙에 안 맞아요");
  }

  // resource 검증
  if (resource !== "product" && resource !== "article") {
    throw new BadRequestError("보낸 내용이 규칙에 안 맞아요");
  }

  // cursor 검증
  cursor = Number(cursor);

  // page, pageSize 검증
  page = Number(page);
  pageSize = Number(pageSize);
  if (!isWholeNumber(page)) page = 1;
  if (!isWholeNumber(page)) page = 1;
  if (!isWholeNumber(pageSize)) pageSize = 10;
  if (pageSize > 100) pageSize = 100;

  return {
    resource,
    resourceId,
    page,
    pageSize,
    cursor,
  };
};
