import mongoose from 'mongoose';
import Product from './models/Product.js';
import { products } from './data/products.js';

await mongoose.connect(process.env.MONGO_URL);

await Product.deleteMany({});
await Product.insertMany(products);

console.log(`상품 ${products.length}개를 넣었어요`);

await mongoose.disconnect();