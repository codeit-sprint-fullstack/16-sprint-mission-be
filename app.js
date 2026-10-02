import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import Product from './models/Product.js';
import { validateQuery } from './utils/validate.js';

const app = express();

app.use(cors({origin: process.env.CORS_ORIGIN}));
app.use(express.json());

const PORT = process.env.PORT ?? 3000;
await mongoose.connect(process.env.MONGO_URL);

// 서버 조회
app.get('/', (req, res) => {
  res.send('판다마켓 서버가 실행 중입니다.');
});

// 상품 목록 조회
app.get('/api/products', async (req, res) => {
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
app.get('/api/products/:id', async (req, res) => {
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
app.post('/api/products', async (req, res) => {
  const response = await Product.create(req.body);

  res.status(201).json(response);
});

// 상품 수정
app.patch('/api/products/:id', async (req, res) => {
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
app.delete('/api/products/:id', async (req, res) => {
  const deleted = await Product.findByIdAndDelete(req.params.id);

  if (!deleted) {
    res.status(404).json({message: '상품을 찾을 수 없습니다.'});
    return;
  }

  res.json(deleted);
});

// 에러 처리
app.use((req, res) => {
  res.status(404).json({message: '해당 주소를 찾을 수 없습니다.'});
});

app.use((err, req, res, next) => {
  if (err.name === 'CastError') {
    res.status(400).json({message: '잘못된 상품 ID 형식입니다.'});
    return;
  }

  // 스키마 유효성 오류 처리
  if (err.name === 'ValidationError') {
    const field = Object.keys(err.errors)[0];
    const invalidValue = err.errors[field].value;

    // 판매 가격이 문자열로 입력됐을 때
    if (field === 'price' && typeof invalidValue === 'string') {
      res.status(400).json({message: '판매 가격 입력은 숫자로 입력해주세요.'});
      return;
    }

    res.status(400).json({message: err.errors[field].message});
    return;
  }

  if (err.status) {
    res.status(err.status).json({message: '잘못된 요청입니다.'});
    return;
  }

  console.error(err);
  res.status(500).json({message: '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'});
});

app.listen(PORT, () => {
  console.log(`${PORT}번 포트에서 요청을 대기 중입니다.`);
});