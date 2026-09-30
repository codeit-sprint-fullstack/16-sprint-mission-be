import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);

        console.log('MongoDB연결');
    } catch (error) {
        console.error('MongoDB 실패:', error);

        process.exit(1);
    }
};

export default connectDB;