import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { once } from "node:events";
import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createApp } from "../src/app.js";

const logger = { error() {} };
const productInput = { name: "키보드", description: "테스트 상품", price: 1000, tags: ["전자기기"] };
const articleInput = { title: "게시글", content: "테스트 내용" };
const productFields = ["id", "name", "description", "price", "tags", "createdAt"].sort();
const articleFields = ["id", "title", "content", "image", "likeCount", "createdAt"].sort();
const commentFields = ["id", "content", "createdAt"].sort();

async function startApp(prisma) {
  const server = createApp(prisma, { logger }).listen(0, "127.0.0.1");
  await once(server, "listening");
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  return {
    async request(path, { method = "GET", body, rawBody } = {}) {
      const response = await fetch(baseUrl + path, {
        method,
        headers: body !== undefined || rawBody !== undefined ? { "Content-Type": "application/json" } : {},
        body: rawBody ?? (body === undefined ? undefined : JSON.stringify(body)),
        signal: AbortSignal.timeout(5000),
      });
      const text = await response.text();
      return { status: response.status, body: response.headers.get("content-type")?.includes("json") ? JSON.parse(text) : text };
    },
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}

describe("HTTP API와 PostgreSQL 회귀 검증", { concurrency: false }, () => {
  let db;
  let socketServer;
  let prisma;
  let api;
  let migratedArticle;

  before(async () => {
    db = await PGlite.create();
    const migrationsUrl = new URL("../prisma/migrations/", import.meta.url);
    const entries = (await readdir(migrationsUrl, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.name === "20261107000000_add_article_image") {
        await db.exec(`INSERT INTO "Article" ("title", "content", "updatedAt") VALUES ('legacy', 'preserved', CURRENT_TIMESTAMP)`);
      }
      await db.exec(await readFile(new URL(`${entry.name}/migration.sql`, migrationsUrl), "utf8"));
    }
    migratedArticle = (await db.query('SELECT "title", "content", "image", "likeCount" FROM "Article"')).rows[0];
    socketServer = new PGLiteSocketServer({ db, host: "127.0.0.1", port: 0 });
    await socketServer.start();
    prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: `postgresql://postgres:postgres@${socketServer.getServerConn()}/postgres`, max: 1 }),
    });
    api = await startApp(prisma);
  });

  beforeEach(async () => {
    await db.exec('TRUNCATE TABLE "Product", "Article", "ProductComment", "ArticleComment" RESTART IDENTITY CASCADE');
  });

  after(async () => {
    if (api) await api.close();
    if (prisma) await prisma.$disconnect();
    if (socketServer) await socketServer.stop();
    if (db) await db.close();
  });

  it("기존 데이터가 보존되고 새 필드의 기본값이 적용된다", () => {
    assert.deepEqual(migratedArticle, { title: "legacy", content: "preserved", image: null, likeCount: 0 });
  });

  it("기본 경로와 없는 경로의 응답을 구분한다", async () => {
    assert.deepEqual(await api.request("/"), { status: 200, body: "Panda Market API" });
    assert.equal((await api.request("/missing")).status, 404);
  });

  for (const path of ["/products", "/articles", "/products/1/comments", "/articles/1/comments"]) {
    it(`${path}: 본문 없는 등록은 400이다`, async () => {
      assert.equal((await api.request(path, { method: "POST" })).status, 400);
    });
  }

  for (const path of ["/products/1", "/articles/1", "/products/1/comments/1", "/articles/1/comments/1"]) {
    it(`${path}: 본문 없거나 비어 있는 수정은 400이다`, async () => {
      for (const body of [undefined, {}, [], null]) {
        assert.equal((await api.request(path, { method: "PATCH", body })).status, 400);
      }
    });
  }

  for (const path of ["/products", "/articles"]) {
    it(`${path}: 잘못된 ID와 DB Int 범위 밖 ID는 400이다`, async () => {
      for (const id of ["abc", "0", "-1", "1.5", "1e2", "2147483648", "9007199254740992"]) {
        assert.equal((await api.request(`${path}/${id}`)).status, 400, id);
      }
      assert.equal((await api.request(`${path}/2147483647`)).status, 404);
    });

    it(`${path}: 목록 입력값과 limit 상한을 검증한다`, async () => {
      for (const query of ["limit=0", "limit=-1", "limit=51", "limit=100000", "limit=1.5", "limit=", "limit=1&limit=2", "offset=-1", "offset=2147483648", "offset=abc", "keyword=a&keyword=b"]) {
        assert.equal((await api.request(`${path}?${query}`)).status, 400, query);
      }
      assert.equal((await api.request(`${path}?limit=50&offset=0`)).status, 200);
    });
  }

  it("상품 가격은 등록과 수정 모두 0~Int 최댓값만 허용한다", async () => {
    for (const price of [-1, 1.5, "1000", null, 2147483648, Number.MAX_SAFE_INTEGER]) {
      assert.equal((await api.request("/products", { method: "POST", body: { ...productInput, price } })).status, 400);
    }
    const created = await api.request("/products", { method: "POST", body: { ...productInput, price: 2147483647 } });
    assert.equal(created.status, 201);
    assert.equal(created.body.price, 2147483647);
    const path = `/products/${created.body.id}`;
    assert.equal((await api.request(path, { method: "PATCH", body: { price: 2147483648 } })).status, 400);
    assert.equal((await api.request(path)).body.price, 2147483647);
    assert.equal((await api.request(path, { method: "PATCH", body: { price: 0 } })).body.price, 0);
  });

  it("상품 CRUD 응답을 통일하고 updatedAt을 노출하지 않는다", async () => {
    const created = await api.request("/products", { method: "POST", body: productInput });
    assert.equal(created.status, 201);
    assert.deepEqual(Object.keys(created.body).sort(), productFields);
    const path = `/products/${created.body.id}`;
    assert.deepEqual(Object.keys((await api.request(path)).body).sort(), productFields);
    const updated = await api.request(path, { method: "PATCH", body: { name: "수정된 이름" } });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.name, "수정된 이름");
    assert.deepEqual(Object.keys(updated.body).sort(), productFields);
    const list = await api.request("/products");
    assert.equal(list.body.totalCount, 1);
    assert.deepEqual(Object.keys(list.body.list[0]).sort(), ["id", "name", "price", "createdAt"].sort());
    assert.equal((await api.request(path, { method: "DELETE" })).status, 200);
    for (const method of ["GET", "PATCH", "DELETE"]) {
      const res = await api.request(path, { method, ...(method === "PATCH" && { body: { name: "없는 상품" } }) });
      assert.equal(res.status, 404);
      assert.equal(res.body.message, "상품을 찾을 수 없습니다.");
    }
  });

  it("상품 검색·offset과 검색 결과 totalCount가 일치한다", async () => {
    await prisma.product.createMany({ data: [
      { ...productInput, name: "MATCH 1" }, { ...productInput, name: "MATCH 2" }, { ...productInput, name: "other" },
    ] });
    const res = await api.request("/products?keyword=match&offset=1&limit=1");
    assert.equal(res.body.totalCount, 2);
    assert.equal(res.body.list.length, 1);
    assert.equal(res.body.list[0].name, "MATCH 1");
  });

  it("게시글 이미지 유지·변경·제거와 응답 형식을 검증한다", async () => {
    const created = await api.request("/articles", { method: "POST", body: { ...articleInput, image: "https://example.com/image.png", likeCount: 999 } });
    assert.equal(created.status, 201);
    assert.equal(created.body.likeCount, 0);
    assert.deepEqual(Object.keys(created.body).sort(), articleFields);
    const path = `/articles/${created.body.id}`;
    const kept = await api.request(path, { method: "PATCH", body: { title: "수정", likeCount: 999 } });
    assert.equal(kept.body.image, "https://example.com/image.png");
    assert.equal(kept.body.likeCount, 0);
    const changed = await api.request(path, { method: "PATCH", body: { image: "https://example.com/new.png" } });
    assert.equal(changed.body.image, "https://example.com/new.png");
    assert.deepEqual(Object.keys(changed.body).sort(), articleFields);
    assert.equal((await api.request(path, { method: "PATCH", body: { image: null } })).body.image, null);
    assert.deepEqual(Object.keys((await api.request(path)).body).sort(), articleFields);
    assert.deepEqual(Object.keys((await api.request("/articles")).body.list[0]).sort(), articleFields);
    for (const image of [123, {}, [], true, "", "   "]) {
      assert.equal((await api.request("/articles", { method: "POST", body: { ...articleInput, image } })).status, 400);
      assert.equal((await api.request(path, { method: "PATCH", body: { image } })).status, 400);
    }
    assert.equal((await api.request("/articles", { method: "POST", body: articleInput })).body.image, null);
    assert.equal((await api.request(path, { method: "DELETE" })).status, 200);
    for (const method of ["GET", "PATCH", "DELETE"]) {
      const res = await api.request(path, { method, ...(method === "PATCH" && { body: { title: "없는 게시글" } }) });
      assert.equal(res.status, 404);
      assert.equal(res.body.message, "게시글을 찾을 수 없습니다.");
    }
  });

  it("좋아요순·최신순의 동률 정렬과 검색·페이지네이션이 안정적이다", async () => {
    const dates = [1, 2, 2, 3, 4].map((day) => new Date(Date.UTC(2026, 0, day)));
    const likes = [30, 30, 30, 10, 50];
    const ids = [];
    for (let i = 0; i < 5; i++) {
      const article = await prisma.article.create({ data: { title: i === 4 ? "other" : "MATCH", content: "body", likeCount: likes[i], createdAt: dates[i] } });
      ids.push(article.id);
    }
    const listIds = (res) => res.body.list.map((row) => row.id);
    assert.deepEqual(listIds(await api.request("/articles")), [...ids].reverse());
    assert.deepEqual(listIds(await api.request("/articles?sort=recent")), [...ids].reverse());
    assert.deepEqual(listIds(await api.request("/articles?sort=like")), [ids[4], ids[2], ids[1], ids[0], ids[3]]);
    const first = await api.request("/articles?sort=like&keyword=match&limit=2&offset=0");
    const second = await api.request("/articles?sort=like&keyword=match&limit=2&offset=2");
    assert.equal(first.body.totalCount, 4);
    assert.deepEqual([...listIds(first), ...listIds(second)], [ids[2], ids[1], ids[0], ids[3]]);
    assert.deepEqual((await api.request("/articles?keyword=missing")).body, { list: [], totalCount: 0 });
    for (const query of ["sort=popular", "sort=", "sort=constructor", "sort=__proto__", "sort=toString", "sort=recent&sort=like"]) {
      assert.equal((await api.request(`/articles?${query}`)).status, 400, query);
    }
  });

  for (const resource of ["products", "articles"]) {
    const parentModel = resource === "products" ? "product" : "article";
    const commentModel = `${parentModel}Comment`;
    const parentKey = `${parentModel}Id`;
    const input = resource === "products" ? productInput : articleInput;

    it(`${resource}: 없는 부모의 댓글 등록·목록은 404이다`, async () => {
      const path = `/${resource}/999/comments`;
      assert.equal((await api.request(path, { method: "POST", body: { content: "내용" } })).status, 404);
      assert.equal((await api.request(path)).status, 404);
    });

    it(`${resource}: 댓글 수정·삭제 시 부모 소속을 검증한다`, async () => {
      const parent = await prisma[parentModel].create({ data: input });
      const other = await prisma[parentModel].create({ data: input });
      const path = `/${resource}/${parent.id}/comments`;
      const created = await api.request(path, { method: "POST", body: { content: "원본" } });
      assert.equal(created.status, 201);
      assert.deepEqual(Object.keys(created.body).sort(), commentFields);
      const wrongPath = `/${resource}/${other.id}/comments/${created.body.id}`;
      assert.equal((await api.request(wrongPath, { method: "PATCH", body: { content: "잘못된 수정" } })).status, 404);
      assert.equal((await api.request(wrongPath, { method: "DELETE" })).status, 404);
      assert.equal((await prisma[commentModel].findUnique({ where: { id: created.body.id } })).content, "원본");
      const commentPath = `${path}/${created.body.id}`;
      const updated = await api.request(commentPath, { method: "PATCH", body: { content: "수정" } });
      assert.equal(updated.status, 200);
      assert.equal(updated.body.content, "수정");
      assert.deepEqual(Object.keys(updated.body).sort(), commentFields);
      assert.equal((await api.request(commentPath, { method: "PATCH", body: { content: " " } })).status, 400);
      assert.equal((await api.request(commentPath, { method: "DELETE" })).status, 200);
      assert.equal((await api.request(commentPath, { method: "DELETE" })).status, 404);
    });

    it(`${resource}: 커서 페이지네이션·limit·Cascade를 검증한다`, async () => {
      const parent = await prisma[parentModel].create({ data: input });
      const path = `/${resource}/${parent.id}/comments`;
      for (let i = 0; i < 5; i++) {
        await prisma[commentModel].create({ data: { content: `댓글 ${i}`, [parentKey]: parent.id } });
      }
      const first = await api.request(`${path}?limit=2`);
      const second = await api.request(`${path}?limit=2&cursor=${first.body.nextCursor}`);
      const last = await api.request(`${path}?limit=2&cursor=${second.body.nextCursor}`);
      assert.deepEqual([...first.body.list, ...second.body.list, ...last.body.list].map((row) => row.content), ["댓글 4", "댓글 3", "댓글 2", "댓글 1", "댓글 0"]);
      assert.equal(last.body.nextCursor, null);
      assert.deepEqual(Object.keys(first.body.list[0]).sort(), commentFields);
      for (const query of ["limit=51", "limit=0", "limit=1&limit=2", "cursor=abc", "cursor=0", "cursor=2147483648", "cursor=1&cursor=2"]) {
        assert.equal((await api.request(`${path}?${query}`)).status, 400, query);
      }
      assert.equal((await api.request(`${path}?limit=50`)).status, 200);
      assert.equal((await api.request(`/${resource}/${parent.id}`, { method: "DELETE" })).status, 200);
      assert.equal(await prisma[commentModel].count(), 0);
    });
  }

  it("잘못된 JSON은 공통 미들웨어에서 400으로 처리한다", async () => {
    const res = await api.request("/products", { method: "POST", rawBody: '{"name":' });
    assert.equal(res.status, 400);
    assert.equal(typeof res.body.message, "string");
  });
});

describe("비동기 에러와 병렬 목록 쿼리", () => {
  it("async 라우트의 예상하지 못한 에러는 안전한 500 응답이 된다", async () => {
    const api = await startApp({ product: { findMany: async () => { throw new Error("private DB details"); }, count: async () => 0 } });
    try {
      assert.deepEqual(await api.request("/products"), { status: 500, body: { message: "서버 오류가 발생했습니다." } });
    } finally { await api.close(); }
  });

  for (const resource of ["products", "articles"]) {
    it(`${resource}: findMany 완료를 기다리지 않고 count를 시작한다`, async () => {
      let completeList;
      const model = {
        findMany: () => new Promise((resolve) => { completeList = resolve; }),
        count: async () => { assert.equal(typeof completeList, "function"); completeList([]); return 0; },
      };
      const api = await startApp({ [resource === "products" ? "product" : "article"]: model });
      try {
        assert.deepEqual(await api.request(`/${resource}`), { status: 200, body: { list: [], totalCount: 0 } });
      } finally { await api.close(); }
    });
  }
});
