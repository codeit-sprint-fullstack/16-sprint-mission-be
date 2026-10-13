import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { PrismaPg }from '@prisma/adapter-pg';

const adapter = new PrismaPg({ 
    connectionString : process.env.POSTGRE_URL
 });

const prisma = new PrismaClient({adapter});

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



async function main() {
    await prisma.product.createMany({
        data : Array.from({length : 34}, (_,i) => ({
            name: `상품명 ${i + 1}`,
            description: `${i + 1}번째 점심밥`,
             tags: [`태그${i + 1}`, "테스트"],
            images: [`https://example.com/image.jpg`],
            price: (i + 1) * 1020
        }))
    })

    await prisma.article.createMany({
        data : Array.from({length : 34}, (_,i) => ({
            title : `${i+1}번째 게시글 거래조언구해요`,
            content : `제가 가진 소중한 물건을 ${getRandomIntInclusive(1, 1000000)}원에 팔고 싶어요. 합리적일까요?`
        }))
    })

    await prisma.commentProduct.createMany({
        data : Array.from({length : 34*4}, (_,i) => ({
            content : `반복문이지만 ${i+1}번째 상품 댓글을 정성껏 생성`,
            productId: Math.floor(i / 4) + 1
        }))
    })

    await prisma.comment.createMany({
        data : Array.from({length : 34*2}, (_,i) => ({
            content : `${i}등으로 달린 댓글`,
            articleId: Math.floor(i / 2) + 1
        }))
    })

    console.log("작동끝");
}


main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });