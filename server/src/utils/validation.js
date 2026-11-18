import { HttpError } from "./http-error.js";

export const MAX_INT = 2147483647;
export const MAX_LIMIT = 50;

function parseInteger(value, min, max, message) {
  if (
    (typeof value !== "string" && typeof value !== "number") ||
    !/^\d+$/.test(String(value))
  ) {
    throw new HttpError(400, message);
  }
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < min || number > max) {
    throw new HttpError(400, message);
  }
  return number;
}

export function parseId(value, label = "ID") {
  return parseInteger(value, 1, MAX_INT, `올바르지 않은 ${label}입니다.`);
}

export function parseLimit(value = 10) {
  return parseInteger(value, 1, MAX_LIMIT, `limit은 1~${MAX_LIMIT}의 정수여야 합니다.`);
}

export function parsePagination(query) {
  return {
    offset: parseInteger(query.offset ?? 0, 0, MAX_INT, "offset을 확인해주세요."),
    limit: parseLimit(query.limit),
  };
}

export function parseKeyword(value = "") {
  if (typeof value !== "string") throw new HttpError(400, "검색어를 확인해주세요.");
  return value;
}

function isNonEmptyString(value) {
  return typeof value === "string" && Boolean(value.trim());
}

function parseFields(body, validators, partial, message) {
  const input = body ?? {};
  if (typeof input !== "object" || Array.isArray(input)) throw new HttpError(400, message);
  const data = {};
  for (const [field, validate] of Object.entries(validators)) {
    const value = input[field];
    if (partial && value === undefined) continue;
    if (!validate(value)) throw new HttpError(400, message);
    if (value !== undefined) data[field] = value;
  }
  if (partial && Object.keys(data).length === 0) {
    throw new HttpError(400, "수정할 정보를 입력해주세요.");
  }
  return data;
}

export function parseProductInput(body, partial = false) {
  return parseFields(body, {
    name: isNonEmptyString,
    description: isNonEmptyString,
    price: (value) => Number.isSafeInteger(value) && value >= 0 && value <= MAX_INT,
    tags: (value) => Array.isArray(value) && value.every((tag) => typeof tag === "string"),
  }, partial, "상품 정보를 확인해주세요.");
}

export function parseArticleInput(body, partial = false) {
  return parseFields(body, {
    title: isNonEmptyString,
    content: isNonEmptyString,
    image: (value) => value === undefined || value === null || isNonEmptyString(value),
  }, partial, "게시글 정보를 확인해주세요.");
}

export function parseCommentInput(body) {
  return parseFields(body, { content: isNonEmptyString }, false, "댓글 내용을 입력해주세요.");
}
