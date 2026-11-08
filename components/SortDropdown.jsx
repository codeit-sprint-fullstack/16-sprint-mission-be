"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./SortDropdown.module.scss";
const arrowDownIcon = "/asset/ic_arrow_down.png";
const sortIcon = "/asset/ic_sort.png";

const SortDropdown = ({
  orderBy,
  setPageNumber,
  onChange,
  className = ""
}) => {

  const [isSortOpen, setIsSortOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const firstItem = useRef(null);
  const menuId = useId();

  const sortLabel = orderBy === "favorite" ? "좋아요순" : "최신순";

  useEffect(() => {
    if (!isSortOpen) return;
    firstItem.current?.focus();
    const closeOutside = (event) => {
      if (!root.current?.contains(event.target)) setIsSortOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
    };
  }, [isSortOpen]);

  function handleKeyDown(event) {
    if (event.key === "Escape" && isSortOpen) {
      event.preventDefault();
      setIsSortOpen(false);
      trigger.current?.focus();
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (isSortOpen) firstItem.current?.focus();
      else setIsSortOpen(true);
    }
  }

  return (
    <div className={`${styles.sortBox} ${className}`} ref={root} onKeyDown={handleKeyDown}>
      <button
        type="button"
        ref={trigger}
        aria-label={`정렬: ${sortLabel}`}
        aria-controls={menuId}
        aria-expanded={isSortOpen}
        aria-haspopup="menu"
        className={styles.sortTrigger}
        onClick={() => setIsSortOpen((prev) => !prev)}
      >
        <span className={styles.sortText}>
          {sortLabel}
        </span>

        <img
          src={arrowDownIcon}
          alt=""
          className={styles.arrowIcon}
        />

        <img
          src={sortIcon}
          alt=""
          className={styles.mobileSortIcon}
        />
      </button>

      {isSortOpen && (
        <div className={styles.sortMenu} role="menu" id={menuId} aria-label="정렬 방식">
          <button
            type="button"
            ref={firstItem}
            role="menuitem"
            onClick={() => {
              onChange?.("recent");
              setPageNumber(1);
              setIsSortOpen(false);
              trigger.current?.focus();
            }}
          >
            최신순
          </button>

        </div>
      )}
    </div>
  );
}

export default SortDropdown;
