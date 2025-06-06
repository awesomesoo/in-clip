'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import ProtectedRoute from '@/components/ProtectedRoute'
import Link from 'next/link'
import styles from './history.module.css'

interface AnalysisHistory {
  id: string
  created_at: string
  analysis: {
    id: string
    title: string
    description: string
    youtube_url: string
    user_description?: string
    created_at: string
    tags?: Tag[]
  }
}

interface Tag {
  id: string
  name: string
}

function HistoryPageContent() {
  const { user } = useAuth()
  const [history, setHistory] = useState<AnalysisHistory[]>([])
  const [filteredHistory, setFilteredHistory] = useState<AnalysisHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 필터 상태
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [availableTags, setAvailableTags] = useState<Tag[]>([])

  // 편집 상태
  const [editingAnalysis, setEditingAnalysis] = useState<string>('')
  const [editingValues, setEditingValues] = useState({
    title: '',
    description: '',
    user_description: '',
  })

  useEffect(() => {
    if (user) {
      fetchHistory(user.id)
    }
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [history, selectedTag, selectedPeriod])

  const fetchHistory = async (userId: string) => {
    if (!supabase) {
      // Supabase가 설정되지 않은 경우 샘플 데이터 사용
      const sampleHistory: AnalysisHistory[] = [
        {
          id: '1',
          created_at: new Date().toISOString(),
          analysis: {
            id: '1',
            title: 'React 18 새로운 기능 소개',
            description:
              'React 18의 주요 변경사항과 새로운 기능들을 분석했습니다.',
            youtube_url: 'https://youtube.com/watch?v=sample1',
            user_description: '대학 강의 정리용',
            created_at: new Date().toISOString(),
            tags: [
              { id: '1', name: '프론트엔드' },
              { id: '2', name: '기술' },
            ],
          },
        },
        {
          id: '2',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          analysis: {
            id: '2',
            title: '효과적인 시간 관리 방법',
            description:
              '바쁜 일상 속에서 시간을 효율적으로 관리하는 방법들을 소개합니다.',
            youtube_url: 'https://youtube.com/watch?v=sample2',
            user_description: '개인 개발용',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            tags: [{ id: '3', name: '자기계발' }],
          },
        },
        {
          id: '3',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          analysis: {
            id: '3',
            title: 'Next.js 13 App Router 완벽 가이드',
            description:
              'Next.js 13에서 새롭게 도입된 App Router의 모든 기능을 설명합니다.',
            youtube_url: 'https://youtube.com/watch?v=sample3',
            user_description: '프로젝트 참고용',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            tags: [
              { id: '1', name: '프론트엔드' },
              { id: '4', name: 'Next.js' },
            ],
          },
        },
      ]
      setHistory(sampleHistory)
      setFilteredHistory(sampleHistory)

      // 샘플 태그들 추출
      const tags = Array.from(
        new Set(
          sampleHistory.flatMap(
            item => item.analysis.tags?.map(tag => tag.name) || []
          )
        )
      ).map((name, index) => ({ id: String(index), name }))
      setAvailableTags(tags)

      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('search_history')
        .select(
          `
          id,
          created_at,
          analysis (
            id,
            title,
            description,
            youtube_url,
            user_description,
            created_at,
            analysis_tags (
              tags (
                id,
                name
              )
            )
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      // 태그 데이터 구조 변환
      const formattedHistory =
        data?.map((item: any) => ({
          ...item,
          analysis: {
            id: item.analysis?.id,
            title: item.analysis?.title,
            description: item.analysis?.description,
            youtube_url: item.analysis?.youtube_url,
            user_description: item.analysis?.user_description,
            created_at: item.analysis?.created_at,
            tags:
              item.analysis?.analysis_tags
                ?.map((t: any) => t.tags)
                .filter(Boolean) || [],
          },
        })) || []

      setHistory(formattedHistory)
      setFilteredHistory(formattedHistory)

      // 사용 가능한 태그들 추출
      const tags = Array.from(
        new Set(
          formattedHistory.flatMap(
            item => item.analysis.tags?.map((tag: any) => tag.name) || []
          )
        )
      ).map((name, index) => ({ id: String(index), name }))
      setAvailableTags(tags)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...history]

    // 태그 필터
    if (selectedTag) {
      filtered = filtered.filter(item =>
        item.analysis.tags?.some(tag => tag.name === selectedTag)
      )
    }

    // 기간 필터
    if (selectedPeriod) {
      const now = new Date()
      const filterDate = new Date()

      switch (selectedPeriod) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3)
          break
      }

      filtered = filtered.filter(
        item => new Date(item.created_at) >= filterDate
      )
    }

    setFilteredHistory(filtered)
  }

  const deleteHistory = async (historyId: string, analysisTitle: string) => {
    // 삭제 확인
    if (
      !confirm(
        `"${analysisTitle}" 분석 기록을 정말 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return
    }

    if (!supabase) {
      // 데모 모드에서는 로컬 상태만 업데이트
      const updatedHistory = history.filter(item => item.id !== historyId)
      setHistory(updatedHistory)
      setFilteredHistory(updatedHistory)
      return
    }

    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', historyId)

      if (error) throw error

      const updatedHistory = history.filter(item => item.id !== historyId)
      setHistory(updatedHistory)
      setFilteredHistory(updatedHistory)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const updateAnalysis = async (
    analysisId: string,
    updatedFields: {
      title?: string
      description?: string
      user_description?: string
    }
  ) => {
    if (!supabase) {
      // 데모 모드에서는 로컬 상태만 업데이트
      const updatedHistory = history.map(item =>
        item.analysis.id === analysisId
          ? {
              ...item,
              analysis: { ...item.analysis, ...updatedFields },
            }
          : item
      )
      setHistory(updatedHistory)
      setFilteredHistory(updatedHistory)
      return
    }

    try {
      const { error } = await supabase
        .from('analysis')
        .update(updatedFields)
        .eq('id', analysisId)

      if (error) throw error

      const updatedHistory = history.map(item =>
        item.analysis.id === analysisId
          ? {
              ...item,
              analysis: { ...item.analysis, ...updatedFields },
            }
          : item
      )
      setHistory(updatedHistory)
      setFilteredHistory(updatedHistory)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const startEditAnalysis = (analysisId: string, analysis: any) => {
    setEditingAnalysis(analysisId)
    setEditingValues({
      title: analysis.title || '',
      description: analysis.description || '',
      user_description: analysis.user_description || '',
    })
  }

  const cancelEditAnalysis = () => {
    setEditingAnalysis('')
    setEditingValues({
      title: '',
      description: '',
      user_description: '',
    })
  }

  const saveAnalysis = (analysisId: string) => {
    updateAnalysis(analysisId, editingValues)
    setEditingAnalysis('')
    setEditingValues({
      title: '',
      description: '',
      user_description: '',
    })
  }

  const deleteAllHistory = async () => {
    if (
      !confirm(
        '모든 분석 기록을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      return
    }

    if (!supabase) {
      // 데모 모드에서는 로컬 상태만 업데이트
      setHistory([])
      setFilteredHistory([])
      return
    }

    try {
      const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', user?.id)

      if (error) throw error

      setHistory([])
      setFilteredHistory([])
    } catch (error: any) {
      setError(error.message)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return '오늘'
    } else if (diffDays === 2) {
      return '어제'
    } else if (diffDays <= 7) {
      return `${diffDays - 1}일 전`
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    }
  }

  const extractVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    )
    return match ? match[1] : null
  }

  const getPeriodDisplayName = (period: string) => {
    switch (period) {
      case 'today':
        return '오늘'
      case 'week':
        return '최근 일주일'
      case 'month':
        return '최근 한 달'
      case 'quarter':
        return '최근 3개월'
      default:
        return period
    }
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>분석 기록</h1>
        <p className={styles.subtitle}>
          {user?.user_metadata?.full_name || user?.email}님의 분석한 영상들을
          기록입니다.
        </p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '1rem',
            color: '#dc2626',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      {/* 필터 섹션 */}
      <div className={styles.filterSection}>
        <div className={styles.filterHeader}>
          <h2 className={styles.filterTitle}>필터</h2>
          {filteredHistory.length > 0 && (
            <button
              onClick={() => deleteAllHistory()}
              className={styles.deleteAllBtn}
            >
              <svg
                className={styles.icon}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                />
              </svg>
              전체 기록 삭제
            </button>
          )}
        </div>

        <div className={styles.filterGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>태그별 필터</label>
            <select
              value={selectedTag}
              onChange={e => setSelectedTag(e.target.value)}
              className={styles.filterSelect}
            >
              <option value=''>모든 태그</option>
              {availableTags.map(tag => (
                <option key={tag.id} value={tag.name}>
                  #{tag.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>기간별 필터</label>
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className={styles.filterSelect}
            >
              <option value=''>전체 기간</option>
              <option value='today'>오늘</option>
              <option value='week'>최근 일주일</option>
              <option value='month'>최근 한 달</option>
              <option value='quarter'>최근 3개월</option>
            </select>
          </div>
        </div>

        {(selectedTag || selectedPeriod) && (
          <div className={styles.activeFilters}>
            <span className={styles.activeFiltersLabel}>활성 필터:</span>
            {selectedTag && (
              <span className={`${styles.filterTag} ${styles.filterTagBlue}`}>
                #{selectedTag}
                <button
                  onClick={() => setSelectedTag('')}
                  className={styles.removeFilterBtn}
                >
                  ×
                </button>
              </span>
            )}
            {selectedPeriod && (
              <span className={`${styles.filterTag} ${styles.filterTagGreen}`}>
                {getPeriodDisplayName(selectedPeriod)}
                <button
                  onClick={() => setSelectedPeriod('')}
                  className={styles.removeFilterBtn}
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedTag('')
                setSelectedPeriod('')
              }}
              className={styles.clearAllFilters}
            >
              모든 필터 제거
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className={styles.historyGrid}>
          {filteredHistory.map(item => {
            const videoId = extractVideoId(item.analysis.youtube_url)
            return (
              <div key={item.id} className={styles.historyCard}>
                <div className={styles.cardContent}>
                  {videoId && (
                    <div className={styles.thumbnail}>
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                        alt={item.analysis.title}
                        className={styles.thumbnailImg}
                      />
                    </div>
                  )}
                  <div className={styles.contentArea}>
                    {editingAnalysis === item.analysis.id ? (
                      /* 편집 모드 */
                      <div className={styles.editMode}>
                        <div className={styles.editHeader}>
                          <h3 className={styles.editTitle}>분석 내용 편집</h3>
                          <span className={styles.dateText}>
                            {formatDate(item.created_at)}
                          </span>
                        </div>

                        {/* 제목 편집 */}
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>제목</label>
                          <input
                            type='text'
                            value={editingValues.title}
                            onChange={e =>
                              setEditingValues({
                                ...editingValues,
                                title: e.target.value,
                              })
                            }
                            className={styles.input}
                            placeholder='분석 제목을 입력하세요...'
                          />
                        </div>

                        {/* 설명 편집 */}
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>분석 내용</label>
                          <textarea
                            value={editingValues.description}
                            onChange={e =>
                              setEditingValues({
                                ...editingValues,
                                description: e.target.value,
                              })
                            }
                            className={`${styles.input} ${styles.textarea}`}
                            rows={4}
                            placeholder='분석 내용을 입력하세요...'
                          />
                        </div>

                        {/* 개인 메모 편집 */}
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>개인 메모</label>
                          <input
                            type='text'
                            value={editingValues.user_description}
                            onChange={e =>
                              setEditingValues({
                                ...editingValues,
                                user_description: e.target.value,
                              })
                            }
                            className={styles.input}
                            placeholder='개인 메모를 입력하세요...'
                          />
                        </div>

                        {/* 편집 버튼들 */}
                        <div className={styles.editActions}>
                          <button
                            onClick={() => saveAnalysis(item.analysis.id)}
                            className={styles.saveBtn}
                          >
                            <svg
                              className={styles.icon}
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M5 13l4 4L19 7'
                              />
                            </svg>
                            저장
                          </button>
                          <button
                            onClick={cancelEditAnalysis}
                            className={styles.cancelBtn}
                          >
                            <svg
                              className={styles.icon}
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M6 18L18 6M6 6l12 12'
                              />
                            </svg>
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* 보기 모드 */
                      <div className={styles.viewMode}>
                        <div className={styles.contentHeader}>
                          <h3 className={styles.analysisTitle}>
                            {item.analysis.title}
                          </h3>
                          <div className={styles.metaInfo}>
                            <span className={styles.dateText}>
                              {formatDate(item.created_at)}
                            </span>
                            <button
                              onClick={() =>
                                startEditAnalysis(
                                  item.analysis.id,
                                  item.analysis
                                )
                              }
                              className={styles.editBtn}
                            >
                              <svg
                                className={styles.icon}
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                />
                              </svg>
                              편집
                            </button>
                          </div>
                        </div>

                        <p className={styles.description}>
                          {item.analysis.description}
                        </p>

                        {/* 개인 메모 표시 */}
                        {item.analysis.user_description && (
                          <div className={styles.userMemo}>
                            <label className={styles.memoLabel}>
                              개인 메모
                            </label>
                            <span className={styles.memoText}>
                              {item.analysis.user_description}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 태그 */}
                    {item.analysis.tags && item.analysis.tags.length > 0 && (
                      <div className={styles.tags}>
                        {item.analysis.tags.map(tag => (
                          <span key={tag.id} className={styles.tag}>
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 액션 버튼 */}
                    <div className={styles.actions}>
                      <Link
                        href={`/analysis/${item.analysis.id}`}
                        className={`${styles.actionBtn} ${styles.primaryBtn}`}
                      >
                        분석 보기
                      </Link>
                      <a
                        href={item.analysis.youtube_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className={`${styles.actionBtn} ${styles.secondaryBtn}`}
                      >
                        원본 영상
                      </a>
                      <button
                        onClick={() =>
                          deleteHistory(item.id, item.analysis.title)
                        }
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      >
                        <svg
                          className={styles.icon}
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                          />
                        </svg>
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg
              className={styles.iconLg}
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
          <h3 className={styles.emptyTitle}>
            {selectedTag || selectedPeriod
              ? '조건에 맞는 기록이 없습니다'
              : '아직 분석 기록이 없습니다'}
          </h3>
          <p className={styles.emptyDescription}>
            {selectedTag || selectedPeriod
              ? '다른 필터 조건을 시도해보세요.'
              : '첫 번째 영상을 분석해보세요!'}
          </p>
          <Link
            href='/analyze'
            className={`${styles.actionBtn} ${styles.primaryBtn}`}
          >
            영상 분석하기
          </Link>
        </div>
      )}
    </div>
  )
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryPageContent />
    </ProtectedRoute>
  )
}
