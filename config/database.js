import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connectDB = async () => {
    try {
        await prisma.$connect();

        console.log('PostgreSQL 연결');
    } catch (error) {
        console.error('PostgreSQL 연결 실패:', error);

        process.exit(1);
    }
};

export { prisma };
export default connectDB;