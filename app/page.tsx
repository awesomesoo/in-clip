'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { Analysis } from '@/lib/supabase'

interface YoutubeAnalysis {
  videoId: string
  url: string
  transcript: string
  saved?: boolean
  savedId?: string
  analysis: {
    title: string
    summary: string
    keyPoints: string[]
    category: string
    sentiment: string
    difficulty: string
    duration_estimate: string
    tags: string[]
  }
}

interface Tag {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
}

interface AnalysisWithTags extends Analysis {
  tags: Tag[];
}

export default function HomePage() {
  const [url, setUrl] = useState('')
  const [analyses, setAnalyses] = useState<AnalysisWithTags[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<YoutubeAnalysis | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const { user } = useAuth()



  useEffect(() => {
    fetchAnalyses()
  }, [])

  const fetchAnalyses = async () => {
    try {
      // 강제로 샘플 데이터 사용 (테스트용)
      console.log('🎬 샘플 데이터 강제 사용!')
      if (true) { // 임시로 true로 변경
        // 샘플 데이터 설정 (실제 YouTube 비디오 ID 사용)
        const sampleData = [
          {
            id: '1',
            youtube_url: 'https://youtube.com/watch?v=Tn6-PIqc4UM',
            title: 'React in 100 Seconds',
            description: 'React의 핵심 개념을 100초만에 배워보세요.',
            ai_summary: 'React는 현대 웹 개발의 핵심 라이브러리입니다. 컴포넌트 기반 아키텍처, 가상 DOM, JSX 문법 등 React의 주요 특징들을 간단명료하게 설명합니다.',
            key_points: [
              '컴포넌트 기반 UI 개발',
              '가상 DOM으로 성능 최적화',
              'JSX 문법의 편리함',
              '현대적인 웹 개발 패러다임'
            ],
            category: '프론트엔드',
            sentiment: '긍정적',
            difficulty: '초급',
            duration_estimate: '2분',
            ai_tags: ['React', '프론트엔드', 'JavaScript', '웹개발'],
            video_id: 'Tn6-PIqc4UM',
            thumbnail_url: 'https://img.youtube.com/vi/Tn6-PIqc4UM/hqdefault.jpg',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: 'sample',
            tags: [
              {
                id: '1',
                name: '프론트엔드',
                created_at: new Date().toISOString(),
                user_id: 'sample',
              },
            ],
          },
          {
            id: '2',
            youtube_url: 'https://youtube.com/watch?v=zQnBQ4tB3ZA',
            title: 'TypeScript in 100 Seconds',
            description: 'TypeScript의 핵심을 빠르게 학습해보세요.',
            ai_summary: 'TypeScript는 JavaScript에 정적 타입을 추가한 언어입니다. 타입 안정성, 개발자 경험 향상, 대규모 애플리케이션 개발에서의 이점을 소개합니다.',
            key_points: [
              'JavaScript의 상위 집합',
              '정적 타입 시스템의 장점',
              '개발 도구와의 완벽한 통합',
              '컴파일 타임 오류 검출'
            ],
            category: '프론트엔드',
            sentiment: '긍정적',
            difficulty: '초급',
            duration_estimate: '2분',
            ai_tags: ['TypeScript', '타입시스템', '프론트엔드', '개발'],
            video_id: 'zQnBQ4tB3ZA',
            thumbnail_url: 'https://img.youtube.com/vi/zQnBQ4tB3ZA/hqdefault.jpg',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: 'sample',
            tags: [
              {
                id: '2',
                name: 'TypeScript',
                created_at: new Date().toISOString(),
                user_id: 'sample',
              },
            ],
          },
          {
            id: '3',
            youtube_url: 'https://youtube.com/watch?v=aircAruvnKk',
            title: 'But what is a neural network?',
            description: '신경망의 기본 개념을 시각적으로 이해해보세요.',
            ai_summary: '3Blue1Brown의 유명한 신경망 설명 영상입니다. 수학적 개념을 직관적인 시각화로 설명하여 머신러닝의 기초를 쉽게 이해할 수 있도록 도와줍니다.',
            key_points: [
              '뉴런과 시냅스의 모델링',
              '가중치와 편향의 역할',
              '활성화 함수의 중요성',
              '딥러닝의 기본 원리'
            ],
            category: 'AI',
            sentiment: '긍정적',
            difficulty: '중급',
            duration_estimate: '19분',
            ai_tags: ['딥러닝', 'AI', '머신러닝', '데이터사이언스'],
            video_id: 'aircAruvnKk',
            thumbnail_url: 'https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: 'sample',
            tags: [
              {
                id: '3',
                name: 'AI',
                created_at: new Date().toISOString(),
                user_id: 'sample',
              },
            ],
          },
        ] as any[]
        setAnalyses(sampleData)
        return
      }

      const { data, error } = await supabase
        .from('analysis')
        .select(
          `
                    *,
                    tags:analysis_tags(
                        tag:tags(*)
                    )
                `
        )
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) throw error

      // 태그 데이터 구조 변환
      const formattedData = data.map(analysis => ({
        ...analysis,
        tags: analysis.tags.map((t: { tag: Tag }) => t.tag),
      }))

      setAnalyses(formattedData)
    } catch (error) {
      console.error('Error fetching analyses:', error)
      // 에러가 발생하면 샘플 데이터 사용
      const sampleData: AnalysisWithTags[] = [
        {
          id: '1',
          youtube_url: 'https://youtube.com/watch?v=Tn6-PIqc4UM',
          title: 'React in 100 Seconds',
          description: 'React의 핵심 개념을 100초만에 배워보세요.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'sample',
          tags: [
            {
              id: '1',
              name: '프론트엔드',
              created_at: new Date().toISOString(),
              user_id: 'sample',
            },
          ],
        },
      ]
      setAnalyses(sampleData)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      return
    }

    setAnalyzing(true)
    setAnalysisError(null)
    setAnalysisResult(null)

    try {
      const response = await fetch('/api/youtube-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '분석 중 오류가 발생했습니다.')
      }

      if (data.success && data.data) {
        setAnalysisResult(data.data)
        setAnalysisError(null)

        // 분석 결과가 저장되었으면 목록 새로고침
        if (data.data.saved) {
          fetchAnalyses()
        }

        // 분석 결과로 스크롤
        setTimeout(() => {
          document.getElementById('analysis-result')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }, 100)
      } else if (data.error) {
        setAnalysisError(data.error)
        setAnalysisResult(null)
      } else {
        setAnalysisError('예상과 다른 응답을 받았습니다.')
        setAnalysisResult(null)
      }
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setAnalyzing(false)
    }
  }

  const scrollToSamples = () => {
    document.getElementById('samples')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Hero Section */}
      <section className='section-padding bg-white' style={{ paddingTop: '8rem' }}>
        <div className='container text-center'>
          <div className='max-w-4xl mx-auto' style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h1 className='hero-title'>
              긴 영상, <span className='text-gradient'>짧게 읽다</span>
            </h1>
            <p className='hero-subtitle'>
              YouTube 영상 링크를 붙여넣고, InClip이 핵심만 요약해드립니다.
            </p>

            {/* URL Input Form */}
            <form onSubmit={handleSubmit} className='max-w-2xl mx-auto'>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}
              >
                <input
                  type='url'
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder='YouTube 영상 링크를 붙여넣어보세요...'
                  className='input'
                  style={{ fontSize: '1.125rem' }}
                  required
                />
                <button
                  type='submit'
                  className='btn btn-primary'
                  style={{ padding: '1rem 2rem', fontSize: '1.125rem', width: '100%' }}
                  disabled={analyzing}
                >
                  {analyzing ? '분석중...' : '요약하기'}
                </button>
              </div>
            </form>



            {/* Sub Actions */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1.5rem',
                fontSize: '0.875rem',
                marginTop: '1.5rem'
              }}
            >
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={scrollToSamples}
                  className='text-blue-600 underline'
                  style={{
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                  }}
                >
                  예시 보기
                </button>
                <Link href='/feed' className='text-blue-600 underline'>
                  다른 사용자의 분석 둘러보기
                </Link>
              </div>
              <span className='text-gray-500'>
                로그인 없이 체험 가능 • 카테고리 태그로 분석 관리
              </span>
            </div>
          </div>
        </div>
      </section>



      {/* Analysis Result Section */}
      {(analyzing || analysisResult || analysisError) && (
        <section id='analysis-result' className='section-padding bg-white border-t border-gray-200'>
          <div className='container'>
            <div className='max-w-4xl mx-auto'>
              {analyzing && (
                <div className='text-center' style={{ padding: '2rem' }}>
                  <div className='animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4'></div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                    영상을 분석하고 있습니다...
                  </h3>
                  <p style={{ color: '#6b7280' }}>
                    자막을 추출하고 AI가 내용을 분석하는 중입니다. 잠시만 기다려주세요.
                  </p>
                </div>
              )}

              {analysisError && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
                  <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>❌</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#dc2626', marginBottom: '1rem' }}>
                    분석 실패
                  </h3>
                  <p style={{ color: '#dc2626', marginBottom: '1rem' }}>
                    {analysisError}
                  </p>
                  <button
                    onClick={() => {
                      setAnalysisError(null)
                      setUrl('')
                    }}
                    className='btn btn-outline'
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    다시 시도
                  </button>
                </div>
              )}

              {analysisResult && (
                <div className='bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden'>
                  {/* 영상 정보 헤더 */}
                  <div className='bg-gradient-to-r from-blue-50 to-indigo-50 p-6'>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>
                      <div style={{ flex: '0 0 auto' }}>
                        <img
                          src={`https://img.youtube.com/vi/${analysisResult.videoId}/hqdefault.jpg`}
                          alt='비디오 썸네일'
                          className='rounded-lg'
                          style={{ width: '160px', height: '120px', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ flex: '1', minWidth: '0' }}>
                        <h2 style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#111827',
                          marginBottom: '1rem',
                          lineHeight: '1.3'
                        }}>
                          {analysisResult.analysis.title}
                        </h2>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                          <span className='badge badge-primary'>{analysisResult.analysis.category}</span>
                          <span className='badge badge-outline'>{analysisResult.analysis.difficulty}</span>
                          <span className='badge badge-outline'>{analysisResult.analysis.sentiment}</span>
                          <span className='badge badge-outline'>⏱️ {analysisResult.analysis.duration_estimate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 분석 내용 */}
                  <div className='p-6'>
                    {/* 요약 */}
                    <div style={{ marginBottom: '2rem' }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        📋 요약
                      </h3>
                      <p style={{
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        color: '#374151',
                        background: '#f9fafb',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb'
                      }}>
                        {analysisResult.analysis.summary}
                      </p>
                    </div>

                    {/* 주요 포인트 */}
                    <div style={{ marginBottom: '2rem' }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        🎯 주요 포인트
                      </h3>
                      <ul style={{ listStyle: 'none', padding: '0' }}>
                        {analysisResult.analysis.keyPoints.map((point, index) => (
                          <li
                            key={index}
                            style={{
                              padding: '0.75rem',
                              marginBottom: '0.5rem',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '0.5rem',
                              display: 'flex',
                              alignItems: 'start',
                              gap: '0.75rem'
                            }}
                          >
                            <span style={{
                              background: '#3b82f6',
                              color: 'white',
                              borderRadius: '50%',
                              width: '1.5rem',
                              height: '1.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              flexShrink: '0'
                            }}>
                              {index + 1}
                            </span>
                            <span style={{ color: '#374151', lineHeight: '1.5' }}>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 태그 */}
                    <div style={{ marginBottom: '2rem' }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        🏷️ 관련 태그
                      </h3>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {analysisResult.analysis.tags.map((tag, index) => (
                          <span
                            key={index}
                            className='badge badge-secondary'
                            style={{ fontSize: '0.875rem' }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      paddingTop: '1.5rem',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      <button
                        onClick={() => window.open(analysisResult.url, '_blank')}
                        className='btn btn-primary'
                        style={{ flex: '1' }}
                      >
                        🎥 원본 영상 보기
                      </button>
                      {analysisResult.saved && (
                        <button
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = '/analyze'
                            link.click()
                          }}
                          className='btn btn-secondary'
                          style={{ padding: '0.75rem 1.5rem' }}
                        >
                          📋 내 분석 기록 보기
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setAnalysisResult(null)
                          setUrl('')
                        }}
                        className='btn btn-outline'
                        style={{ padding: '0.75rem 1.5rem' }}
                      >
                        새로 분석하기
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Sample Results Section */}
      <section id='samples' className='section-padding bg-gray-50'>
        <div className='container'>
          <div className='text-center' style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
              이런 요약을 받아보세요
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#4b5563' }}>
              실제 사용자들이 요약한 영상들을 미리 확인해보세요
            </p>
          </div>

          <div className='grid md-grid-cols-2 lg-grid-cols-3' style={{ gap: '2rem' }}>
            {loading
              ? // 로딩 상태 표시
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className='sample-card'
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}
                  >
                    <div className='aspect-video bg-gray-200 rounded-lg' style={{ marginBottom: '1rem' }}></div>
                    <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: '1.5rem', background: '#e5e7eb', borderRadius: '0.25rem', marginBottom: '0.75rem' }}></div>
                      <div style={{ height: '1rem', background: '#e5e7eb', borderRadius: '0.25rem', marginBottom: '0.5rem' }}></div>
                      <div style={{ height: '1rem', background: '#e5e7eb', borderRadius: '0.25rem', marginBottom: '1rem', width: '75%' }}></div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ height: '1.5rem', background: '#e5e7eb', borderRadius: '9999px', width: '4rem' }}></div>
                        <div style={{ height: '1.5rem', background: '#e5e7eb', borderRadius: '9999px', width: '5rem' }}></div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto' }}>
                        <div style={{ height: '2rem', background: '#e5e7eb', borderRadius: '0.25rem', flex: '1' }}></div>
                        <div style={{ height: '2rem', width: '2rem', background: '#e5e7eb', borderRadius: '0.25rem' }}></div>
                      </div>
                    </div>
                  </div>
                ))
              : // 실제 데이터 표시
              analyses.map(analysis => {
                // YouTube 비디오 ID 추출 개선
                const getYouTubeVideoId = (url: string) => {
                  console.log('🎬 URL 처리 중:', url)
                  try {
                    const urlObj = new URL(url)
                    const videoId = urlObj.searchParams.get('v') || url.split('v=')[1]?.split('&')[0]
                    console.log('🎬 추출된 비디오 ID:', videoId)
                    return videoId
                  } catch {
                    const videoId = url.split('v=')[1]?.split('&')[0]
                    console.log('🎬 Fallback 비디오 ID:', videoId)
                    return videoId
                  }
                }

                // 전체 analysis 객체 확인
                console.log('🎬 Analysis 객체:', analysis)

                // 샘플 데이터에 video_id가 있으면 우선 사용
                const videoId = (analysis as any).video_id || getYouTubeVideoId(analysis.youtube_url)
                console.log('🎬 video_id 필드:', (analysis as any).video_id)
                console.log('🎬 youtube_url:', analysis.youtube_url)
                console.log('🎬 최종 사용할 비디오 ID:', videoId, 'for', analysis.title)

                return (
                  <div
                    key={analysis.id}
                    className='sample-card'
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <div
                      className='aspect-video bg-gray-200 rounded-lg'
                      style={{
                        marginBottom: '1rem',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(analysis.youtube_url, '_blank')}
                    >
                      {videoId ? (
                        <>
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                            alt={analysis.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.3s ease'
                            }}
                            onLoad={() => console.log('🎬 썸네일 로드 성공:', videoId)}
                            onError={e => {
                              console.log('🎬 maxres 실패, hq로 시도:', videoId)
                              // 이미지 로드 실패 시 기본 썸네일로 변경
                              const target = e.target as HTMLImageElement
                              target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                              target.onerror = () => {
                                console.log('🎬 hq도 실패, 기본 이미지로:', videoId)
                                target.style.display = 'none'
                              }
                            }}
                          />
                          {/* YouTube 로고 오버레이 */}
                          <div style={{
                            position: 'absolute',
                            bottom: '0.5rem',
                            left: '0.5rem',
                            background: 'rgba(0, 0, 0, 0.8)',
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: '500'
                          }}>
                            YouTube
                          </div>
                        </>
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)'
                        }}>
                          <svg
                            style={{ width: '3rem', height: '3rem', color: '#6b7280' }}
                            fill='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path d='M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z' />
                          </svg>
                        </div>
                      )}

                      {/* 재생 시간 오버레이 (우하단) */}
                      {(analysis as any).duration_estimate && (
                        <div style={{
                          position: 'absolute',
                          bottom: '0.5rem',
                          right: '0.5rem',
                          background: 'rgba(0, 0, 0, 0.8)',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '500'
                        }}>
                          {(analysis as any).duration_estimate}
                        </div>
                      )}

                      {/* 재생 아이콘 오버레이 */}
                      <div style={{
                        position: 'absolute',
                        inset: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: '0',
                        transition: 'opacity 0.3s ease',
                        background: 'rgba(0, 0, 0, 0.4)'
                      }} className='hover-opacity'>
                        <div style={{
                          width: '4rem',
                          height: '4rem',
                          background: 'rgba(255, 255, 255, 0.95)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: 'scale(0.9)',
                          transition: 'transform 0.2s ease'
                        }}>
                          <svg
                            style={{ width: '1.5rem', height: '1.5rem', color: '#dc2626', marginLeft: '0.25rem' }}
                            fill='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path d='M8 5v14l11-7z' />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <h3 style={{
                          fontWeight: '600',
                          fontSize: '1.125rem',
                          color: '#111827',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          flex: '1',
                          marginRight: '0.5rem'
                        }}>
                          {analysis.title}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#9ca3af',
                          whiteSpace: 'nowrap',
                          marginTop: '0.25rem'
                        }}>
                          {new Date(analysis.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <p style={{
                        color: '#4b5563',
                        fontSize: '0.875rem',
                        marginBottom: '1rem',
                        flex: '1',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.4'
                      }}>
                        {(analysis as any).ai_summary || analysis.description}
                      </p>

                      {/* AI 메타데이터 */}
                      {((analysis as any).category || (analysis as any).difficulty || (analysis as any).sentiment) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                          {(analysis as any).category && (
                            <span className='badge badge-primary' style={{ fontSize: '0.75rem' }}>
                              {(analysis as any).category}
                            </span>
                          )}
                          {(analysis as any).difficulty && (
                            <span className='badge badge-outline' style={{ fontSize: '0.75rem' }}>
                              {(analysis as any).difficulty}
                            </span>
                          )}
                          {(analysis as any).sentiment && (
                            <span className='badge badge-outline' style={{ fontSize: '0.75rem' }}>
                              {(analysis as any).sentiment}
                            </span>
                          )}
                          {(analysis as any).duration_estimate && (
                            <span className='badge badge-outline' style={{ fontSize: '0.75rem' }}>
                              ⏱️ {(analysis as any).duration_estimate}
                            </span>
                          )}
                        </div>
                      )}

                      {/* AI 태그 또는 기존 태그 섹션 */}
                      {(((analysis as any).ai_tags && (analysis as any).ai_tags.length > 0) || (analysis.tags && analysis.tags.length > 0)) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                          {/* AI 태그 우선 표시 */}
                          {(analysis as any).ai_tags && (analysis as any).ai_tags.length > 0 ? (
                            (analysis as any).ai_tags.slice(0, 3).map((tag: string, index: number) => (
                              <span
                                key={index}
                                className='bg-blue-100 text-blue-600'
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem',
                                  fontWeight: '500'
                                }}
                              >
                                #{tag}
                              </span>
                            ))
                          ) : (
                            analysis.tags?.slice(0, 3).map(tag => (
                              <span
                                key={tag.id}
                                className='bg-blue-100 text-blue-600'
                                style={{
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.75rem',
                                  fontWeight: '500'
                                }}
                              >
                                #{tag.name}
                              </span>
                            ))
                          )}
                        </div>
                      )}

                      {/* 버튼 섹션 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: 'auto' }}>
                        <Link
                          href={`/analysis/${analysis.id}`}
                          className='btn btn-primary'
                          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', flex: '1' }}
                        >
                          요약 보기
                        </Link>
                        <button style={{
                          color: '#9ca3af',
                          padding: '0.5rem',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'color 0.3s ease'
                        }} className='hover-text-red'>
                          <svg
                            style={{ width: '1.25rem', height: '1.25rem' }}
                            fill='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='section-padding bg-white'>
        <div className='container'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center' style={{ marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
                왜 InClip인가?
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem', alignItems: 'center' }} className='lg-grid-cols-2'>
              {/* Left: Features List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div className='icon icon-blue flex-shrink-0' style={{ marginTop: '0.25rem' }}>
                    <svg
                      style={{ width: '1.5rem', height: '1.5rem' }}
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13 10V3L4 14h7v7l9-11h-7z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                      빠르고 정확한 요약
                    </h3>
                    <p className='text-gray-600'>
                      최신 LLM 기술을 활용해 영상의 핵심 내용을 3분 내로
                      정확하게 요약해드립니다.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div className='icon icon-lime flex-shrink-0' style={{ marginTop: '0.25rem' }}>
                    <svg
                      style={{ width: '1.5rem', height: '1.5rem' }}
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                      로그인 없이도 사용 가능
                    </h3>
                    <p className='text-gray-600'>
                      회원가입 없이도 바로 영상 요약을 체험해볼 수 있습니다.
                      간편하고 빠르게 시작하세요.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div className='icon icon-purple flex-shrink-0' style={{ marginTop: '0.25rem' }}>
                    <svg
                      style={{ width: '1.5rem', height: '1.5rem' }}
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                      북마크 및 메모 기능
                    </h3>
                    <p className='text-gray-600'>
                      중요한 영상은 북마크하고 비공개 메모를 추가해서 나만의 지식
                      라이브러리를 만들어보세요.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Technology Info */}
              <div className='bg-gray-50 rounded-2xl' style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
                  기술 소개
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className='bg-blue-500' style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%' }}></div>
                    <span className='text-gray-700'>
                      <strong>LLM 요약 기술:</strong> GPT 기반 고도화된 자연어
                      처리
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className='bg-lime-500' style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%' }}></div>
                    <span className='text-gray-700'>
                      <strong>자막 기반 분석:</strong> 영상 자막을 활용한 정확한
                      내용 파악
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className='bg-purple-500' style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%' }}></div>
                    <span className='text-gray-700'>
                      <strong>프라이버시 보호:</strong> 개인정보 수집 최소화
                    </span>
                  </div>
                </div>

                <div className='bg-white rounded-lg border border-gray-200' style={{ marginTop: '2rem', padding: '1rem' }}>
                  <div className='text-gray-600' style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>처리 시간</div>
                  <div className='text-gradient' style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                    평균 2.5분
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='section-padding bg-gradient-blue-lime'>
        <div className='container text-center'>
          <div className='max-w-3xl mx-auto' style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#111827' }}>
              지금 바로 InClip으로 영상 요약을 시작해보세요
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#4b5563' }}>
              회원가입 없이도 바로 사용 가능합니다
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Link href='/analyze' className='btn btn-primary' style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
                무료로 시작하기
              </Link>
              <Link href='/feed' className='btn btn-secondary'>
                다른 사용자의 분석 둘러보기
              </Link>
            </div>
            <p className='text-gray-500' style={{ fontSize: '0.875rem' }}>
              * 로그인하면 북마크, 히스토리 등 더 많은 기능을 이용할 수 있습니다
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
