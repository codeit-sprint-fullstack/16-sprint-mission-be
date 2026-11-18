import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const products = await prisma.products.findMany({ orderBy: { id: 'asc' } });
console.log(`상품 ${products.length}개를 읽었어요.`);
console.log(products[0]);

await prisma.$disconnect();