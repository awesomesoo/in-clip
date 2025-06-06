'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
  params: {
    id: string
  }
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

  useEffect(() => {
    loadAnalysis()
  }, [params.id])

  const loadAnalysis = async () => {
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

        const currentAnalysis = sampleAnalyses.find(a => a.id === params.id)
        if (!currentAnalysis) {
          setError('분석을 찾을 수 없습니다.')
          return
        }

        setAnalysis(currentAnalysis)

        // 관련 분석 (같은 태그를 가진 다른 분석들)
        const related = sampleAnalyses.filter(
          a =>
            a.id !== params.id &&
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
        .eq('id', params.id)
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
    if (!supabase) return

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
        .neq('id', params.id)
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
      <div
        className='section-padding bg-gray-50'
        style={{ minHeight: '100vh' }}
      >
        <div className='container'>
          <div className='max-w-4xl mx-auto'>
            <div className='text-center py-12'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
              <p className='mt-4 text-gray-600'>로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div
        className='section-padding bg-gray-50'
        style={{ minHeight: '100vh' }}
      >
        <div className='container'>
          <div className='max-w-4xl mx-auto'>
            <div className='text-center py-12'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-8 h-8 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-2'>
                분석을 찾을 수 없습니다
              </h3>
              <p className='text-gray-600 mb-4'>
                {error || '요청하신 분석이 존재하지 않습니다.'}
              </p>
              <Link href='/feed' className='btn btn-primary'>
                피드로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const videoId = extractVideoId(analysis.youtube_url)

  return (
    <div className='section-padding bg-gray-50' style={{ minHeight: '100vh' }}>
      <div className='container'>
        <div className='max-w-4xl mx-auto space-y-8'>
          <div className='flex items-center gap-4 mb-6'>
            <Link
              href='/feed'
              className='text-blue-600 hover:text-blue-700 flex items-center gap-1'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
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

          <article className='card'>
            <header className='space-y-4 mb-8'>
              <h1 className='text-3xl font-bold text-gray-900'>
                {analysis.title}
              </h1>

              <div className='flex flex-wrap items-center gap-4 text-sm text-gray-500'>
                <span>작성일: {formatDate(analysis.created_at)}</span>
                {analysis.updated_at !== analysis.created_at && (
                  <span>수정일: {formatDate(analysis.updated_at)}</span>
                )}
              </div>

              {analysis.tags && analysis.tags.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {analysis.tags.map(tag => (
                    <Link
                      key={tag.id}
                      href={`/feed?tag=${encodeURIComponent(tag.name)}`}
                      className='px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors'
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              )}
            </header>

            {/* 유튜브 임베드 */}
            {videoId && (
              <div className='mb-8'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                  영상 시청
                </h2>
                <div className='aspect-video bg-gray-200 rounded-lg overflow-hidden'>
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={analysis.title}
                    frameBorder='0'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                    className='w-full h-full'
                  ></iframe>
                </div>
              </div>
            )}

            <div className='space-y-6'>
              {/* 사용자 메모 */}
              {analysis.user_description && (
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <svg
                      className='w-5 h-5 text-blue-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                      />
                    </svg>
                    <span className='text-sm font-medium text-blue-800'>
                      개인 메모
                    </span>
                  </div>
                  <p className='text-blue-700'>{analysis.user_description}</p>
                </div>
              )}

              <div>
                <h2 className='text-xl font-semibold text-gray-900 mb-3'>
                  유튜브 영상
                </h2>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <Link
                    href={analysis.youtube_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-600 hover:text-blue-700 break-all flex items-center gap-2'
                  >
                    <svg
                      className='w-5 h-5 flex-shrink-0'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                      />
                    </svg>
                    {analysis.youtube_url}
                  </Link>
                </div>
              </div>

              <div>
                <h2 className='text-xl font-semibold text-gray-900 mb-3'>
                  분석 내용
                </h2>
                <div className='prose max-w-none'>
                  <p className='text-gray-700 whitespace-pre-wrap leading-relaxed'>
                    {analysis.description}
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* 관련 분석 */}
          {relatedAnalyses.length > 0 && (
            <div className='card'>
              <h3 className='text-xl font-semibold text-gray-900 mb-6'>
                관련 분석
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {relatedAnalyses.map(relatedAnalysis => {
                  const relatedVideoId = extractVideoId(
                    relatedAnalysis.youtube_url
                  )
                  const thumbnailUrl = relatedVideoId
                    ? `https://img.youtube.com/vi/${relatedVideoId}/mqdefault.jpg`
                    : null

                  return (
                    <Link
                      key={relatedAnalysis.id}
                      href={`/analysis/${relatedAnalysis.id}`}
                      className='block bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all'
                    >
                      {thumbnailUrl && (
                        <img
                          src={thumbnailUrl}
                          alt={relatedAnalysis.title}
                          className='w-full h-32 object-cover rounded-t-lg'
                          onError={e => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                      <div className='p-4'>
                        <h4 className='font-medium text-gray-900 line-clamp-2 mb-2'>
                          {relatedAnalysis.title}
                        </h4>
                        <p className='text-sm text-gray-600 line-clamp-2 mb-2'>
                          {relatedAnalysis.description}
                        </p>
                        {relatedAnalysis.tags &&
                          relatedAnalysis.tags.length > 0 && (
                            <div className='flex flex-wrap gap-1'>
                              {relatedAnalysis.tags.slice(0, 2).map(tag => (
                                <span
                                  key={tag.id}
                                  className='px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded'
                                >
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
            </div>
          )}

          {/* 액션 버튼들 */}
          <div className='bg-white border border-gray-200 rounded-lg p-6'>
            <h3 className='font-semibold text-gray-900 mb-4'>작업</h3>
            <div className='flex flex-wrap gap-3'>
              <button
                onClick={() => {
                  const url = window.location.href
                  navigator.clipboard
                    .writeText(url)
                    .then(() => {
                      alert('링크가 클립보드에 복사되었습니다!')
                    })
                    .catch(() => {
                      alert('링크 복사에 실패했습니다.')
                    })
                }}
                className='btn btn-secondary text-sm flex items-center gap-2'
              >
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                  />
                </svg>
                링크 복사
              </button>
              <Link href='/feed' className='btn btn-outline text-sm'>
                더 많은 분석 보기
              </Link>
              <Link href='/analyze' className='btn btn-outline text-sm'>
                새로운 분석 추가
              </Link>
            </div>
          </div>

          <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
            <h3 className='font-semibold text-blue-900 mb-2'>
              이 분석이 도움이 되셨나요?
            </h3>
            <p className='text-blue-700 text-sm mb-4'>
              다른 유용한 영상들도 커뮤니티에서 확인해보세요!
            </p>
            <div className='flex gap-3'>
              <Link href='/feed' className='btn btn-primary text-sm'>
                더 많은 분석 보기
              </Link>
              <Link href='/analyze' className='btn btn-secondary text-sm'>
                새로운 분석 추가
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
