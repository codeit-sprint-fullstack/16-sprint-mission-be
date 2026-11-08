import styles from "./Footer.module.scss";
const twitter = "/asset/icon-twitter.png";
const youtube = "/asset/icon-youtube.png";
const instagram = "/asset/icon-instagram.png";
const facebook = "/asset/icon-facebook.png";



const Footer = ()=>{
  return(
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div>
          <p>
            ©codeit - 2024
          </p>
        </div>
        <div className={styles.footerLinks}>
          <a href="/privacy">Privacy Policy</a>
          <a href="/faq">FAQ</a>
        </div>
        <div className={styles.footerSns}>
          <a href="https://www.facebook.com/" target='_blank'>
            <img src={facebook} alt="페이스북 아이콘"/>
          </a>
          <a href="https://x.com/" target='_blank'>
            <img src={twitter} alt="트위터 아이콘"/>
          </a>
          <a href="https://www.youtube.com/" target='_blank'>
            <img src={youtube} alt="유튜브 아이콘"/>
          </a>
          <a href="https://www.instagram.com/" target='_blank'>
            <img src={instagram} alt="인스타그램 아이콘"/>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
