'use client';

import { useState, useEffect } from 'react';
import styles from './Header.module.css';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <div className="container">
                <div className={styles.nav}>
                    <div className={styles.logo}>
                        <a href="/">InClip</a>
                    </div>

                    <div className={`${styles.navLinks} ${isMobileMenuOpen ? styles.open : ''}`}>
                        <a href="/login" className="btn btn-outline">로그인</a>
                        <a href="/signup" className="btn btn-primary">회원가입</a>
                    </div>

                    <button
                        className={styles.mobileToggle}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </header>
    );
} 