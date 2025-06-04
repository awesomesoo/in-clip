import styles from './CTASection.module.css';

export default function CTASection() {
    return (
        <section className={`section ${styles.cta}`}>
            <div className="container">
                <div className={styles.content}>
                    <h2 className={styles.title}>
                        지금 바로 InClip으로 영상 요약을 시작해보세요.
                    </h2>
                    <p className={styles.subtitle}>
                        회원가입 없이도 바로 사용 가능합니다.
                    </p>
                    <div className={styles.actions}>
                        <a href="#hero" className="btn btn-primary">
                            무료로 시작하기
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
} 