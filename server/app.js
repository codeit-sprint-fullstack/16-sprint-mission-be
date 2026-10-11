import express from "express";
import cors from "cors";
import { prisma } from "./db.js";

const app = express();

const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Panda Market API");
});

//전체 목록 불러오기

app.get("/products", async (req, res) => {
  try {
    const offset = Number(req.query.offset ?? 0);
    const limit = Number(req.query.limit ?? 10);
    const keyword = req.query.keyword ?? "";

    if (
      !Number.isInteger(offset) ||
      !Number.isInteger(limit) ||
      offset < 0 ||
      limit <= 0 ||
      typeof keyword !== "string"
    ) {
      return res.status(400).json({
        message: "검색 조건을 확인해주세요.",
      });
    }

    const where = keyword
      ? {
          OR: [
            {
              name: {
                contains: keyword,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: keyword,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

    const products = await prisma.product.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    const totalCount = await prisma.product.count({
      where,
    });

    const list = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      createdAt: product.createdAt,
    }));

    res.status(200).json({
      list,
      totalCount,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "상품 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

//상품 상세 조회

app.get("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "올바르지 않은 상품 ID입니다.",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        message: "상품을 찾을 수 없습니다.",
      });
    }

    const result = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      tags: product.tags,
      createdAt: product.createdAt,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "상품 조회 중 오류가 발생했습니다.",
    });
  }
});

//상품등록

app.post("/products", async (req, res) => {
  try {
    const { name, description, price, tags } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      !Number.isSafeInteger(price) ||
      price < 0 ||
      !Array.isArray(tags) ||
      !tags.every((tag) => typeof tag === "string")
    ) {
      return res.status(400).json({
        message: "상품 정보를 확인해주세요.",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        tags,
      },
    });

    const result = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      tags: product.tags,
      createdAt: product.createdAt,
    };

    res.status(201).json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "상품 등록 중 오류가 발생했습니다.",
    });
  }
});

//상품정보 수정

app.patch("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "올바르지 않은 상품 ID입니다.",
      });
    }

    const { name, description, price, tags } = req.body;

    if (
      (name !== undefined && (typeof name !== "string" || !name.trim())) ||
      (description !== undefined &&
        (typeof description !== "string" || !description.trim())) ||
      (price !== undefined &&
        (!Number.isSafeInteger(price) || price < 0 || price > 2147483647)) ||
      (tags !== undefined &&
        (!Array.isArray(tags) || !tags.every((tag) => typeof tag === "string")))
    ) {
      return res.status(400).json({
        message: "상품 정보를 확인해주세요.",
      });
    }

    const data = {};

    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = price;
    if (tags !== undefined) data.tags = tags;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        message: "수정할 상품 정보를 입력해주세요.",
      });
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    res.status(200).json(product);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "상품을 찾을 수 없습니다.",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "상품 수정 중 오류가 발생했습니다.",
    });
  }
});

//상품 삭제

app.delete("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "올바르지 않은 상품 ID입니다.",
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({
      message: "상품이 삭제되었습니다.",
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        message: "상품을 찾을 수 없습니다.",
      });
    }

    console.error(error);

    res.status(500).json({
      message: "상품 삭제 중 오류가 발생했습니다.",
    });
  }
});

app.get("/articles", async (req, res) => {
  try {
    const offset = Number(req.query.offset ?? 0);
    const limit = Number(req.query.limit ?? 10);
    const keyword = req.query.keyword ?? "";

    if (
      !Number.isSafeInteger(offset) ||
      !Number.isSafeInteger(limit) ||
      offset < 0 ||
      limit <= 0 ||
      typeof keyword !== "string"
    ) {
      return res.status(400).json({
        message: "검색 조건을 확인해주세요.",
      });
    }

    const where = keyword
      ? {
          OR: [
            {
              title: {
                contains: keyword,
                mode: "insensitive",
              },
            },
            {
              content: {
                contains: keyword,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

    const articles = await prisma.article.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: offset,
      take: limit,
    });

    const totalCount = await prisma.article.count({
      where,
    });

    const list = articles.map((article) => ({
      id: article.id,
      title: article.title,
      content: article.content,
      createdAt: article.createdAt,
    }));

    res.status(200).json({
      list,
      totalCount,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "게시글 목록 조회 중 오류가 발생했습니다.",
    });
  }
});

//게시글 등록
app.post("/articles", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: "제목과 내용을 올바르게 입력해주세요.",
      });
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
      },
    });

    res.status(201).json(article);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "게시글 등록 중 오류가 발생했습니다.",
    });
  }
});

//게시물 상세 조회
app.get('/articles/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: '올바르지 않은 게시글 ID입니다.',
      });
    }

    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return res.status(404).json({
        message: '게시글을 찾을 수 없습니다.',
      });
    }

    res.status(200).json(article);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: '게시글 조회 중 오류가 발생했습니다.',
    });
  }
});

//게시물 수정

app.patch('/articles/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: '올바르지 않은 게시글 ID입니다.',
      });
    }

    const { title, content } = req.body ?? {};

    if (
      (title !== undefined &&
        (typeof title !== 'string' || !title.trim())) ||
      (content !== undefined &&
        (typeof content !== 'string' || !content.trim()))
    ) {
      return res.status(400).json({
        message: '게시글 정보를 확인해주세요.',
      });
    }

    const data = {};

    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        message: '수정할 게시글 정보를 입력해주세요.',
      });
    }

    const article = await prisma.article.update({
      where: { id },
      data,
    });

    res.status(200).json(article);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        message: '게시글을 찾을 수 없습니다.',
      });
    }

    console.error(error);

    res.status(500).json({
      message: '게시글 수정 중 오류가 발생했습니다.',
    });
  }
});

//게시물 삭제
app.delete('/articles/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: '올바르지 않은 게시글 ID입니다.',
      });
    }

    await prisma.article.delete({
      where: { id },
    });

    res.status(200).json({
      message: '게시글이 삭제되었습니다.',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        message: '게시글을 찾을 수 없습니다.',
      });
    }

    console.error(error);

    res.status(500).json({
      message: '게시글 삭제 중 오류가 발생했습니다.',
    });
  }
});


app.listen(PORT, () => {
  console.log(`서버가${PORT}번 포트에서 기다리고 있어요.`);
});
