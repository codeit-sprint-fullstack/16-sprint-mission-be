import { Router } from "express";
import { HttpError } from "../utils/http-error.js";
import { parseCommentInput, parseId, parseLimit } from "../utils/validation.js";
import { toCommentResponse } from "../utils/responses.js";

export function createCommentRouter(prisma, { parentModel, commentModel, parentKey, parentLabel }) {
  const router = Router({ mergeParams: true });
  const comments = prisma[commentModel];
  const parentNotFoundMessage = `${parentLabel}을 찾을 수 없습니다.`;

  router.use((req, res, next) => {
    res.locals.parentId = parseId(req.params.id, `${parentLabel} ID`);
    res.locals.notFoundMessage = "댓글을 찾을 수 없습니다.";
    next();
  });

  router.post("/", async (req, res) => {
    const { content } = parseCommentInput(req.body);
    res.locals.notFoundMessage = parentNotFoundMessage;
    const comment = await comments.create({
      data: { content, [parentModel]: { connect: { id: res.locals.parentId } } },
    });
    res.status(201).json(toCommentResponse(comment));
  });

  router.get("/", async (req, res) => {
    const limit = parseLimit(req.query.limit);
    const cursor = req.query.cursor === undefined ? undefined : parseId(req.query.cursor, "커서");
    const parentId = res.locals.parentId;
    const parent = await prisma[parentModel].findUnique({ where: { id: parentId }, select: { id: true } });
    if (!parent) throw new HttpError(404, parentNotFoundMessage);
    const rows = await comments.findMany({
      where: { [parentKey]: parentId, ...(cursor !== undefined && { id: { lt: cursor } }) },
      orderBy: { id: "desc" },
      take: limit + 1,
    });
    const list = rows.slice(0, limit).map(toCommentResponse);
    res.json({ list, nextCursor: rows.length > limit ? list.at(-1).id : null });
  });

  router.patch("/:commentId", async (req, res) => {
    const id = parseId(req.params.commentId, "댓글 ID");
    const data = parseCommentInput(req.body);
    const comment = await comments.update({ where: { id, [parentKey]: res.locals.parentId }, data });
    res.json(toCommentResponse(comment));
  });

  router.delete("/:commentId", async (req, res) => {
    const id = parseId(req.params.commentId, "댓글 ID");
    await comments.delete({ where: { id, [parentKey]: res.locals.parentId } });
    res.json({ message: "댓글이 삭제되었습니다." });
  });
  return router;
}
