"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.scss";
const pcLogo = "/asset/logo.png";
const mobileLogo = "/asset/ic_mobileLogo.png";

const Header = () => {
  const pathname = usePathname();
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.left}>
          <Link href="/" className={styles.logo}>
            <img className={styles.pcLogo} src={pcLogo} alt="판다마켓로고" />
            <img className={styles.mobileLogo} src={mobileLogo} alt="판다마켓모바일로고" />
          </Link>

          <nav className={styles.nav}>
            <Link href="/boards" className={pathname.startsWith("/boards") ? styles.active : ""} aria-current={pathname.startsWith("/boards") ? "page" : undefined}>자유게시판</Link>
            <Link
              href="/items"
              className={pathname.startsWith("/items") || pathname === "/registration" ? styles.active : ""}
              aria-current={pathname.startsWith("/items") ? "page" : undefined}
            >
              중고마켓
            </Link>
          </nav>
        </div>

        <button className={styles.loginButton} type="button">
          로그인
        </button>
      </div>
    </header>
  );
}

export default Header;
