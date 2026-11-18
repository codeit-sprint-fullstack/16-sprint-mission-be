import { HttpError } from "../utils/http-error.js";

export function errorHandler(logger) {
  return (error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof HttpError) {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.code === "P2025" || error.code === "P2003") {
      return res.status(404).json({
        message: res.locals.notFoundMessage ?? "대상을 찾을 수 없습니다.",
      });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ message: "이미 존재하는 데이터입니다." });
    }
    if (error.type === "entity.parse.failed") {
      return res.status(400).json({ message: "JSON 요청 본문을 확인해주세요." });
    }
    if (error.status >= 400 && error.status < 500) {
      return res.status(error.status).json({ message: "요청 형식을 확인해주세요." });
    }
    logger.error(error);
    return res.status(500).json({ message: "서버 오류가 발생했습니다." });
  };
}
