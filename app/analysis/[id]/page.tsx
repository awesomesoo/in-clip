'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import styles from './AnalysisDetail.module.css'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

interface Analysis {
  id: string
  title: string
  description: string
  youtube_url: string
  user_description?: string
  created_at: string
  updated_at: string
  tags?: Tag[]
}

interface Tag {
  id: string
  name: string
}

export default function AnalysisDetailPage({ params }: PageProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [relatedAnalyses, setRelatedAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params
      setResolvedParams(resolved)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (resolvedParams) {
      loadAnalysis()
    }
  }, [resolvedParams])

  const loadAnalysis = async () => {
    if (!resolvedParams) return

    try {
      if (!supabase) {
        // Supabase가 설정되지 않은 경우 샘플 데이터 사용
        const sampleAnalyses: Analysis[] = [
          {
            id: '1',
            title: 'React 18 새로운 기능 소개',
            description:
              'React 18의 주요 변경사항과 새로운 기능들을 분석했습니다.\n\n주요 내용:\n1. Concurrent Features - React 18의 가장 큰 변화\n2. Suspense 개선사항 - 데이터 로딩 최적화\n3. Automatic Batching - 성능 향상\n4. useId Hook - SSR 호환성 개선\n\n이러한 새로운 기능들을 통해 React 애플리케이션의 성능과 사용자 경험을 크게 향상시킬 수 있습니다.',
            youtube_url: 'https://youtube.com/watch?v=sample1',
            user_description: '대학 강의 정리용',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: [
              { id: '1', name: '프론트엔드' },
              { id: '2', name: '기술' },
            ],
          },
          {
            id: '2',
            title: '요리 초보를 위한 파스타 만들기',
            description:
              '집에서 간단하게 만들 수 있는 맛있는 파스타 레시피를 소개합니다.\n\n재료:\n- 스파게티 면 200g\n- 마늘 3쪽\n- 올리브오일 3큰술\n- 파마산 치즈\n- 소금, 후추\n\n조리 과정:\n1. 물을 끓여 스파게티를 삶습니다\n2. 팬에 올리브오일과 마늘을 볶아 향을 냅니다\n3. 삶은 스파게티를 팬에 넣고 볶습니다\n4. 파마산 치즈를 뿌려 완성합니다',
            youtube_url: 'https://youtube.com/watch?v=sample2',
            user_description: '주말 요리 연습용',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString(),
            tags: [
              { id: '3', name: '요리' },
              { id: '4', name: '꿀팁' },
            ],
          },
        ]

        const currentAnalysis = sampleAnalyses.find(a => a.id === resolvedParams.id)
        if (!currentAnalysis) {
          setError('분석을 찾을 수 없습니다.')
          return
        }

        setAnalysis(currentAnalysis)

        // 관련 분석 (같은 태그를 가진 다른 분석들)
        const related = sampleAnalyses.filter(
          a =>
            a.id !== resolvedParams.id &&
            a.tags?.some(tag =>
              currentAnalysis.tags?.some(
                currentTag => currentTag.name === tag.name
              )
            )
        )
        setRelatedAnalyses(related)
        return
      }

      const { data: analysisData, error: analysisError } = await supabase
        .from('analysis')
        .select(
          `
                    id,
                    title,
                    description,
                    youtube_url,
                    user_description,
                    created_at,
                    updated_at,
                    analysis_tags (
                        tags (
                            id,
                            name
                        )
                    )
                `
        )
        .eq('id', resolvedParams.id)
        .single()

      if (analysisError || !analysisData) {
        setError('분석을 찾을 수 없습니다.')
        return
      }

      // 태그 데이터 구조 변환
      const formattedAnalysis = {
        ...analysisData,
        tags:
          analysisData.analysis_tags?.map((t: any) => t.tags).filter(Boolean) ||
          [],
      }

      setAnalysis(formattedAnalysis)

      // 관련 분석 로드
      if (formattedAnalysis.tags && formattedAnalysis.tags.length > 0) {
        loadRelatedAnalyses(formattedAnalysis.tags.map(tag => tag.name))
      }
    } catch (error: any) {
      console.error('Error loading analysis:', error)
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const loadRelatedAnalyses = async (tagNames: string[]) => {
    if (!supabase || !resolvedParams) return

    try {
      const { data, error } = await supabase
        .from('analysis')
        .select(
          `
                    id,
                    title,
                    description,
                    youtube_url,
                    created_at,
                    analysis_tags (
                        tags (
                            id,
                            name
                        )
                    )
                `
        )
        .neq('id', resolvedParams.id)
        .limit(3)

      if (error) throw error

      // 같은 태그를 가진 분석들 필터링
      const related =
        data
          ?.filter(analysis =>
            analysis.analysis_tags?.some((tagRelation: any) =>
              tagNames.includes(tagRelation.tags?.name)
            )
          )
          .map(analysis => ({
            ...analysis,
            updated_at: analysis.created_at, // updated_at 필드 추가
            tags:
              analysis.analysis_tags?.map((t: any) => t.tags).filter(Boolean) ||
              [],
          })) || []

      setRelatedAnalyses(related)
    } catch (error) {
      console.error('Error loading related analyses:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    )

    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    if (diffInHours < 48) return '어제'

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const extractVideoId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>분석을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>
            <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <h3 className={styles.errorTitle}>분석을 찾을 수 없습니다</h3>
          <p className={styles.errorMessage}>
            {error || '요청하신 분석이 존재하지 않습니다.'}
          </p>
          <Link href='/feed' className={styles.backButton}>
            피드로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const videoId = extractVideoId(analysis.youtube_url)

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 상단 네비게이션 */}
        <div className={styles.navigation}>
          <Link href='/feed' className={styles.backLink}>
            <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
            피드로 돌아가기
          </Link>
        </div>

        {/* 메인 분석 카드 */}
        <article className={styles.mainCard}>
          {/* 헤더 섹션 */}
          <header className={styles.header}>
            <h1 className={styles.title}>{analysis.title}</h1>

            <div className={styles.metadata}>
              <span className={styles.date}>📅 {formatDate(analysis.created_at)}</span>
              {analysis.updated_at !== analysis.created_at && (
                <span className={styles.date}>🔄 수정일: {formatDate(analysis.updated_at)}</span>
              )}
            </div>

            {/* 태그 */}
            {analysis.tags && analysis.tags.length > 0 && (
              <div className={styles.tagContainer}>
                {analysis.tags.map(tag => (
                  <Link
                    key={tag.id}
                    href={`/feed?tag=${encodeURIComponent(tag.name)}`}
                    className={styles.tag}
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* 유튜브 비디오 섹션 */}
          {videoId && (
            <section className={styles.videoSection}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>🎥</span>
                영상 시청
              </h2>
              <div className={styles.videoWrapper}>
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={analysis.title}
                  frameBorder='0'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                  className={styles.video}
                ></iframe>
              </div>
            </section>
          )}

          {/* 콘텐츠 섹션 */}
          <div className={styles.contentSections}>
            {/* 사용자 메모 */}
            {analysis.user_description && (
              <section className={styles.memoSection}>
                <div className={styles.memoHeader}>
                  <span className={styles.memoIcon}>📝</span>
                  <span className={styles.memoTitle}>비공개 메모</span>
                </div>
                <p className={styles.memoContent}>{analysis.user_description}</p>
              </section>
            )}

            {/* 유튜브 링크 섹션 */}
            <section className={styles.linkSection}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>🔗</span>
                유튜브 영상
              </h2>
              <div className={styles.linkContainer}>
                <Link
                  href={analysis.youtube_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={styles.youtubeLink}
                >
                  <svg className={styles.linkIcon} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                    />
                  </svg>
                  원본 영상에서 보기
                </Link>
              </div>
            </section>

            {/* 분석 내용 섹션 */}
            <section className={styles.analysisSection}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>📄</span>
                분석 내용
              </h2>
              <div className={styles.analysisContent}>
                <div className={styles.contentText}>
                  {analysis.description.split('\n').map((paragraph, index) => (
                    <p key={index} className={styles.paragraph}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </article>

        {/* 관련 분석 섹션 */}
        {relatedAnalyses.length > 0 && (
          <section className={styles.relatedSection}>
            <h3 className={styles.relatedTitle}>
              <span className={styles.sectionIcon}>🔍</span>
              관련 분석
            </h3>
            <div className={styles.relatedGrid}>
              {relatedAnalyses.map(relatedAnalysis => {
                const relatedVideoId = extractVideoId(relatedAnalysis.youtube_url)
                const thumbnailUrl = relatedVideoId
                  ? `https://img.youtube.com/vi/${relatedVideoId}/mqdefault.jpg`
                  : null

                return (
                  <Link
                    key={relatedAnalysis.id}
                    href={`/analysis/${relatedAnalysis.id}`}
                    className={styles.relatedCard}
                  >
                    {thumbnailUrl && (
                      <div className={styles.relatedThumbnail}>
                        <img
                          src={thumbnailUrl}
                          alt={relatedAnalysis.title}
                          className={styles.relatedImage}
                          onError={e => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    )}
                    <div className={styles.relatedContent}>
                      <h4 className={styles.relatedCardTitle}>
                        {relatedAnalysis.title}
                      </h4>
                      <p className={styles.relatedDescription}>
                        {relatedAnalysis.description.substring(0, 80)}...
                      </p>
                      {relatedAnalysis.tags && relatedAnalysis.tags.length > 0 && (
                        <div className={styles.relatedTags}>
                          {relatedAnalysis.tags.slice(0, 2).map(tag => (
                            <span key={tag.id} className={styles.relatedTag}>
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* 액션 섹션 */}
        <section className={styles.actionsSection}>
          <div className={styles.actionsCard}>
            <h3 className={styles.actionsTitle}>
              <span className={styles.sectionIcon}>⚡</span>
              작업
            </h3>
            <div className={styles.actionButtons}>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href)
                    // TODO: 토스트 알림 추가
                  } catch (err) {
                    console.error('클립보드 복사 실패:', err)
                  }
                }}
                className={styles.actionButton}
              >
                <svg className={styles.actionIcon} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                  />
                </svg>
                링크 복사
              </button>
              <Link href='/feed' className={styles.actionButtonSecondary}>
                <span className={styles.sectionIcon}>🌟</span>
                더 많은 분석 보기
              </Link>
              <Link href='/analyze' className={styles.actionButtonSecondary}>
                <span className={styles.sectionIcon}>✨</span>
                새로운 분석 추가
              </Link>
            </div>
          </div>
        </section>

        {/* CTA 섹션 */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <h3 className={styles.ctaTitle}>이 분석이 도움이 되셨나요?</h3>
              <p className={styles.ctaDescription}>
                다른 유용한 영상들도 커뮤니티에서 확인해보세요!
              </p>
              <div className={styles.ctaButtons}>
                <Link href='/feed' className={styles.ctaButtonPrimary}>
                  🚀 더 많은 분석 보기
                </Link>
                <Link href='/analyze' className={styles.ctaButtonSecondary}>
                  📝 새로운 분석 추가
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
