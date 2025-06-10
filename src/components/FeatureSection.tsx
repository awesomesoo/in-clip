import styles from './FeatureSection.module.css';

const features = [
    {
        icon: '⚡',
        title: '빠르고 정확한 요약',
        description: 'LLM 기술을 활용하여 긴 영상의 핵심 내용을 빠르게 요약합니다.'
    },
    {
        icon: '🚀',
        title: '로그인 없이도 사용 가능',
        description: '회원가입 없이 바로 시작할 수 있어 더욱 편리합니다.'
    },
    {
        icon: '📝',
        title: '북마크 및 메모 기능',
        description: '중요한 요약을 저장하고 비공개 메모를 추가할 수 있습니다.'
    },
    {
        icon: '🔒',
        title: '프라이버시 보호',
        description: '개인정보를 안전하게 보호하며 데이터 보안을 최우선으로 합니다.'
    }
];

const techFeatures = [
    'LLM 요약 기술',
    '자막 기반 분석',
    'AI 기반 콘텐츠 이해',
    '다국어 지원'
];

export default function FeatureSection() {
    return (
        <section className={`section ${styles.features}`}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className={styles.title}>왜 InClip인가?</h2>
                    <p className={styles.subtitle}>
                        혁신적인 AI 기술로 YouTube 영상을 더 효율적으로 소비하세요
                    </p>
                </div>

                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.featureCard}>
                            <div className={styles.icon}>{feature.icon}</div>
                            <h3 className={styles.featureTitle}>{feature.title}</h3>
                            <p className={styles.featureDescription}>{feature.description}</p>
                        </div>
                    ))}
                </div>

                <div className={styles.techSection}>
                    <h3 className={styles.techTitle}>핵심 기술</h3>
                    <div className={styles.techGrid}>
                        {techFeatures.map((tech, index) => (
                            <div key={index} className={styles.techBadge}>
                                {tech}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
} 