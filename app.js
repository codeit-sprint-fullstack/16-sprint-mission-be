import express from 'express';
import cors from 'cors';


import productRouter from './routes/product.routes.js';
import articleRouter from './routes/article.routes.js'
import commentArticleRouter from './routes/comment.article.routes.js'
import commentProductRouter from './routes/comment.product.routes.js'


const app = express();

app.use(cors());
app.use(express.json());





app.use('/api/products', productRouter);
app.use('/api/articles', articleRouter);
app.use('/api/comments/articles', commentArticleRouter);
app.use('/api/comments/products', commentProductRouter);


export default app;