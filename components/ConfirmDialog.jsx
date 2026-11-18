"use client";

import { useEffect, useId, useRef } from "react";
import styles from "./ConfirmDialog.module.scss";

export default function ConfirmDialog({ title, message, error, isPending, onConfirm, onCancel }) {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, []);

  return (
    <dialog className={styles.dialog} ref={dialogRef} aria-labelledby={titleId} aria-describedby={descriptionId}
      onCancel={(event) => { event.preventDefault(); if (!isPending) onCancel(); }}>
      <h2 id={titleId}>{title}</h2>
      <p id={descriptionId}>{message}</p>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}>
        <button type="button" disabled={isPending} onClick={onCancel}>취소</button>
        <button className={styles.confirm} type="button" disabled={isPending} onClick={onConfirm}>
          {isPending ? "삭제 중..." : "삭제"}
        </button>
      </div>
    </dialog>
  );
}
