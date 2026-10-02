import express from 'express';
import Product from '../models/Product.js';
import { validateQuery } from '../utils/validate.js';

const router = express.Router();

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
  const regex = new RegExp(keyword, 'i');
  const filter = {
    $or:
      [
        {name: {$regex: regex}},
        {description: {$regex: regex}}
      ]
    };
  const sortOption = {
    recent: {createdAt: 'desc'}
  };
  const offset = (page * pageSize) - pageSize;

  // 요청 응답값 설정
  const products = await Product.find(filter)
    .sort(sortOption[orderBy])
    .skip(offset)
    .limit(pageSize);
  
  const totalCount = await Product.countDocuments({});

  const list = products.map(product => ({
    id: product.id,
    name: product.name,
    price: product.price,
    createdAt: product.createdAt
  }))

  const response = {
    list: list,
    totalCount: totalCount
  }

  res.send(response);
});

// 상품 상세 조회
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404).json({message: '상품을 찾을 수 없습니다.'});
    return;
  }

  const response = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    tags: product.tags
  }

  res.send(response);
});

// 상품 등록
router.post('/', async (req, res) => {
  const response = await Product.create(req.body);

  res.status(201).json(response);
});

// 상품 수정
router.patch('/:id', async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true
  });

  if (!product) {
    res.status(404).json({message: '상품을 찾을 수 없습니다.'});
    return;
  }

  res.json(product);
});

// 상품 삭제
router.delete('/:id', async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);

  if (!deleted) {
    res.status(404).json({message: '상품을 찾을 수 없습니다.'});
    return;
  }

  res.json(deleted);
});

export default router;