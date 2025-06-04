import Image from 'next/image';
import styles from './SampleSection.module.css';

const sampleData = [
    {
        id: 1,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        title: 'React 18의 새로운 기능들 완벽 정리',
        summary: '• Concurrent Rendering으로 더 부드러운 사용자 경험 제공\n• Automatic Batching으로 성능 최적화\n• Suspense의 확장된 기능으로 비동기 처리 개선\n• Strict Mode의 새로운 검사 기능',
        tags: ['GPT 기반 요약', 'AI 자막 분석']
    },
    {
        id: 2,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        title: 'Next.js 15 새로운 기능 완벽 가이드',
        summary: '• App Router의 안정화와 성능 향상\n• Server Components의 개선된 데이터 페칭\n• Turbopack의 빌드 속도 대폭 개선\n• 이미지 최적화 기능 강화',
        tags: ['LLM 요약', '프라이버시 보호']
    },
    {
        id: 3,
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        title: 'TypeScript 5.0 완벽 마스터하기',
        summary: '• Decorators의 정식 지원으로 메타프로그래밍 강화\n• const assertions의 향상된 타입 추론\n• satisfies 연산자로 더 정확한 타입 체크\n• 번들 크기 최적화와 성능 개선',
        tags: ['자막 기반 분석', 'AI 요약']
    }
];

export default function SampleSection() {
    return (
        <section id="samples" className={`section ${styles.samples}`}>
            <div className="container">
                <div className={styles.header}>
                    <h2 className={styles.title}>요약 예시</h2>
                    <p className={styles.subtitle}>
                        InClip이 어떻게 영상을 요약하는지 미리 확인해보세요
                    </p>
                </div>

                <div className={styles.grid}>
                    {sampleData.map((sample) => (
                        <div key={sample.id} className={styles.card}>
                            <div className={styles.thumbnail}>
                                <Image
                                    src={sample.thumbnail}
                                    alt={sample.title}
                                    width={320}
                                    height={180}
                                    className={styles.thumbnailImage}
                                />
                            </div>

                            <div className={styles.content}>
                                <h3 className={styles.cardTitle}>{sample.title}</h3>
                                <div className={styles.summaryPreview}>
                                    {sample.summary.split('\n').map((line, index) => (
                                        <p key={index} className={styles.summaryLine}>
                                            {line}
                                        </p>
                                    ))}
                                </div>

                                <div className={styles.tags}>
                                    {sample.tags.map((tag, index) => (
                                        <span key={index} className={styles.tag}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <button className={`btn btn-outline ${styles.viewBtn}`}>
                                    전체 요약 보기
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
} 