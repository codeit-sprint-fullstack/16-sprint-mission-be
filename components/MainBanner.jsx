import styles from "./MainBanner.module.scss";
const mainBannerImage = "/asset/img-main-banner.png";
import Link from "next/link";


const MainBanner = () => {
  return (
    <section className={styles.mainBanner}>
      <div className={styles.bannerWrap}>
        <div className={styles.bannerText}>
          <h2>
            일상의 모든 물건을 거래해 보세요
          </h2>
          <Link href="/items" className={styles.bannerItemBtn}>구경하러 가기</Link>
        </div>
        <div className={styles.bannerImg}>
          <img src={mainBannerImage} alt="메인배너 이미지" />
        </div >
      </div >
    </section >
  );
}

export default MainBanner
