import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import postsRouter from './routes/products.js';

const app = express();

app.use(cors({origin: process.env.CORS_ORIGIN}));
app.use(express.json());

const PORT = process.env.PORT ?? 3000;
await mongoose.connect(process.env.MONGO_URL);

// 서버 조회
app.get('/', (req, res) => {
  res.send('판다마켓 서버가 실행 중입니다.');
});

app.use('/api/products', postsRouter);

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