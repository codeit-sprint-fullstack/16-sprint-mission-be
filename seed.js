import { prisma } from './db.js';
import { products } from './data/products.js';
import { tags } from './data/tags.js';
import { articles } from './data/articles.js';
import { comments } from './data/comments.js';

await prisma.$executeRaw`TRUNCATE TABLE products, tags, articles, comments RESTART IDENTITY`;

await prisma.product.createMany({ data: products });
await prisma.tag.createMany({ data: tags });
await prisma.article.createMany({ data: articles });
await prisma.comment.createMany({ data: comments });

console.log(`[시드 데이터 등록 완료]
- 상품 ${products.length}개
- 태그 ${tags.length}개
- 게시글 ${articles.length}개
- 댓글 ${comments.length}개`);

await prisma.$disconnect();