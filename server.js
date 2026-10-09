import 'dotenv/config';

import app from './app.js';

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    console.log(`서버가 ${PORT}번 포트에서 기다리고 있어요.`);
});