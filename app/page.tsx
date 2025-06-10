'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { Analysis } from '@/lib/supabase'

export default function HomePage() {
  const [url, setUrl] = useState('')
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [loading, setLoading] = useState(true)
  const { isSupabaseConfigured } = useAuth()

  useEffect(() => {
    fetchAnalyses()
  }, [])

  const fetchAnalyses = async () => {
    try {
      // Supabase가 설정되지 않았으면 샘플 데이터 사용
      if (!supabase) {
        // 샘플 데이터 설정
        const sampleData: Analysis[] = [
          {
            id: '1',
            youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
            title: 'React 18 새로운 기능 소개',
            description:
              'React 18의 주요 변경사항과 새로운 기능들을 분석했습니다. Concurrent Features, Suspense 개선사항 등을 다룹니다.',
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
            youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
            title: 'TypeScript 타입 시스템 완벽 가이드',
            description:
              'TypeScript의 타입 시스템에 대한 심층 분석입니다. 고급 타입 기법과 실무 활용법을 설명합니다.',
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
            youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
            title: '딥러닝 기초부터 실전까지',
            description:
              '딥러닝의 기본 개념부터 실제 프로젝트까지 다루는 포괄적인 가이드입니다.',
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
        ]
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
        tags: analysis.tags.map((t: any) => t.tag),
      }))

      setAnalyses(formattedData)
    } catch (error) {
      console.error('Error fetching analyses:', error)
      // 에러가 발생하면 샘플 데이터 사용
      const sampleData: Analysis[] = [
        {
          id: '1',
          youtube_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
          title: 'React 18 새로운 기능 소개',
          description:
            'React 18의 주요 변경사항과 새로운 기능들을 분석했습니다.',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      const encodedUrl = encodeURIComponent(url)
      window.location.href = `/analyze?url=${encodedUrl}`
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
                <button type='submit' className='btn btn-primary' style={{ padding: '1rem 2rem', fontSize: '1.125rem', width: '100%' }}>
                  요약하기
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
                  커뮤니티 피드 둘러보기
                </Link>
              </div>
              <span className='text-gray-500'>
                로그인 없이 체험 가능 • 카테고리 태그로 분석 관리
              </span>
            </div>
          </div>
        </div>
      </section>

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
                  try {
                    const urlObj = new URL(url)
                    return (
                      urlObj.searchParams.get('v') ||
                      url.split('v=')[1]?.split('&')[0]
                    )
                  } catch {
                    return url.split('v=')[1]?.split('&')[0]
                  }
                }

                const videoId = getYouTubeVideoId(analysis.youtube_url)

                return (
                  <div
                    key={analysis.id}
                    className='sample-card'
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                  >
                    <div className='aspect-video bg-gray-200 rounded-lg' style={{ marginBottom: '1rem', overflow: 'hidden', position: 'relative' }}>
                      {videoId ? (
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                          alt={analysis.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => {
                            // 이미지 로드 실패 시 기본 썸네일로 변경
                            ; (
                              e.target as HTMLImageElement
                            ).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#d1d5db'
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
                      {/* 재생 아이콘 오버레이 */}
                      <div style={{
                        position: 'absolute',
                        inset: '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: '0',
                        transition: 'opacity 0.3s ease',
                        background: 'rgba(0, 0, 0, 0.3)'
                      }} className='hover-opacity'>
                        <div style={{
                          width: '3.5rem',
                          height: '3.5rem',
                          background: 'rgba(255, 255, 255, 0.9)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <svg
                            style={{ width: '1.25rem', height: '1.25rem', color: '#1f2937', marginLeft: '0.25rem' }}
                            fill='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path d='M8 5v14l11-7z' />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{
                        fontWeight: '600',
                        fontSize: '1.125rem',
                        marginBottom: '0.75rem',
                        color: '#111827',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {analysis.title}
                      </h3>
                      <p style={{
                        color: '#4b5563',
                        fontSize: '0.875rem',
                        marginBottom: '1rem',
                        flex: '1',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {analysis.description}
                      </p>

                      {/* 태그 섹션 */}
                      {analysis.tags && analysis.tags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                          {analysis.tags.map(tag => (
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
                          ))}
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
                      중요한 영상은 북마크하고 개인 메모를 추가해서 나만의 지식
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
                커뮤니티 둘러보기
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
