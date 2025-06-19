'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/components/ProtectedRoute'
import AnalysisManager from '@/components/AnalysisManager'
import TagManager from '@/components/TagManager'
import CreateAnalysis from '@/components/CreateAnalysis'
import SearchHistoryManager from '@/components/SearchHistoryManager'
import Link from 'next/link'

interface AnalysisWithTags {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  created_at: string;
  analysis_tags: {
    tags: {
      id: string;
      name: string;
    }[];
  }[];
}

interface UserStats {
  totalAnalyses: number;
  totalHistory: number;
  recentAnalyses: AnalysisWithTags[];
}

function MyPageContent() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<UserStats>({
    totalAnalyses: 0,
    totalHistory: 0,
    recentAnalyses: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      fetchUserStats(user.id)
    }
  }, [user])

  const fetchUserStats = async (userId: string) => {
    if (!supabase) {
      // 데모 데이터 설정
      setStats({
        totalAnalyses: 5,
        totalHistory: 12,
        recentAnalyses: [
          {
            id: '1',
            title: 'React 18 새로운 기능 소개',
            description:
              'React 18의 주요 변경사항과 새로운 기능들을 분석했습니다.',
            youtube_url: 'https://youtube.com/watch?v=demo1',
            created_at: new Date().toISOString(),
            analysis_tags: [
              {
                tags: [{ id: '1', name: '프론트엔드' }],
              },
            ],
          },
          {
            id: '2',
            title: 'TypeScript 타입 시스템',
            description: 'TypeScript의 고급 타입 기법에 대한 분석입니다.',
            youtube_url: 'https://youtube.com/watch?v=demo2',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            analysis_tags: [
              {
                tags: [{ id: '2', name: 'TypeScript' }],
              },
            ],
          },
        ],
      })
      setLoading(false)
      return
    }

    try {
      // 사용자가 작성한 총 분석 수
      const { count: analysisCount } = await supabase
        .from('analysis')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // 사용자의 검색 기록 수
      const { count: historyCount } = await supabase
        .from('search_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // 최근 분석글 3개
      const { data: recentAnalyses } = await supabase
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3)

      setStats({
        totalAnalyses: analysisCount || 0,
        totalHistory: historyCount || 0,
        recentAnalyses: recentAnalyses || [],
      })
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
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

  return (
    <div className='section-padding'>
      <div className='container max-w-4xl'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gradient mb-4'>마이페이지</h1>
          <p className='text-gray-600'>{user?.email}님의 활동 현황입니다.</p>
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 rounded-md p-4 text-red-700 mb-6'>
            {error}
          </div>
        )}

        {loading ? (
          <div className='flex justify-center py-12'>
            <div className='w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
          </div>
        ) : (
          <>
            {/* 통계 카드 */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
              <div className='card text-center'>
                <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-6 h-6 text-blue-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
                    />
                  </svg>
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-1'>
                  {stats.totalAnalyses}
                </h3>
                <p className='text-gray-600'>총 분석</p>
              </div>

              <div className='card text-center'>
                <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-6 h-6 text-green-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-1'>
                  {stats.totalHistory}
                </h3>
                <p className='text-gray-600'>검색 기록</p>
              </div>

              <div className='card text-center'>
                <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-6 h-6 text-purple-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
                    />
                  </svg>
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-1'>
                  {stats.recentAnalyses.reduce(
                    (acc, analysis) =>
                      acc + (analysis.analysis_tags?.length || 0),
                    0
                  )}
                </h3>
                <p className='text-gray-600'>사용한 태그</p>
              </div>
            </div>

            {/* 최근 분석 */}
            <div className='card'>
              <h2 className='text-xl font-semibold mb-6'>최근 분석</h2>
              {stats.recentAnalyses.length > 0 ? (
                <div className='space-y-4'>
                  {stats.recentAnalyses.map(analysis => {
                    const videoId = extractVideoId(analysis.youtube_url)
                    return (
                      <div
                        key={analysis.id}
                        className='border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors'
                      >
                        <div className='flex gap-4'>
                          {videoId && (
                            <div className='flex-shrink-0'>
                              <img
                                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                alt={analysis.title}
                                className='w-32 h-24 object-cover rounded-lg'
                              />
                            </div>
                          )}
                          <div className='flex-1 min-w-0'>
                            <h3 className='text-lg font-medium text-gray-900 mb-2'>
                              {analysis.title}
                            </h3>
                            <p className='text-gray-600 text-sm mb-3 line-clamp-2'>
                              {analysis.description}
                            </p>
                            <div className='flex items-center justify-between'>
                              <div className='flex flex-wrap gap-2'>
                                {analysis.analysis_tags?.[0]?.tags?.map(
                                  (tag: any) => (
                                    <span
                                      key={tag.id}
                                      className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'
                                    >
                                      {tag.name}
                                    </span>
                                  )
                                )}
                              </div>
                              <span className='text-gray-500 text-sm'>
                                {formatDate(analysis.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
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
                        d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                      />
                    </svg>
                  </div>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    아직 분석한 영상이 없습니다
                  </h3>
                  <p className='text-gray-600 mb-4'>
                    첫 번째 영상을 분석해보세요!
                  </p>
                  <Link href='/analyze' className='btn btn-primary'>
                    영상 분석하기
                  </Link>
                </div>
              )}
            </div>

            {/* 빠른 액션 */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Link
                href='/analyze'
                className='card hover:shadow-md transition-shadow'
              >
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-blue-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 4v16m8-8H4'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-lg font-medium text-gray-900'>
                      영상 분석하기
                    </h3>
                    <p className='text-gray-600 text-sm'>
                      새로운 YouTube 영상을 분석합니다
                    </p>
                  </div>
                </div>
              </Link>

              <Link
                href='/history'
                className='card hover:shadow-md transition-shadow'
              >
                <div className='flex items-center gap-4'>
                  <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-green-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-lg font-medium text-gray-900'>
                      내 분석 기록
                    </h3>
                    <p className='text-gray-600 text-sm'>
                      모든 분석 기록을 확인합니다
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function MyPage() {
  return (
    <ProtectedRoute>
      <MyPageContent />
    </ProtectedRoute>
  )
}
