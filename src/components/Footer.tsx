import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.content}>
                    <div className={styles.links}>
                        <a href="/about">서비스 소개</a>
                        <a href="/terms">이용약관</a>
                        <a href="/privacy">개인정보처리방침</a>
                        <a href="/contact">문의</a>
                    </div>

                    <div className={styles.social}>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                            <span className={styles.socialIcon}>𝕏</span>
                        </a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                            <span className={styles.socialIcon}>📧</span>
                        </a>
                        <a href="mailto:contact@inclip.com">
                            <span className={styles.socialIcon}>📧</span>
                        </a>
                    </div>
                </div>

                <div className={styles.copyright}>
                    <p>&copy; 2024 InClip. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
} 