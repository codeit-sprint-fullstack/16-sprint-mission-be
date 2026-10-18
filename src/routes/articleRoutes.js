
import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

// 게시글 등록
router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (
      typeof title !== "string" || !title.trim() ||
      typeof content !== "string" || !content.trim()
    ) {
      return res.status(400).json({
        message: "제목과 내용을 입력해주세요.",
      });
    }

    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        content: content.trim(),
      },
    });

    return res.status(201).json(article);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  }
});

// 게시글 목록 조회 (검색, 정렬, offset 페이지네이션)
router.get("/", async (req, res) => {
  try {
    const { offset = "0", limit = "10", order = "recent", search = "" } = req.query;

    const skip = Number(offset);
    const take = Number(limit);

    if (
      !Number.isInteger(skip) || skip < 0 ||
      !Number.isInteger(take) || take < 1 || take > 100 ||
      typeof search !== "string" || order !== "recent"
    ) {
      return res.status(400).json({ message: "잘못된 조회 조건입니다." });
    }

    const where = {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ],
    };

    const [totalCount, articles] = await prisma.$transaction([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        skip,
        take,
        orderBy: [
          { createdAt: "desc" },
          { id: "desc" },
        ],
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
        },
      }),
    ]);

    return res.status(200).json({
      totalCount,
      articles,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  }
});

// 게시글 상세 조회
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ message: "잘못된 게시글 ID입니다." });
    }

    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      },
    });

    if (!article) {
      return res.status(404).json({ message: "게시글이 없습니다." });
    }

    return res.status(200).json(article);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  }
});

// 게시글 수정
router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, content } = req.body;

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ message: "잘못된 게시글 ID입니다." });
    }

    if (
      (title === undefined && content === undefined) ||
      (title !== undefined && (typeof title !== "string" || !title.trim())) ||
      (content !== undefined && (typeof content !== "string" || !content.trim()))
    ) {
      return res.status(400).json({ message: "수정할 내용을 확인해주세요." });
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content: content.trim() }),
      },
    });

    return res.status(200).json(article);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "게시글이 없습니다." });
    }

    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  }
});

// 게시글 삭제
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ message: "잘못된 게시글 ID입니다." });
    }

    await prisma.article.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "게시글이 없습니다." });
    }

    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  }
});

export default router;
