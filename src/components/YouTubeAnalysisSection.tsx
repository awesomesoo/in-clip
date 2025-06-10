'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import styles from './YouTubeAnalysisSection.module.css'

interface SummaryResponse {
    summary?: string
    error?: string
    metadata?: {
        videoId: string
        transcriptLength: number
        summaryLength: number
        hasApiKey: boolean
        timestamp: string
    }
}

interface SaveResponse {
    success?: boolean
    analysis?: any
    message?: string
    error?: string
}

export default function YouTubeAnalysisSection() {
    const { user } = useAuth()
    const [url, setUrl] = useState('')
    const [summary, setSummary] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [debugInfo, setDebugInfo] = useState('')
    const [saveStatus, setSaveStatus] = useState('')

    // YouTube 영상 제목 추출 함수
    const extractVideoTitle = async (videoId: string): Promise<string> => {
        try {
            // YouTube oEmbed API를 사용해서 제목 추출
            const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
            if (response.ok) {
                const data = await response.json()
                return data.title || '제목을 가져올 수 없음'
            }
        } catch (error) {
            console.error('제목 추출 오류:', error)
        }
        return `YouTube 영상 (${videoId})`
    }

    // 분석 결과 저장 함수
    const saveAnalysisResult = async (summary: string, metadata: any) => {
        if (!user) {
            console.log('👤 사용자가 로그인하지 않음 - 저장 건너뜀')
            setSaveStatus('로그인 필요 (저장되지 않음)')
            return
        }

        try {
            setSaveStatus('저장 중...')
            console.log('💾 분석 결과 저장 시작')

            // 영상 제목 추출
            const videoTitle = await extractVideoTitle(metadata.videoId)

            const saveData = {
                youtube_url: url,
                title: videoTitle,
                description: `자막 길이: ${metadata.transcriptLength}자, API 키: ${metadata.hasApiKey ? '설정됨' : '미설정'}`,
                user_description: '',
                summary: summary,
                user_id: user.id
            }

            console.log('📤 저장 데이터:', {
                ...saveData,
                summary: saveData.summary.substring(0, 100) + '...'
            })

            const response = await fetch('/api/analysis/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(saveData),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result: SaveResponse = await response.json()

            if (result.success) {
                console.log('✅ 분석 결과 저장 성공:', result.analysis?.id)
                setSaveStatus('✅ 저장 완료!')
                setDebugInfo(prev => prev + `\n💾 데이터베이스 저장 성공: ${result.analysis?.id}`)
            } else {
                throw new Error(result.error || '저장 실패')
            }

        } catch (error) {
            console.error('❌ 분석 결과 저장 실패:', error)
            setSaveStatus(`❌ 저장 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
            setDebugInfo(prev => prev + `\n💾 저장 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!url.trim()) {
            setError('유튜브 URL을 입력해주세요.')
            return
        }

        setLoading(true)
        setError('')
        setSummary('')
        setDebugInfo('요청 시작...')
        setSaveStatus('')

        try {
            console.log('🚀 요약 요청 시작:', url)
            setDebugInfo(`🚀 요청 시작: ${url}`)

            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url.trim() }),
            })

            console.log('📡 응답 상태:', response.status)
            setDebugInfo(prev => prev + `\n📡 응답 상태: ${response.status}`)

            if (!response.ok) {
                const errorText = await response.text()
                console.error('❌ HTTP 오류:', response.status, errorText)
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
            }

            const data: SummaryResponse = await response.json()
            console.log('📋 응답 데이터:', data)

            // 메타데이터 정보 추가
            let debugMessage = `\n📋 응답 데이터 수신됨`
            if (data.metadata) {
                debugMessage += `\n🎯 비디오 ID: ${data.metadata.videoId}`
                debugMessage += `\n📝 자막 길이: ${data.metadata.transcriptLength}자`
                debugMessage += `\n📄 요약 길이: ${data.metadata.summaryLength}자`
                debugMessage += `\n🔑 API 키: ${data.metadata.hasApiKey ? '설정됨' : '미설정 (데모 모드)'}`
                debugMessage += `\n⏰ 생성 시간: ${data.metadata.timestamp}`
            }
            setDebugInfo(prev => prev + debugMessage)

            if (data.error) {
                console.error('❌ API 오류:', data.error)
                setError(data.error)
                setDebugInfo(prev => prev + `\n❌ API 오류: ${data.error}`)
            } else if (data.summary) {
                console.log('✅ 요약 성공:', data.summary.length, '문자')
                setSummary(data.summary)
                setDebugInfo(prev => prev + `\n✅ 요약 설정 성공!`)
                console.log('요약 내용 미리보기:', data.summary.substring(0, 200) + '...')

                // 분석 결과 자동 저장
                if (data.metadata) {
                    await saveAnalysisResult(data.summary, data.metadata)
                }
            } else {
                console.error('❌ 빈 응답')
                setError('요약 데이터를 받지 못했습니다.')
                setDebugInfo(prev => prev + '\n❌ 빈 응답 데이터')
            }
        } catch (err) {
            console.error('💥 요약 요청 오류:', err)
            const errorMessage = `네트워크 오류: ${err instanceof Error ? err.message : '알 수 없는 오류'}`
            setError(errorMessage)
            setDebugInfo(prev => prev + `\n💥 오류: ${errorMessage}`)
        } finally {
            setLoading(false)
        }
    }

    const handleClear = () => {
        setUrl('')
        setSummary('')
        setError('')
        setDebugInfo('')
        setSaveStatus('')
    }

    return (
        <section className={styles.container}>
            <div className={styles.content}>
                <div className={styles.titleSection}>
                    <h2 className={styles.title}>📺 유튜브 영상 요약</h2>
                    {user && (
                        <Link href="/analysis/history" className={styles.historyLink}>
                            📊 분석 히스토리 보기
                        </Link>
                    )}
                </div>

                {/* 환경 변수 설정 알림 */}
                <div className={styles.setupNotice}>
                    💡 <strong>설정 필요:</strong> GEMINI_API_KEY를 .env.local 파일에 설정해주세요.
                    <a href="/YOUTUBE_ANALYSIS_SETUP.md" target="_blank" className={styles.setupLink}>
                        설정 가이드 보기
                    </a>
                </div>

                {/* 사용자 상태 표시 */}
                <div className={user ? styles.userLoggedIn : styles.userNotLoggedIn}>
                    {user ? (
                        `👤 ${user.email} - 분석 결과가 자동으로 저장됩니다`
                    ) : (
                        '👤 로그인하지 않음 - 분석 결과가 저장되지 않습니다'
                    )}
                </div>

                <p className={styles.description}>
                    유튜브 영상 URL을 입력하시면 AI가 자막을 분석하여 핵심 내용을 요약해드립니다.
                </p>

                {/* 테스트용 URL 버튼들 */}
                <div className={styles.testUrls}>
                    <p className={styles.testUrlsTitle}>🧪 테스트용 영상들:</p>
                    <div className={styles.testUrlButtons}>
                        <button
                            type="button"
                            onClick={() => setUrl('https://www.youtube.com/watch?v=H_kg1s9bBJg')}
                            className={styles.testUrlButton}
                        >
                            테드 강연 (한국어 자막) 🎯
                        </button>
                        <button
                            type="button"
                            onClick={() => setUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                            className={styles.testUrlButton}
                        >
                            Rick Roll 🎵
                        </button>
                        <button
                            type="button"
                            onClick={() => setUrl('https://www.youtube.com/watch?v=fJ9rUzIMcZQ')}
                            className={styles.testUrlButton}
                        >
                            Queen - Bohemian Rhapsody 🎸
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className={styles.input}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !url.trim()}
                            className={styles.submitButton}
                        >
                            {loading ? '분석 중...' : '요약하기'}
                        </button>
                    </div>
                </form>

                {loading && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p className={styles.loadingText}>
                            영상 자막을 분석하고 요약을 생성하고 있습니다...<br />
                            잠시만 기다려주세요.
                        </p>
                    </div>
                )}

                {saveStatus && (
                    <div className={styles.saveStatusContainer}>
                        <p className={styles.saveStatusText}>💾 {saveStatus}</p>
                        {saveStatus.includes('저장 완료') && user && (
                            <Link href="/analysis/history" className={styles.viewHistoryButton}>
                                📊 히스토리에서 확인하기
                            </Link>
                        )}
                    </div>
                )}

                {error && (
                    <div className={styles.errorContainer}>
                        <p className={styles.errorText}>❌ {error}</p>
                        <button onClick={handleClear} className={styles.clearButton}>
                            다시 시도
                        </button>
                    </div>
                )}

                {summary && (
                    <div className={styles.resultContainer}>
                        <div className={styles.resultHeader}>
                            <h3>✅ 요약 완료</h3>
                            <div className={styles.resultActions}>
                                {user && (
                                    <Link href="/analysis/history" className={styles.historyButton}>
                                        📊 히스토리
                                    </Link>
                                )}
                                <button onClick={handleClear} className={styles.clearButton}>
                                    새로 분석
                                </button>
                            </div>
                        </div>
                        <div className={styles.summaryContent}>
                            {summary.split('\n').map((line, index) => {
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

                        {/* 디버깅용 - 원본 텍스트 표시 */}
                        <details className={styles.debugDetails}>
                            <summary>원본 요약 텍스트 보기 (디버깅용)</summary>
                            <pre className={styles.debugPre}>{summary}</pre>
                        </details>
                    </div>
                )}

                {/* 디버깅 정보 표시 */}
                {debugInfo && (
                    <div className={styles.debugContainer}>
                        <h4>🔍 디버깅 정보</h4>
                        <pre className={styles.debugPre}>{debugInfo}</pre>
                    </div>
                )}
            </div>
        </section>
    )
} 