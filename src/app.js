
import express from "express";
import dotenv from "dotenv";
import articleRoutes from "./routes/articleRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());

// 자유게시판
app.use("/api/articles", articleRoutes);

// 중고마켓
app.use("/api/products", productRoutes);

// 댓글
app.use("/api", commentRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
