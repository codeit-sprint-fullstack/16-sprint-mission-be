
import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

const isValidId = (id) =>
  Number.isSafeInteger(id) && id > 0;

// 상품 등록
router.post("/", async (req, res) => {
  try {
    const { name, description, price, tags = [] } = req.body;

    if (
      typeof name !== "string" || !name.trim() ||
      typeof description !== "string" || !description.trim() ||
      !Number.isSafeInteger(price) || price < 0 ||
      !Array.isArray(tags) ||
      !tags.every((tag) => typeof tag === "string")
    ) {
      return res.status(400).json({
        message: "상품 정보를 올바르게 입력해주세요.",
      });
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price,
        tags: tags.map((tag) => tag.trim()),
      },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  }
});

// 상품 목록 조회
router.get("/", async (req, res) => {
  try {
    const {
      offset = "0",
      limit = "10",
      orderBy = "recent",
      keyword = "",
    } = req.query;

    const skip = Number(offset);
    const take = Number(limit);

    if (
      !Number.isInteger(skip) || skip < 0 ||
      !Number.isInteger(take) || take < 1 || take > 100 ||
      typeof keyword !== "string" ||
      orderBy !== "recent"
    ) {
      return res.status(400).json({
        message: "조회 조건이 올바르지 않습니다.",
      });
    }

    const where = {
      OR: [
        { name: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
      ],
    };

    const [totalCount, products] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: [
          { createdAt: "desc" },
          { id: "desc" },
        ],
      }),
    ]);

    return res.status(200).json({
      totalCount,
      products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  }
});

// 상품 상세 조회
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
      return res.status(400).json({ message: "잘못된 상품 ID입니다." });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ message: "상품이 없습니다." });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  }
});

// 상품 수정
router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
      return res.status(400).json({ message: "잘못된 상품 ID입니다." });
    }

    const { name, description, price, tags } = req.body;

    if (
      (name === undefined && description === undefined &&
       price === undefined && tags === undefined) ||
      (name !== undefined &&
       (typeof name !== "string" || !name.trim())) ||
      (description !== undefined &&
       (typeof description !== "string" || !description.trim())) ||
      (price !== undefined &&
       (!Number.isSafeInteger(price) || price < 0)) ||
      (tags !== undefined &&
       (!Array.isArray(tags) ||
        !tags.every((tag) => typeof tag === "string")))
    ) {
      return res.status(400).json({
        message: "수정할 상품 정보를 확인해주세요.",
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && {
          description: description.trim(),
        }),
        ...(price !== undefined && { price }),
        ...(tags !== undefined && {
          tags: tags.map((tag) => tag.trim()),
        }),
      },
    });

    return res.status(200).json(product);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "상품이 없습니다." });
    }
    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  }
});

// 상품 삭제
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!isValidId(id)) {
      return res.status(400).json({ message: "잘못된 상품 ID입니다." });
    }

    await prisma.product.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "상품이 없습니다." });
    }
    console.error(error);
    return res.status(500).json({ message: "서버 오류" });
  }
});

export default router;
