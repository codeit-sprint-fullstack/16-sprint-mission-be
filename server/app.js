import { prisma } from "./db.js";
import { createApp } from "./src/app.js";

const app = createApp(prisma);
const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`서버가 ${port}번 포트에서 기다리고 있어요.`);
});
