import express from 'express';
import { prisma } from '../db.js';
import { validateCommentQuery } from '../utils/validate.js';
import { validateBody } from '../middlewares/validate.js';
import { commentCreateSchema, commentUpdateSchema } from '../schemas/commentSchema.js';

const router = express.Router();

// 댓글 ID 파싱
function parseId(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    return;
  }

  req.commentId = id;
  next();
}

// 댓글 목록 조회
router.get('/', async (req, res) => {
  // 쿼리 검증
  const {
    resource,
    resourceId,
    page,
    pageSize,
    cursor
  } = validateCommentQuery(req.query);

  // 페이네이션 설정
  const resourceKey = `${resource}Id`
  const filter = {
    [resourceKey]: resourceId
  }
  const offset = (page * pageSize) - pageSize;
  const cursorData = !cursor
  || {
    cursor: {
      id: cursor
    }
  }

  // 요청 응답값 설정
  const comments = await prisma.comment.findMany({
    where: filter,
    skip: offset,
    take: Number(pageSize),
    select: {
      id: true,
      content: true,
      createdAt: true
    },
    ...cursorData
  });
  
  const totalCount = await prisma.comment.count({
    where: filter
  });

  const lastIndex = comments.length - 1
  const lastComment = comments[lastIndex];
  const nextCursor = lastComment.id + 1;

  const response = {
    list: comments,
    totalCount: totalCount,
    nextCursor: nextCursor || null
  };

  res.send(response);
});

// 댓글 등록
router.post('/', validateBody(commentCreateSchema), async (req, res) => {
  const id = Number(req.query.id);
  const resource = req.query.resource;
  
  const resourceLabels = {
    article: '게시글',
    product: '상품'
  }

  if (!Number.isInteger(id)) {
    res.status(404).json({ message: `${resourceLabels[resource]}을 찾을 수 없습니다.` });
    return;
  }
  
  const { content } = req.body;

  const createCommet = {
    where: { id },
    data: {
      comments: {
        create: { content },
      }
    }
  };

  let response;

  if (resource === 'product')
    response = await prisma.product.update(createCommet);
  if (resource === 'article')
    response = await prisma.article.update(createCommet);
  if (!resourceLabels[resource]) {
    res.status(404).json({message: '댓글 등록에 실패했습니다.'});
    return;
  }
  if (!response) {
    res.status(404).json({message: `${resourceLabels[resource]}을 찾을 수 없습니다.`});
    return;
  }

  res.status(201).json(response);
});

// 댓글 수정
router.patch('/:id', parseId, validateBody(commentUpdateSchema), async (req, res) => {
  const { content } = req.body;

  const comment = await prisma.comment.update({
    where: { id: req.commentId },
    data: { content },
  });

  if (!comment) {
    res.status(404).json({message: '댓글을 찾을 수 없습니다.'});
    return;
  }

  res.json(comment);
});

// 댓글 삭제
router.delete('/:id', parseId, async (req, res) => {
  const deleted = await prisma.comment.delete({
    where: { id: req.commentId }
  });

  res.json(deleted);
});

export default router;