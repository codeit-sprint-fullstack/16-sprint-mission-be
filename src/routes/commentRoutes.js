
import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

const isValidId = (id) => Number.isSafeInteger(id) && id > 0;

const validateContent = (content) =>
  typeof content === "string" && content.trim().length > 0;

// 댓글 등록 공통 함수
const createComment = (type) => async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { content } = req.body;

    if (!isValidId(id) || !validateContent(content)) {
      return res.status(400).json({ message: "입력값이 올바르지 않습니다." });
    }

    const isArticle = type === "article";
    const parent = isArticle
      ? await prisma.article.findUnique({ where: { id } })
      : await prisma.product.findUnique({ where: { id } });

    if (!parent) {
      return res.status(404).json({ message: "대상이 존재하지 않습니다." });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        ...(isArticle ? { articleId: id } : { productId: id }),
      },
    });

    return res.status(201).json(comment);
  } catch (error) {
    if (error.code === "P2003" || error.code === "P2025") {
      return res.status(404).json({ message: "대상이 존재하지 않습니다." });
    }
    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  }
};

// 댓글 목록 조회 (cursor 페이지네이션)
const listComments = (type) => async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { cursor, limit = "10" } = req.query;
    const take = Number(limit);
    const cursorId = cursor === undefined ? undefined : Number(cursor);

    if (
      !isValidId(id) ||
      !Number.isInteger(take) || take < 1 || take > 100 ||
      (cursor !== undefined && !isValidId(cursorId))
    ) {
      return res.status(400).json({ message: "잘못된 조회 조건입니다." });
    }

    const isArticle = type === "article";

    const parent = isArticle
      ? await prisma.article.findUnique({ where: { id }, select: { id: true } })
      : await prisma.product.findUnique({ where: { id }, select: { id: true } });

    if (!parent) {
      return res.status(404).json({ message: "대상이 존재하지 않습니다." });
    }

    const comments = await prisma.comment.findMany({
      where: {
        ...(isArticle ? { articleId: id } : { productId: id }),
        ...(cursorId !== undefined && { id: { lt: cursorId } }),
      },
      orderBy: { id: "desc" },
      take: take + 1,
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    const hasNext = comments.length > take;
    const items = comments.slice(0, take);

    return res.status(200).json({
      comments: items,
      nextCursor: hasNext ? items[items.length - 1].id : null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  }
};

// 자유게시판 댓글 등록 및 목록
router.post("/articles/:id/comments", createComment("article"));
router.get("/articles/:id/comments", listComments("article"));

// 중고마켓 댓글 등록 및 목록
router.post("/products/:id/comments", createComment("product"));
router.get("/products/:id/comments", listComments("product"));

// 댓글 수정
router.patch("/comments/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { content } = req.body;

    if (!isValidId(id) || !validateContent(content)) {
      return res.status(400).json({ message: "입력값이 올바르지 않습니다." });
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { content: content.trim() },
    });

    return res.status(200).json(comment);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "댓글이 없습니다." });
    }
    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  }
});

// 댓글 삭제
router.delete("/comments/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
      return res.status(400).json({ message: "잘못된 댓글 ID입니다." });
    }

    await prisma.comment.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "댓글이 없습니다." });
    }
    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  }
});

export default router;
