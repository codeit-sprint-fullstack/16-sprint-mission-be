
import prisma from "../src/prisma.js";

async function main() {
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();

  await prisma.article.create({
    data: {
      title: "판다마켓 첫 번째 게시글",
      content: "자유게시판에 오신 것을 환영합니다.",
      comments: {
        create: [
          { content: "첫 번째 댓글입니다." },
          { content: "반갑습니다!" },
        ],
      },
    },
  });

  await prisma.article.create({
    data: {
      title: "중고거래 질문",
      content: "안전하게 중고거래하는 방법이 궁금합니다.",
    },
  });

  console.log("시딩 완료");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
