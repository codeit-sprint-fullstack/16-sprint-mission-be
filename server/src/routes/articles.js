import { Router } from "express";
import { createCommentRouter } from "./comments.js";
import { HttpError } from "../utils/http-error.js";
import { parseArticleInput, parseId, parseKeyword, parsePagination } from "../utils/validation.js";
import { toArticleResponse } from "../utils/responses.js";

const orderByMap = {
  recent: [{ createdAt: "desc" }, { id: "desc" }],
  like: [{ likeCount: "desc" }, { createdAt: "desc" }, { id: "desc" }],
};

export function createArticleRouter(prisma) {
  const router = Router();
  router.use((req, res, next) => {
    res.locals.notFoundMessage = "게시글을 찾을 수 없습니다.";
    next();
  });
  router.use("/:id/comments", createCommentRouter(prisma, {
    parentModel: "article", commentModel: "articleComment", parentKey: "articleId", parentLabel: "게시글",
  }));

  router.get("/", async (req, res) => {
    const { offset, limit } = parsePagination(req.query);
    const keyword = parseKeyword(req.query.keyword);
    const sort = req.query.sort ?? "recent";
    if (typeof sort !== "string" || !Object.hasOwn(orderByMap, sort)) {
      throw new HttpError(400, "정렬 조건을 확인해주세요.");
    }
    const where = keyword ? {
      OR: [
        { title: { contains: keyword, mode: "insensitive" } },
        { content: { contains: keyword, mode: "insensitive" } },
      ],
    } : {};
    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({ where, orderBy: orderByMap[sort], skip: offset, take: limit }),
      prisma.article.count({ where }),
    ]);
    res.json({ list: articles.map(toArticleResponse), totalCount });
  });

  router.post("/", async (req, res) => {
    const data = parseArticleInput(req.body);
    const article = await prisma.article.create({ data });
    res.status(201).json(toArticleResponse(article));
  });

  router.get("/:id", async (req, res) => {
    const id = parseId(req.params.id, "게시글 ID");
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) throw new HttpError(404, res.locals.notFoundMessage);
    res.json(toArticleResponse(article));
  });

  router.patch("/:id", async (req, res) => {
    const id = parseId(req.params.id, "게시글 ID");
    const data = parseArticleInput(req.body, true);
    const article = await prisma.article.update({ where: { id }, data });
    res.json(toArticleResponse(article));
  });

  router.delete("/:id", async (req, res) => {
    const id = parseId(req.params.id, "게시글 ID");
    await prisma.article.delete({ where: { id } });
    res.json({ message: "게시글이 삭제되었습니다." });
  });
  return router;
}
