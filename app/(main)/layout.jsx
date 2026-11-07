import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./layout.module.scss";

// (main) 안의 모든 페이지에 공통으로 적용되지만 URL에는 (main)이 붙지 않습니다.
export default function MainLayout({ children }) {
  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.content}>{children}</div>
      <Footer />
    </div>
  );
}
