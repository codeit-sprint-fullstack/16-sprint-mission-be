
import { prisma } from './db.js';

async function main() {
  const products = [];

  // 상품 5개 생성
  for (let i = 1; i <= 5; i++) {
    const product = await prisma.product.create({
      data: {
        name: `테스트 상품 ${i}`,
        description: `테스트 상품 ${i}의 설명입니다.`,
        price: i * 10000,
        tags: ['테스트', '중고'],
      },
    });

    products.push(product);
  }

  const articles = [];

  // 게시글 5개 생성
  for (let i = 1; i <= 5; i++) {
    const article = await prisma.article.create({
      data: {
        title: `테스트 게시글 ${i}`,
        content: `테스트 게시글 ${i}의 내용입니다.`,
      },
    });

    articles.push(article);
  }

  // 상품별 댓글 3개씩 생성
  for (const product of products) {
    for (let i = 1; i <= 3; i++) {
      await prisma.productComment.create({
        data: {
          content: `상품 댓글 ${i}입니다.`,
          productId: product.id,
        },
      });
    }
  }

  // 게시글별 댓글 3개씩 생성
  for (const article of articles) {
    for (let i = 1; i <= 3; i++) {
      await prisma.articleComment.create({
        data: {
          content: `게시글 댓글 ${i}입니다.`,
          articleId: article.id,
        },
      });
    }
  }

  console.log('Seed 데이터 생성 완료!');
}

main()
  .catch((error) => {
    console.error('Seed 실행 실패:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
