'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useAuth } from '@/lib/auth-context'
import { isSupabaseConfigured } from '@/lib/supabase'
import { createAnalysisWithTags, addSearchHistory } from '@/lib/database'
import AnalysisManager from '@/components/AnalysisManager'
import TagManager from '@/components/TagManager'
import SearchHistoryManager from '@/components/SearchHistoryManager'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './analyze.module.css'

interface AnalysisResult {
  id: string
  title: string
  description: string
  youtube_url: string
  user_description?: string
}

interface Tag {
  id: string
  name: string
}

export default function AnalyzePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [userDescription, setUserDescription] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('manage') // CRUD 탭 관리
  const [refreshKey, setRefreshKey] = useState(0) // 컴포넌트 새로고침용
  const [isEditing, setIsEditing] = useState(false) // 편집 모드
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    user_description: '',
    tags: '',
  })
  const [autoRedirect, setAutoRedirect] = useState(false) // 자동 이동 옵션
  const [redirectCountdown, setRedirectCountdown] = useState(0) // 리다이렉트 카운트다운

  // 파스텔 색상 배열 (태그용)
  const pastelColors = [
    'bg-rose-100 text-rose-700 border-rose-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-violet-100 text-violet-700 border-violet-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-sky-100 text-sky-700 border-sky-200',
    'bg-cyan-100 text-cyan-700 border-cyan-200',
    'bg-teal-100 text-teal-700 border-teal-200',
    'bg-emerald-100 text-emerald-700 border-emerald-200',
    'bg-green-100 text-green-700 border-green-200',
    'bg-lime-100 text-lime-700 border-lime-200',
    'bg-yellow-100 text-yellow-700 border-yellow-200',
    'bg-amber-100 text-amber-700 border-amber-200',
    'bg-orange-100 text-orange-700 border-orange-200',
  ]

  // 태그 이름을 기반으로 일관된 색상 반환
  const getTagColor = (tagName: string) => {
    const hash = tagName
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return pastelColors[hash % pastelColors.length]
  }

  useEffect(() => {
    loadAvailableTags()

    // URL 파라미터에서 url 값 가져오기
    const urlParams = new URLSearchParams(window.location.search)
    const urlParam = urlParams.get('url')
    if (urlParam) {
      setUrl(decodeURIComponent(urlParam))
    }
  }, [user]) // user가 변경될 때마다 태그를 다시 로드

  const loadAvailableTags = async () => {
    // 기본 태그들 제공
    const defaultTags: Tag[] = [
      { id: 'travel', name: '여행' },
      { id: 'self-dev', name: '자기계발' },
      { id: 'study', name: '공부' },
      { id: 'tips', name: '꿀팁' },
      { id: 'tech', name: '기술' },
      { id: 'cooking', name: '요리' },
      { id: 'exercise', name: '운동' },
      { id: 'music', name: '음악' },
      { id: 'game', name: '게임' },
      { id: 'review', name: '리뷰' },
    ]

    if (!supabase || !user) {
      setAvailableTags(defaultTags)
      return
    }

    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (error) throw error

      // 기본 태그와 사용자 태그 합치기
      const allTags = [...defaultTags]
      data?.forEach(tag => {
        if (!allTags.find(t => t.name === tag.name)) {
          allTags.push(tag)
        }
      })

      setAvailableTags(allTags)
    } catch (error) {
      console.error('Error loading tags:', error)
      setAvailableTags(defaultTags)
    }
  }

  const addNewTag = async () => {
    if (!newTag.trim()) return

    const tagName = newTag.trim()

    // 이미 존재하는 태그인지 확인
    if (availableTags.find(tag => tag.name === tagName)) {
      setError('이미 존재하는 태그입니다.')
      return
    }

    try {
      let newTagObj: Tag

      if (supabase && user) {
        // 데이터베이스에 태그 저장
        const { createTag } = await import('@/lib/database')
        const savedTag = await createTag({
          name: tagName,
          user_id: user.id,
        })
        newTagObj = savedTag
      } else {
        // 로컬 임시 태그
        newTagObj = {
          id: `temp-${Date.now()}`,
          name: tagName,
        }
      }

      setAvailableTags(prev => [...prev, newTagObj])
      setSelectedTags(prev => [...prev, tagName])
      setNewTag('')
      setError('')
    } catch (error) {
      console.error('태그 생성 오류:', error)
      setError('태그를 생성하는데 실패했습니다.')
    }
  }

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev =>
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    )
  }

  const isValidYouTubeUrl = (url: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^https?:\/\/youtu\.be\/[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
    ]
    return patterns.some(pattern => pattern.test(url))
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

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    if (!isValidYouTubeUrl(url)) {
      setError('올바른 유튜브 URL을 입력해주세요.')
      setLoading(false)
      return
    }

    try {
      // Mock analysis - 실제로는 AI API를 호출하거나 서버사이드에서 처리
      const mockTitle = title || `분석된 영상 제목 - ${extractVideoId(url)}`
      const mockDescription =
        description ||
        '이 영상은 유튜브에서 분석된 내용입니다. 실제 분석 결과는 AI API를 통해 생성됩니다. 영상의 주요 내용과 핵심 포인트들을 요약하여 제공합니다.'

      if (!isSupabaseConfigured() || !user) {
        // Supabase가 설정되지 않았거나 로그인하지 않은 경우 로컬 결과만 표시
        const mockResult: AnalysisResult = {
          id: 'demo-' + Date.now(),
          title: mockTitle,
          description: mockDescription,
          youtube_url: url,
          user_description: userDescription,
        }
        setResult(mockResult)
        setLoading(false)
        return
      }

      // 새로운 database 함수 사용
      const analysisData = {
        youtube_url: url,
        title: mockTitle,
        description: mockDescription,
        user_description: userDescription || null,
        user_id: user.id,
      }

      const analysis = await createAnalysisWithTags(analysisData, selectedTags)

      setResult({
        ...analysis,
        user_description: userDescription,
      })

      // 검색 기록 추가
      if (user) {
        await addSearchHistory({
          analysis_id: analysis.id,
          user_id: user.id,
        })
      }

      // CRUD 컴포넌트들을 새로고침
      setRefreshKey(prev => prev + 1)

      // 자동 이동 옵션이 켜져있고 실제로 저장된 분석인 경우 결과 페이지로 이동
      if (autoRedirect && !analysis.id.startsWith('demo-')) {
        setRedirectCountdown(3) // 3초 카운트다운 시작

        const countdownInterval = setInterval(() => {
          setRedirectCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval)
              router.push(`/analysis/${analysis.id}`)
              return 0
            }
            return prev - 1
          })
        }, 1000) // 1초마다 카운트다운
      }
    } catch (error: any) {
      setError(error.message || '분석 중 오류가 발생했습니다.')
    }

    setLoading(false)
  }

  const handleReset = () => {
    setUrl('')
    setTitle('')
    setDescription('')
    setUserDescription('')
    setSelectedTags([])
    setResult(null)
    setError('')
    setIsEditing(false)
  }

  const handleEdit = () => {
    if (result) {
      setEditFormData({
        title: result.title,
        description: result.description,
        user_description: result.user_description || '',
        tags: selectedTags.join(', '),
      })
      setIsEditing(true)
    }
  }

  const handleSaveEdit = async () => {
    if (!result) {
      setError('편집할 수 없습니다.')
      return
    }

    try {
      // 태그 처리
      const newTagNames = editFormData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      if (user && isSupabaseConfigured() && !result.id.startsWith('demo-')) {
        // 실제 데이터베이스 업데이트
        const { updateAnalysis, updateAnalysisTags, findOrCreateTags } =
          await import('@/lib/database')

        // 분석 정보 업데이트
        const updatedAnalysis = await updateAnalysis(result.id, {
          title: editFormData.title,
          description: editFormData.description,
          user_description: editFormData.user_description || null,
        })

        if (newTagNames.length > 0) {
          const tags = await findOrCreateTags(newTagNames, user.id)
          const tagIds = tags.map(tag => tag.id)
          await updateAnalysisTags(result.id, tagIds)
        } else {
          await updateAnalysisTags(result.id, [])
        }

        // 결과 업데이트
        setResult({
          ...updatedAnalysis,
          user_description: editFormData.user_description,
        })
      } else {
        // 로컬 상태만 업데이트 (로그인하지 않았거나 데모 모드)
        setResult({
          ...result,
          title: editFormData.title,
          description: editFormData.description,
          user_description: editFormData.user_description,
        })
      }

      setSelectedTags(newTagNames)
      setIsEditing(false)
      setError('')
    } catch (error: any) {
      setError('업데이트 중 오류가 발생했습니다: ' + error.message)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditFormData({
      title: '',
      description: '',
      user_description: '',
      tags: '',
    })
  }

  const handleDelete = async () => {
    if (!result) {
      setError('삭제할 수 없습니다.')
      return
    }

    if (
      !confirm(
        '정말로 이 분석을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      return
    }

    try {
      if (user && isSupabaseConfigured() && !result.id.startsWith('demo-')) {
        // 실제 데이터베이스에서 삭제
        const { deleteAnalysis } = await import('@/lib/database')
        await deleteAnalysis(result.id)
        alert('분석이 성공적으로 삭제되었습니다.')
      } else {
        // 로컬에서만 삭제 (로그인하지 않았거나 데모 모드)
        alert('분석이 로컬에서 삭제되었습니다.')
      }

      // 성공적으로 삭제되면 초기화
      handleReset()
    } catch (error: any) {
      setError('삭제 중 오류가 발생했습니다: ' + error.message)
    }
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <h1 className={styles.title}>유튜브 영상 분석</h1>
            <p className={styles.subtitle}>
              유튜브 URL을 입력하면 영상의 내용을 분석하여 요약해드립니다.
            </p>
          </div>

          {!result ? (
            <div className={styles.card}>
              <form onSubmit={handleAnalyze}>
                <div className={styles.formGroup}>
                  <label htmlFor='url' className={styles.label}>
                    유튜브 URL *
                  </label>
                  <input
                    id='url'
                    type='url'
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    className={styles.input}
                    placeholder='https://www.youtube.com/watch?v=...'
                    required
                  />
                </div>

                {/* 카테고리 태그 선택 */}
                <div className={styles.tagsSection}>
                  <label className={styles.label}>
                    카테고리 태그 (선택사항)
                  </label>
                  <div>
                    {/* 기존 태그들 */}
                    <div className={styles.tagsContainer}>
                      {availableTags.map(tag => (
                        <button
                          key={tag.id}
                          type='button'
                          onClick={() => toggleTag(tag.name)}
                          className={`${styles.tagButton} ${
                            selectedTags.includes(tag.name)
                              ? styles.tagButtonActive
                              : ''
                          }`}
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>

                    {/* 새 태그 추가 */}
                    <div className={styles.addTagContainer}>
                      <input
                        type='text'
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        placeholder='새 태그 추가...'
                        className={`${styles.input} ${styles.tagInput}`}
                        onKeyPress={e =>
                          e.key === 'Enter' && (e.preventDefault(), addNewTag())
                        }
                      />
                      <button
                        type='button'
                        onClick={addNewTag}
                        className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSmall}`}
                      >
                        추가
                      </button>
                    </div>

                    {/* 선택된 태그들 표시 */}
                    {selectedTags.length > 0 && (
                      <div className={styles.selectedTagsContainer}>
                        <span className={styles.selectedTagsLabel}>
                          선택된 태그:
                        </span>
                        <div className={styles.tagsContainer}>
                          {selectedTags.map(tag => (
                            <span key={tag} className={styles.selectedTag}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {user && (
                  <div className={styles.formGroup}>
                    <label htmlFor='userDescription' className={styles.label}>
                      개인 설명 (선택사항)
                    </label>
                    <input
                      id='userDescription'
                      type='text'
                      value={userDescription}
                      onChange={e => setUserDescription(e.target.value)}
                      className={styles.input}
                      placeholder='예: 대학 강의 정리용, 프로젝트 참고자료 등'
                    />
                    <p className={styles.helpText}>
                      본인만 볼 수 있는 설명입니다. 나중에 검색 기록에서 확인할
                      수 있습니다.
                    </p>
                  </div>
                )}

                {/* 자동 이동 옵션 */}
                {user && (
                  <div className={styles.formGroup}>
                    <div className={styles.checkboxContainer}>
                      <input
                        id='auto-redirect'
                        type='checkbox'
                        checked={autoRedirect}
                        onChange={e => setAutoRedirect(e.target.checked)}
                        className={styles.checkbox}
                      />
                      <label
                        htmlFor='auto-redirect'
                        className={styles.checkboxLabel}
                      >
                        분석 완료 후 자동으로 상세 결과 페이지로 이동
                      </label>
                    </div>
                    <p className={styles.helpText}>
                      체크하면 분석 완료 2초 후 상세 결과 페이지로 자동
                      이동합니다.
                    </p>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label htmlFor='title' className={styles.label}>
                    제목 (선택사항)
                  </label>
                  <input
                    id='title'
                    type='text'
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className={styles.input}
                    placeholder='영상 제목을 직접 입력하거나 비워두세요'
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor='description' className={styles.label}>
                    설명 (선택사항)
                  </label>
                  <textarea
                    id='description'
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className={`${styles.input} ${styles.textarea}`}
                    placeholder='영상에 대한 추가 설명을 입력하세요'
                  />
                </div>

                {error && (
                  <div className={styles.errorMessage}>
                    <p>{error}</p>
                  </div>
                )}

                <div className={styles.buttonContainer}>
                  <button
                    type='submit'
                    disabled={loading}
                    className={`${styles.button} ${styles.buttonPrimary} ${
                      loading ? '' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className={styles.loadingSpinner}></div>
                        분석 중...
                      </>
                    ) : (
                      <>
                        <svg
                          style={{ width: '20px', height: '20px' }}
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                          />
                        </svg>
                        분석하기
                      </>
                    )}
                  </button>
                  <button
                    type='button'
                    onClick={handleReset}
                    className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSmall}`}
                  >
                    초기화
                  </button>
                </div>

                {!user && (
                  <div className={styles.infoMessage}>
                    <p>
                      <Link href='/login'>로그인</Link>
                      하시면 분석 기록이 저장되어 나중에 다시 볼 수 있습니다.
                    </p>
                  </div>
                )}
              </form>
            </div>
          ) : (
            // 분석 결과 표시
            <div className={styles.resultContainer}>
              <div className={styles.card}>
                <div className={styles.resultHeader}>
                  <div>
                    <h2 className={styles.resultTitle}>분석 완료!</h2>
                    {/* 자동 이동 카운트다운 메시지 */}
                    {redirectCountdown > 0 && (
                      <div className={styles.countdownContainer}>
                        <div
                          className={`${styles.loadingSpinner} w-4 h-4`}
                        ></div>
                        <span className={styles.countdownText}>
                          {redirectCountdown}초 후 상세 결과 페이지로
                          이동합니다...
                        </span>
                        <button
                          onClick={() => setRedirectCountdown(0)}
                          className={styles.countdownCancel}
                        >
                          취소
                        </button>
                      </div>
                    )}
                  </div>
                  <div className={styles.resultActions}>
                    {/* 임시로 로그인 없이도 수정/삭제 가능하도록 수정 */}
                    <button
                      onClick={handleEdit}
                      className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSmall}`}
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
                          d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                        />
                      </svg>
                      수정
                    </button>
                    <button
                      onClick={handleDelete}
                      className={`${styles.button} ${styles.buttonDanger} ${styles.buttonSmall}`}
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
                          d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                        />
                      </svg>
                      삭제
                    </button>
                    <button
                      onClick={handleReset}
                      className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSmall}`}
                    >
                      새로 분석하기
                    </button>
                  </div>
                </div>

                {/* 에러 메시지 */}
                {error && (
                  <div className={styles.errorMessage}>
                    <p>{error}</p>
                  </div>
                )}

                {isEditing ? (
                  // 편집 모드
                  <div className={styles.editForm}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>제목</label>
                      <input
                        type='text'
                        value={editFormData.title}
                        onChange={e =>
                          setEditFormData({
                            ...editFormData,
                            title: e.target.value,
                          })
                        }
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>설명</label>
                      <textarea
                        value={editFormData.description}
                        onChange={e =>
                          setEditFormData({
                            ...editFormData,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                        className={`${styles.input} ${styles.textarea}`}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>개인 설명</label>
                      <input
                        type='text'
                        value={editFormData.user_description}
                        onChange={e =>
                          setEditFormData({
                            ...editFormData,
                            user_description: e.target.value,
                          })
                        }
                        placeholder='예: 대학 강의 정리용, 프로젝트 참고자료 등'
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>태그 (쉼표로 구분)</label>
                      <input
                        type='text'
                        value={editFormData.tags}
                        onChange={e =>
                          setEditFormData({
                            ...editFormData,
                            tags: e.target.value,
                          })
                        }
                        placeholder='예: React, 프론트엔드, 강의'
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.buttonContainer}>
                      <button
                        onClick={handleSaveEdit}
                        className={`${styles.button} ${styles.buttonPrimary} ${styles.buttonSmall}`}
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
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                        저장
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className={`${styles.button} ${styles.buttonSecondary} ${styles.buttonSmall}`}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  // 보기 모드
                  <div className={styles.resultContent}>
                    <div className={styles.resultSection}>
                      <h3 className={styles.resultSectionTitle}>
                        {result.title}
                      </h3>
                      <p className={styles.resultDescription}>
                        {result.description}
                      </p>
                    </div>

                    {result.user_description && (
                      <div className={styles.personalNote}>
                        <div className={styles.personalNoteHeader}>
                          <svg
                            className={styles.personalNoteIcon}
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
                          <span className={styles.personalNoteLabel}>
                            개인 메모
                          </span>
                        </div>
                        <p className={styles.personalNoteText}>
                          {result.user_description}
                        </p>
                      </div>
                    )}

                    {selectedTags.length > 0 && (
                      <div className={styles.tagsDisplay}>
                        <span className={styles.tagsLabel}>태그</span>
                        <div className={styles.tagsContainer}>
                          {selectedTags.map(tag => (
                            <span key={tag} className={styles.selectedTag}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={styles.videoInfo}>
                      <div className={styles.videoInfoHeader}>
                        <svg
                          className={styles.videoIcon}
                          fill='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' />
                        </svg>
                        <span className={styles.videoLabel}>원본 영상</span>
                      </div>
                      <a
                        href={result.youtube_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className={styles.videoLink}
                      >
                        {result.youtube_url}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* 추가 액션 */}
              <div className={styles.actionsContainer}>
                {/* 결과 페이지에서 보기 버튼 - 실제 저장된 분석에만 표시 */}
                {user && !result.id.startsWith('demo-') && (
                  <Link
                    href={`/analysis/${result.id}`}
                    className={`${styles.button} ${styles.buttonPrimary}`}
                  >
                    <svg
                      style={{ width: '14px', height: '14px' }}
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                      />
                    </svg>
                    상세 결과 보기
                  </Link>
                )}
                <Link
                  href='/feed'
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  커뮤니티 피드 보기
                </Link>
                {user && (
                  <Link
                    href='/history'
                    className={`${styles.button} ${styles.buttonSecondary}`}
                  >
                    내 분석 기록 보기
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
