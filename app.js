import express from 'express';
import cors from 'cors';

import productRouter from './routes/product.routes.js';

const app = express();

app.use(cors());
app.use(express.json());



// app.get('/', (req, res) => {
//   res.send('서버가 살아 있어요 흑흑');
// });

app.use('/api/products', productRouter);


export default app;