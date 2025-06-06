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
      <section className='section-padding bg-white pt-32'>
        <div className='container text-center'>
          <div className='max-w-4xl mx-auto space-y-8 slideUp'>
            <h1 className='hero-title'>
              긴 영상, <span className='text-gradient'>짧게 읽다</span>
            </h1>
            <p className='hero-subtitle'>
              YouTube 영상 링크를 붙여넣고, InClip이 핵심만 요약해드립니다.
            </p>

            {/* URL Input Form */}
            <form onSubmit={handleSubmit} className='max-w-2xl mx-auto'>
              <div
                className='flex flex-col gap-4'
                style={{ marginBottom: '16px' }}
              >
                <input
                  type='url'
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder='YouTube 영상 링크를 붙여넣어보세요...'
                  className='input text-lg'
                  required
                />
                <button type='submit' className='btn btn-primary btn-lg w-full'>
                  요약하기
                </button>
              </div>
            </form>

            {/* Sub Actions */}
            <div
              className='flex flex-col items-center justify-center gap-6 text-sm'
              style={{ marginTop: '24px' }}
            >
              <div className='flex gap-4'>
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
          <div className='text-center mb-16 slideUp'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              이런 요약을 받아보세요
            </h2>
            <p className='text-xl text-gray-600'>
              실제 사용자들이 요약한 영상들을 미리 확인해보세요
            </p>
          </div>

          <div className='grid md-grid-cols-2 lg-grid-cols-3 gap-8 scaleIn'>
            {loading
              ? // 로딩 상태 표시
                Array(3)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className='sample-card h-full flex flex-col animate-pulse'
                    >
                      <div className='aspect-video bg-gray-200 rounded-lg mb-4'></div>
                      <div className='flex-1 flex flex-col'>
                        <div className='h-6 bg-gray-200 rounded mb-3'></div>
                        <div className='h-4 bg-gray-200 rounded mb-2'></div>
                        <div className='h-4 bg-gray-200 rounded mb-4 w-3/4'></div>
                        <div className='flex gap-2 mb-4'>
                          <div className='h-6 bg-gray-200 rounded-full w-16'></div>
                          <div className='h-6 bg-gray-200 rounded-full w-20'></div>
                        </div>
                        <div className='flex items-center gap-3 mt-auto'>
                          <div className='h-8 bg-gray-200 rounded flex-1'></div>
                          <div className='h-8 w-8 bg-gray-200 rounded'></div>
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
                      className='sample-card h-full flex flex-col'
                    >
                      <div className='aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden relative group'>
                        {videoId ? (
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                            alt={analysis.title}
                            className='w-full h-full object-cover'
                            onError={e => {
                              // 이미지 로드 실패 시 기본 썸네일로 변경
                              ;(
                                e.target as HTMLImageElement
                              ).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                            }}
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center bg-gray-300'>
                            <svg
                              className='w-12 h-12 text-gray-500'
                              fill='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path d='M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z' />
                            </svg>
                          </div>
                        )}
                        {/* 재생 아이콘 오버레이 */}
                        <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30'>
                          <div className='w-14 h-14 bg-white bg-opacity-90 rounded-full flex items-center justify-center'>
                            <svg
                              className='w-5 h-5 text-gray-800 ml-1'
                              fill='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path d='M8 5v14l11-7z' />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className='flex-1 flex flex-col'>
                        <h3 className='font-semibold text-lg mb-3 line-clamp-2 text-gray-900'>
                          {analysis.title}
                        </h3>
                        <p className='text-gray-600 text-sm line-clamp-3 mb-4 flex-1'>
                          {analysis.description}
                        </p>

                        {/* 태그 섹션 */}
                        {analysis.tags && analysis.tags.length > 0 && (
                          <div className='flex flex-wrap gap-2 mb-4'>
                            {analysis.tags.map(tag => (
                              <span
                                key={tag.id}
                                className='bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium'
                              >
                                #{tag.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 버튼 섹션 */}
                        <div className='flex items-center gap-3 mt-auto'>
                          <Link
                            href={`/analysis/${analysis.id}`}
                            className='btn btn-primary btn-sm flex-1'
                          >
                            요약 보기
                          </Link>
                          <button className='text-gray-400 hover:text-red-500 transition-colors p-2'>
                            <svg
                              className='w-5 h-5'
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
            <div className='text-center mb-16 slideUp'>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                왜 InClip인가?
              </h2>
            </div>

            <div className='grid lg-grid-cols-2 gap-16 items-center'>
              {/* Left: Features List */}
              <div className='space-y-8 slideUp'>
                <div className='flex items-start gap-4'>
                  <div className='icon icon-blue flex-shrink-0 mt-1'>
                    <svg
                      className='w-6 h-6'
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
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                      빠르고 정확한 요약
                    </h3>
                    <p className='text-gray-600'>
                      최신 LLM 기술을 활용해 영상의 핵심 내용을 3분 내로
                      정확하게 요약해드립니다.
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='icon icon-lime flex-shrink-0 mt-1'>
                    <svg
                      className='w-6 h-6'
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
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                      로그인 없이도 사용 가능
                    </h3>
                    <p className='text-gray-600'>
                      회원가입 없이도 바로 영상 요약을 체험해볼 수 있습니다.
                      간편하고 빠르게 시작하세요.
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='icon icon-purple flex-shrink-0 mt-1'>
                    <svg
                      className='w-6 h-6'
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
                    <h3 className='text-xl font-semibold text-gray-900 mb-2'>
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
              <div className='bg-gray-50 rounded-2xl p-8 scaleIn'>
                <h3 className='text-2xl font-bold text-gray-900 mb-6'>
                  기술 소개
                </h3>
                <div className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
                    <span className='text-gray-700'>
                      <strong>LLM 요약 기술:</strong> GPT 기반 고도화된 자연어
                      처리
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-3 h-3 bg-lime-500 rounded-full'></div>
                    <span className='text-gray-700'>
                      <strong>자막 기반 분석:</strong> 영상 자막을 활용한 정확한
                      내용 파악
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-3 h-3 bg-purple-500 rounded-full'></div>
                    <span className='text-gray-700'>
                      <strong>프라이버시 보호:</strong> 개인정보 수집 최소화
                    </span>
                  </div>
                </div>

                <div className='mt-8 p-4 bg-white rounded-lg border border-gray-200'>
                  <div className='text-sm text-gray-600 mb-2'>처리 시간</div>
                  <div className='text-2xl font-bold text-gradient'>
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
          <div className='max-w-3xl mx-auto space-y-8 slideUp'>
            <h2 className='text-3xl font-bold text-gray-900'>
              지금 바로 InClip으로 영상 요약을 시작해보세요
            </h2>
            <p className='text-xl text-gray-600'>
              회원가입 없이도 바로 사용 가능합니다
            </p>
            <div
              className='flex flex-col gap-4 justify-center'
              style={{ alignItems: 'center' }}
            >
              <Link href='/analyze' className='btn btn-primary btn-lg'>
                무료로 시작하기
              </Link>
              <Link href='/feed' className='btn btn-secondary'>
                커뮤니티 둘러보기
              </Link>
            </div>
            <p className='text-gray-500 text-sm'>
              * 로그인하면 북마크, 히스토리 등 더 많은 기능을 이용할 수 있습니다
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
