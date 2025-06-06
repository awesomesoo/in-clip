'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  getSearchHistory,
  deleteSearchHistory,
  clearSearchHistory,
  addSearchHistory,
  getDemoData,
} from '@/lib/database'

interface SearchHistoryItem {
  id: string
  analysis_id: string
  user_id: string
  created_at: string
  analysis: {
    id: string
    title: string
    youtube_url: string
    created_at: string
  }
}

export default function SearchHistoryManager() {
  const { user } = useAuth()
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    if (user) {
      loadHistory()
    }
  }, [user])

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!isSupabaseConfigured()) {
        // 데모 모드
        setIsDemo(true)
        const demoData = getDemoData()
        setHistory(demoData.searchHistory)
        return
      }

      if (!user) return

      const data = await getSearchHistory(user.id, 20) // 최근 20개
      setHistory(data)
    } catch (err) {
      console.error('검색 기록 로드 오류:', err)
      setError('검색 기록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (isDemo) {
      alert('데모 모드에서는 삭제할 수 없습니다.')
      return
    }

    if (!confirm('이 검색 기록을 삭제하시겠습니까?')) {
      return
    }

    try {
      setError(null)
      await deleteSearchHistory(id)
      await loadHistory()
    } catch (err) {
      console.error('검색 기록 삭제 오류:', err)
      setError('검색 기록을 삭제하는데 실패했습니다.')
    }
  }

  const handleClearAll = async () => {
    if (isDemo) {
      alert('데모 모드에서는 전체 삭제할 수 없습니다.')
      return
    }

    if (
      !confirm(
        '모든 검색 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      return
    }

    if (!user) return

    try {
      setError(null)
      await clearSearchHistory(user.id)
      await loadHistory()
    } catch (err) {
      console.error('검색 기록 전체 삭제 오류:', err)
      setError('검색 기록을 전체 삭제하는데 실패했습니다.')
    }
  }

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    return `${days}일 전`
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* 헤더 */}
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold text-gray-900'>검색 기록</h2>
        <div className='flex gap-2 items-center'>
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm'
            >
              전체 삭제
            </button>
          )}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-md p-4'>
          <p className='text-red-800'>{error}</p>
        </div>
      )}

      {/* 검색 기록 목록 */}
      {history.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <div className='mb-4'>
            <svg
              className='mx-auto h-12 w-12 text-gray-400'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
              />
            </svg>
          </div>
          <p>검색 기록이 없습니다.</p>
          <p className='text-sm mt-1'>
            분석을 조회하면 기록이 여기에 나타납니다.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {history.map(item => (
            <div
              key={item.id}
              className='bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow'
            >
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <h3 className='font-semibold text-gray-900 mb-2'>
                    {item.analysis.title}
                  </h3>

                  <div className='space-y-1'>
                    <p className='text-sm text-gray-600'>
                      🔗{' '}
                      <a
                        href={item.analysis.youtube_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:underline'
                      >
                        YouTube에서 보기
                      </a>
                    </p>

                    <div className='flex justify-between items-center text-xs text-gray-400'>
                      <span>조회: {formatTimeAgo(item.created_at)}</span>
                      <span>
                        생성:{' '}
                        {new Date(item.analysis.created_at).toLocaleDateString(
                          'ko-KR'
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='flex gap-2 ml-4'>
                  <button
                    onClick={() => {
                      // 분석 상세 페이지로 이동 (현재는 URL만 새 탭에서 열기)
                      window.open(`/analysis/${item.analysis.id}`, '_blank')
                    }}
                    className='text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded'
                    title='분석 보기'
                  >
                    📄
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className='text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded'
                    title='기록 삭제'
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 통계 정보 */}
      {history.length > 0 && (
        <div className='bg-blue-50 border border-blue-200 rounded-md p-4'>
          <h3 className='text-sm font-semibold text-blue-900 mb-2'>📊 통계</h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
            <div>
              <span className='text-blue-600 font-medium'>총 기록:</span>
              <span className='ml-1 text-blue-900'>{history.length}개</span>
            </div>
            <div>
              <span className='text-blue-600 font-medium'>최근 조회:</span>
              <span className='ml-1 text-blue-900'>
                {history.length > 0
                  ? formatTimeAgo(history[0].created_at)
                  : '-'}
              </span>
            </div>
            <div>
              <span className='text-blue-600 font-medium'>고유 분석:</span>
              <span className='ml-1 text-blue-900'>
                {new Set(history.map(h => h.analysis_id)).size}개
              </span>
            </div>
            <div>
              <span className='text-blue-600 font-medium'>평균 조회:</span>
              <span className='ml-1 text-blue-900'>
                {history.length > 0
                  ? (
                      history.length /
                      new Set(history.map(h => h.analysis_id)).size
                    ).toFixed(1)
                  : 0}
                회
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
