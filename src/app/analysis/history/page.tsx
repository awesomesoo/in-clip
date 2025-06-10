'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import styles from './page.module.css'

interface Analysis {
    id: string
    youtube_url: string
    title: string
    description: string
    user_description: string
    summary: string
    created_at: string
    updated_at: string
}

interface AnalysisListResponse {
    success: boolean
    analyses: Analysis[]
    total: number
    limit: number
    offset: number
    error?: string
}

export default function AnalysisHistoryPage() {
    const { user, loading: authLoading } = useAuth()
    const [analyses, setAnalyses] = useState<Analysis[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null)
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    useEffect(() => {
        if (!authLoading && user) {
            loadAnalyses()
        } else if (!authLoading && !user) {
            setLoading(false)
            setError('로그인이 필요합니다.')
        }
    }, [authLoading, user, currentPage])

    const loadAnalyses = async () => {
        if (!user) return

        try {
            setLoading(true)
            console.log('📋 분석 히스토리 로드 시작')

            const offset = (currentPage - 1) * itemsPerPage
            const response = await fetch(
                `/api/analysis/list?user_id=${user.id}&limit=${itemsPerPage}&offset=${offset}`
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data: AnalysisListResponse = await response.json()
            console.log('📋 API 응답:', data)

            if (data.success) {
                setAnalyses(data.analyses)
                setTotal(data.total)
                console.log('✅ 분석 히스토리 로드 성공:', data.analyses.length, '개')
                console.log('📊 첫 번째 분석 데이터:', data.analyses[0])
            } else {
                throw new Error(data.error || '데이터 로드 실패')
            }

        } catch (err) {
            console.error('❌ 분석 히스토리 로드 실패:', err)
            setError(err instanceof Error ? err.message : '알 수 없는 오류')
        } finally {
            setLoading(false)
        }
    }

    const handleCardClick = (analysis: Analysis) => {
        console.log('🖱️ 카드 클릭됨:', analysis.title)
        console.log('📄 분석 요약 길이:', analysis.summary?.length || 0)
        console.log('📄 분석 요약 미리보기:', analysis.summary?.substring(0, 100) || '내용 없음')
        setSelectedAnalysis(analysis)
    }

    const handleModalClose = () => {
        console.log('❌ 모달 닫기')
        setSelectedAnalysis(null)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getYouTubeVideoId = (url: string) => {
        const patterns = [
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
            /^[a-zA-Z0-9_-]{11}$/
        ]

        for (const pattern of patterns) {
            const match = url.match(pattern)
            if (match && match[1]) {
                return match[1]
            }
        }
        return null
    }

    const getYouTubeThumbnail = (url: string) => {
        const videoId = getYouTubeVideoId(url)
        return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null
    }

    const totalPages = Math.ceil(total / itemsPerPage)

    if (authLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>로딩 중...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <h1>❌ 로그인 필요</h1>
                    <p>분석 히스토리를 보려면 로그인해주세요.</p>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>📊 분석 히스토리</h1>
                <p>총 {total}개의 분석 결과</p>
            </div>

            {loading && (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>분석 히스토리를 불러오는 중...</p>
                </div>
            )}

            {error && (
                <div className={styles.error}>
                    <p>❌ {error}</p>
                    <button onClick={loadAnalyses} className={styles.retryButton}>
                        다시 시도
                    </button>
                </div>
            )}

            {!loading && !error && analyses.length === 0 && (
                <div className={styles.empty}>
                    <h2>📝 분석 기록이 없습니다</h2>
                    <p>유튜브 영상을 분석해보세요!</p>
                    <a href="/" className={styles.analyzeButton}>
                        영상 분석하러 가기
                    </a>
                </div>
            )}

            {!loading && !error && analyses.length > 0 && (
                <>
                    <div className={styles.analysesList}>
                        {analyses.map((analysis, index) => (
                            <div
                                key={analysis.id}
                                className={styles.analysisCard}
                                onClick={() => handleCardClick(analysis)}
                            >
                                <div className={styles.cardHeader}>
                                    <div className={styles.thumbnail}>
                                        {getYouTubeThumbnail(analysis.youtube_url) ? (
                                            <img
                                                src={getYouTubeThumbnail(analysis.youtube_url)!}
                                                alt="YouTube 썸네일"
                                                className={styles.thumbnailImage}
                                            />
                                        ) : (
                                            <div className={styles.thumbnailPlaceholder}>
                                                📺
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.cardInfo}>
                                        <h3 className={styles.cardTitle}>{analysis.title}</h3>
                                        <p className={styles.cardDate}>{formatDate(analysis.created_at)}</p>
                                        <p className={styles.cardDescription}>{analysis.description}</p>
                                    </div>
                                </div>
                                <div className={styles.cardSummary}>
                                    {analysis.summary ? (
                                        `${analysis.summary.substring(0, 150)}...`
                                    ) : (
                                        '요약 내용이 없습니다.'
                                    )}
                                </div>

                                {/* 디버깅 정보 */}
                                <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '8px' }}>
                                    ID: {analysis.id} | 요약 길이: {analysis.summary?.length || 0}자
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={styles.paginationButton}
                            >
                                이전
                            </button>

                            <span className={styles.paginationInfo}>
                                {currentPage} / {totalPages}
                            </span>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={styles.paginationButton}
                            >
                                다음
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* 분석 상세 모달 */}
            {selectedAnalysis && (
                <div className={styles.modal} onClick={handleModalClose}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{selectedAnalysis.title}</h2>
                            <button
                                onClick={handleModalClose}
                                className={styles.closeButton}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.modalInfo}>
                                <p><strong>📅 생성일:</strong> {formatDate(selectedAnalysis.created_at)}</p>
                                <p><strong>🔗 URL:</strong> <a href={selectedAnalysis.youtube_url} target="_blank" rel="noopener noreferrer">{selectedAnalysis.youtube_url}</a></p>
                                <p><strong>📝 설명:</strong> {selectedAnalysis.description}</p>
                                <p><strong>🔍 디버깅:</strong> 요약 길이 {selectedAnalysis.summary?.length || 0}자</p>
                            </div>

                            <div className={styles.modalSummary}>
                                <h3>📊 분석 결과</h3>
                                {selectedAnalysis.summary ? (
                                    <div className={styles.summaryContent}>
                                        {selectedAnalysis.summary.split('\n').map((line, index) => {
                                            if (line.startsWith('## ')) {
                                                return <h2 key={index} className={styles.summaryH2}>{line.replace('## ', '')}</h2>
                                            } else if (line.startsWith('### ')) {
                                                return <h3 key={index} className={styles.summaryH3}>{line.replace('### ', '')}</h3>
                                            } else if (line.startsWith('- ')) {
                                                return <li key={index} className={styles.summaryLi}>{line.replace('- ', '')}</li>
                                            } else if (line.trim() === '') {
                                                return <br key={index} />
                                            } else {
                                                return <p key={index} className={styles.summaryP}>{line}</p>
                                            }
                                        })}
                                    </div>
                                ) : (
                                    <div className={styles.error}>
                                        <p>❌ 분석 내용이 없습니다.</p>
                                        <p>데이터베이스에 요약 내용이 저장되지 않았을 수 있습니다.</p>
                                    </div>
                                )}

                                {/* 원본 텍스트 디버깅 */}
                                <details style={{ marginTop: '24px' }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>원본 요약 텍스트 보기 (디버깅)</summary>
                                    <pre style={{
                                        background: '#f5f5f5',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        fontSize: '0.9rem',
                                        whiteSpace: 'pre-wrap',
                                        marginTop: '12px'
                                    }}>
                                        {selectedAnalysis.summary || '내용 없음'}
                                    </pre>
                                </details>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 