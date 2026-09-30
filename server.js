import 'dotenv/config';

import app from './app.js';
import connectDB from './config/database.js';

const PORT = process.env.PORT ?? 3000;
console.log("1번");

await connectDB();
console.log("2번");
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 기다리고 있어요.`);
});
console.log("3번");