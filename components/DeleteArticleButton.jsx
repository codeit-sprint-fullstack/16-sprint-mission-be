"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteArticle } from "@/app/_api/articleApi";
import ConfirmDialog from "./ConfirmDialog";

export default function DeleteArticleButton({ articleId }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const deleting = useRef(false);

  async function handleDelete() {
    if (deleting.current) return;
    deleting.current = true;
    setIsDeleting(true);
    setError("");
    try {
      await deleteArticle(articleId);
      // 삭제된 상세 화면으로 뒤로 가기 하지 않도록 현재 기록을 목록으로 교체합니다.
      router.replace("/boards");
    } catch (requestError) {
      setError(requestError.message);
      setIsDeleting(false);
      deleting.current = false;
    }
  }

  return (
    <>
      <button type="button" disabled={isDeleting} onClick={() => { setError(""); setIsOpen(true); }}>삭제하기</button>
      {isOpen && <ConfirmDialog title="게시글을 삭제할까요?" message="게시글과 작성된 댓글이 함께 삭제되며 되돌릴 수 없습니다."
        error={error} isPending={isDeleting} onConfirm={handleDelete} onCancel={() => setIsOpen(false)} />}
    </>
  );
}
