import { prisma } from "./db.js";

try {
  const products = await prisma.product.findMany();

  console.log("DB 연결 성공!");
  console.log("상품 목록:", products);
} catch (error) {
  console.error("DB 연결 실패:", error);
} finally {
  await prisma.$disconnect();
}
