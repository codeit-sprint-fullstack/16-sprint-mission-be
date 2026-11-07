import { Router } from "express";
import { createCommentRouter } from "./comments.js";
import { HttpError } from "../utils/http-error.js";
import { parseId, parseKeyword, parsePagination, parseProductInput } from "../utils/validation.js";
import { toProductResponse } from "../utils/responses.js";

export function createProductRouter(prisma) {
  const router = Router();
  router.use((req, res, next) => {
    res.locals.notFoundMessage = "상품을 찾을 수 없습니다.";
    next();
  });
  router.use("/:id/comments", createCommentRouter(prisma, {
    parentModel: "product", commentModel: "productComment", parentKey: "productId", parentLabel: "상품",
  }));

  router.get("/", async (req, res) => {
    const { offset, limit } = parsePagination(req.query);
    const keyword = parseKeyword(req.query.keyword);
    const where = keyword ? {
      OR: [
        { name: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
      ],
    } : {};
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: offset, take: limit,
      }),
      prisma.product.count({ where }),
    ]);
    res.json({ list: products.map((product) => toProductResponse(product, { summary: true })), totalCount });
  });

  router.post("/", async (req, res) => {
    const data = parseProductInput(req.body);
    const product = await prisma.product.create({ data });
    res.status(201).json(toProductResponse(product));
  });

  router.get("/:id", async (req, res) => {
    const id = parseId(req.params.id, "상품 ID");
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new HttpError(404, res.locals.notFoundMessage);
    res.json(toProductResponse(product));
  });

  router.patch("/:id", async (req, res) => {
    const id = parseId(req.params.id, "상품 ID");
    const data = parseProductInput(req.body, true);
    const product = await prisma.product.update({ where: { id }, data });
    res.json(toProductResponse(product));
  });

  router.delete("/:id", async (req, res) => {
    const id = parseId(req.params.id, "상품 ID");
    await prisma.product.delete({ where: { id } });
    res.json({ message: "상품이 삭제되었습니다." });
  });
  return router;
}
