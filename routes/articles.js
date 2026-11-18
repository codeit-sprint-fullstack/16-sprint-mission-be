import express from 'express';
import { prisma } from '../db.js';
import { validateQuery } from '../utils/validate.js';
import { validateBody } from '../middlewares/validate.js';
import { articleCreateSchema, articleUpdateSchema } from '../schemas/articleSchema.js';

const router = express.Router();

// 게시글 ID 파싱
function parseId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    return;
  }

  req.articleId = id;
  next();
}

// 게시글 목록 조회
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
        title: {
          contains: keyword,
          mode: 'insensitive',
        }
      },
      {
        content: {
          contains: keyword,
          mode: 'insensitive',
        }
      }
    ]
  };
  const offset = (page * pageSize) - pageSize;

  // 요청 응답값 설정
  const articles = await prisma.article.findMany({
    where: filter,
    skip: offset,
    take: pageSize,
    orderBy: { createdAt: orderBy },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true
    }
  });
  
  const totalCount = await prisma.article.count({
    where: filter
  });

  const response = {
    list: articles,
    totalCount: totalCount
  }

  res.send(response);
});

// 게시글 상세 조회
router.get('/:id', parseId, async (req, res) => {
  const article = await prisma.article.findUnique({
    where: { id: req.articleId },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
    }
  });

  if (!article) {
    res.status(404).json({message: '게시글을 찾을 수 없습니다.'});
    return;
  }

  res.send(article);
});

// 게시글 등록
router.post('/', validateBody(articleCreateSchema), async (req, res) => {
  const { title, content } = req.body;

  const response = await prisma.article.create({
    data: { title, content },
  });

  res.status(201).json(response);
});

// 게시글 수정
router.patch('/:id', parseId, validateBody(articleUpdateSchema), async (req, res) => {
  const { title, content } = req.body;

  const article = await prisma.article.update({
    where: { id: req.articleId },
    data: { title, content },
  });

  if (!article) {
    res.status(404).json({message: '게시글을 찾을 수 없습니다.'});
    return;
  }

  res.json(article);
});

// 게시글 삭제
router.delete('/:id', parseId, async (req, res) => {
  const deleted = await prisma.article.delete({
    where: { id: req.articleId }
  });

  res.json(deleted);
});

export default router;