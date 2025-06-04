'use client';

import { useState } from 'react';
import styles from './HeroSection.module.css';

export default function HeroSection() {
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            // 요약 페이지로 이동 (나중에 구현)
            console.log('URL 제출:', url);
        }
    };

    const scrollToSamples = () => {
        const samplesSection = document.getElementById('samples');
        samplesSection?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className={styles.hero}>
            <div className="container">
                <div className={styles.content}>
                    <h1 className={styles.title}>
                        긴 영상, 짧게 읽다.
                    </h1>
                    <p className={styles.subtitle}>
                        YouTube 영상 링크를 붙여넣고, InClip이 핵심만 요약해드립니다.
                    </p>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="YouTube 영상 링크를 붙여넣어보세요…"
                                className={styles.input}
                            />
                            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
                                요약하기
                            </button>
                        </div>
                    </form>

                    <div className={styles.actions}>
                        <button onClick={scrollToSamples} className={styles.exampleLink}>
                            예시 보기
                        </button>
                        <p className={styles.notice}>
                            로그인 없이 체험 가능
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
} 