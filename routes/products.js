import express from 'express';
import { prisma } from '../db.js';
import { validateQuery } from '../utils/validate.js';
import { validateBody } from '../middlewares/validate.js';
import { productCreateSchema, productUpdateSchema } from '../schemas/productSchema.js';

const router = express.Router();

// 상품 ID 파싱
function parseId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(404).json({ message: '상품을 찾을 수 없습니다' });
    return;
  }

  req.productId = id;
  next();
}

// 상품 목록 조회
router.get('/', async (req, res) => {
  // 쿼리 검증
  const {
    page,
    pageSize,
    orderBy,
    keyword
  } = validateQuery(req.query);

  // 페이네이션 설정
  const filter = {
    OR: [
      {
        name: {
          contains: keyword,
          mode: 'insensitive',
        }
      },
      {
        description: {
          contains: keyword,
          mode: 'insensitive',
        }
      }
    ]
  };
  const offset = (page * pageSize) - pageSize;

  // 요청 응답값 설정
  const products = await prisma.product.findMany({
    where: filter,
    skip: offset,
    take: pageSize,
    orderBy: { createdAt: orderBy },
    select: {
      id: true,
      name: true,
      price: true,
      createdAt: true
    }
  });
  
  const totalCount = await prisma.product.count({
    where: filter
  });

  const response = {
    list: products,
    totalCount: totalCount
  }

  res.send(response);
});

// 상품 상세 조회
router.get('/:id', parseId, async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.productId },
    include: {
      tags: true,
    }
  });

  if (!product) {
    res.status(404).json({message: '상품을 찾을 수 없습니다.'});
    return;
  }

  const response = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    tags: product.tags.map(tag => tag.name)
  }

  res.send(response);
});

// 상품 등록
router.post('/', validateBody(productCreateSchema), async (req, res) => {
  const { name, description, price, tags } = req.body;

  const response = await prisma.product.create({
    data: {
      name, description, price,
      tags: {
        create: tags.map(tag => ({ name: tag })),
      }
    }
  });

  res.status(201).json(response);
});

// 상품 수정
router.patch('/:id', parseId, validateBody(productUpdateSchema), async (req, res) => {
  const { name, description, price, tags } = req.body;

  if (tags) {
    await prisma.tag.deleteMany({
      where: { productId: req.productId }
    });
  }

  const tagsData = !tags
    || {
      tags: {
        create: tags.map(tag => ({ name: tag }))
      }
    }

  const product = await prisma.product.update({
    where: { id: req.productId },
    data: {
      name, description, price, ...tagsData
    }
  });

  if (!product) {
    res.status(404).json({message: '상품을 찾을 수 없습니다.'});
    return;
  }

  res.json(product);
});

// 상품 삭제
router.delete('/:id', parseId, async (req, res) => {
  const deleted = await prisma.product.delete({
    where: { id: req.productId }
  });

  res.json(deleted);
});

export default router;