import express from "express";
import cors from "cors";
import { createProductRouter } from "./routes/products.js";
import { createArticleRouter } from "./routes/articles.js";
import { errorHandler } from "./middleware/error-handler.js";
import { HttpError } from "./utils/http-error.js";

export function createApp(prisma, { logger = console } = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.get("/", (req, res) => res.send("Panda Market API"));
  app.use("/products", createProductRouter(prisma));
  app.use("/articles", createArticleRouter(prisma));
  app.use((req, res, next) => {
    next(new HttpError(404, "요청한 경로를 찾을 수 없습니다."));
  });
  app.use(errorHandler(logger));
  return app;
}
