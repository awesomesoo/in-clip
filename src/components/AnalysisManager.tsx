'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  getAnalyses,
  updateAnalysis,
  deleteAnalysis,
  getTags,
  updateAnalysisTags,
  findOrCreateTags,
  getDemoData,
} from '@/lib/database'

interface AnalysisWithTags {
  id: string
  youtube_url: string
  title: string
  description: string
  user_description?: string
  created_at: string
  updated_at: string
  user_id: string
  video_id?: string
  thumbnail_url?: string
  transcript?: string
  ai_summary?: string
  key_points?: string[]
  category?: string
  sentiment?: string
  difficulty?: string
  duration_estimate?: string
  ai_tags?: string[]
  tags?: { id: string; name: string }[]
}

export default function AnalysisManager() {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState<AnalysisWithTags[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    user_description: '',
    tags: '',
  })
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    if (user) {
      loadAnalyses()
    }
  }, [user])

  const loadAnalyses = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!isSupabaseConfigured()) {
        // 데모 모드
        setIsDemo(true)
        const demoData = getDemoData()
        setAnalyses(demoData.analyses)
        return
      }

      if (!user) return

      const data = await getAnalyses(user.id)
      setAnalyses(data)
    } catch (err) {
      console.error('분석 목록 로드 오류:', err)
      setError('분석 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (analysis: AnalysisWithTags) => {
    setEditingId(analysis.id)
    setFormData({
      title: analysis.title,
      description: analysis.description || '',
      user_description: analysis.user_description || '',
      tags: analysis.tags?.map(tag => tag.name).join(', ') || '',
    })
  }

  const handleSave = async () => {
    if (!editingId || !user || isDemo) {
      if (isDemo) {
        alert('데모 모드에서는 편집할 수 없습니다.')
      }
      return
    }

    try {
      setError(null)

      // 분석 정보 업데이트
      await updateAnalysis(editingId, {
        title: formData.title,
        description: formData.description,
        user_description: formData.user_description,
      })

      // 태그 처리
      if (formData.tags.trim()) {
        const tagNames = formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0)

        const tags = await findOrCreateTags(tagNames, user.id)
        const tagIds = tags.map(tag => tag.id)

        await updateAnalysisTags(editingId, tagIds)
      } else {
        // 태그가 없으면 기존 태그 모두 제거
        await updateAnalysisTags(editingId, [])
      }

      setEditingId(null)
      await loadAnalyses()
    } catch (err) {
      console.error('분석 업데이트 오류:', err)
      setError('분석 정보를 업데이트하는데 실패했습니다.')
    }
  }

  const handleDelete = async (id: string) => {
    if (isDemo) {
      alert('데모 모드에서는 삭제할 수 없습니다.')
      return
    }

    if (!confirm('정말로 이 분석을 삭제하시겠습니까?')) {
      return
    }

    try {
      setError(null)
      await deleteAnalysis(id)
      await loadAnalyses()
    } catch (err) {
      console.error('분석 삭제 오류:', err)
      setError('분석을 삭제하는데 실패했습니다.')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      user_description: '',
      tags: '',
    })
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
        <h2 className='text-2xl font-bold text-gray-900'>분석 관리</h2>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-md p-4'>
          <p className='text-red-800'>{error}</p>
        </div>
      )}

      {/* 분석 목록 */}
      {analyses.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          아직 분석 결과가 없습니다.
        </div>
      ) : (
        <div className='space-y-4'>
          {analyses.map(analysis => (
            <div
              key={analysis.id}
              className='bg-white border border-gray-200 rounded-lg p-6 shadow-sm'
            >
              {editingId === analysis.id ? (
                // 편집 모드
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      제목
                    </label>
                    <input
                      type='text'
                      value={formData.title}
                      onChange={e =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      설명
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      비공개 메모
                    </label>
                    <input
                      type='text'
                      value={formData.user_description}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          user_description: e.target.value,
                        })
                      }
                      placeholder='예: 대학 강의 정리용'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      태그 (쉼표로 구분)
                    </label>
                    <input
                      type='text'
                      value={formData.tags}
                      onChange={e =>
                        setFormData({ ...formData, tags: e.target.value })
                      }
                      placeholder='예: React, 프론트엔드, 강의'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  <div className='flex gap-2'>
                    <button
                      onClick={handleSave}
                      className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                    >
                      저장
                    </button>
                    <button
                      onClick={handleCancel}
                      className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors'
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                // 보기 모드
                <div>
                  <div className='flex justify-between items-start mb-3'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      {analysis.title}
                    </h3>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleEdit(analysis)}
                        className='text-blue-600 hover:text-blue-800 text-sm'
                      >
                        편집
                      </button>
                      <button
                        onClick={() => handleDelete(analysis.id)}
                        className='text-red-600 hover:text-red-800 text-sm'
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    {/* 영상 정보 */}
                    {analysis.video_id && (
                      <div className='flex gap-4 p-4 bg-gray-50 rounded-lg'>
                        <img
                          src={`https://img.youtube.com/vi/${analysis.video_id}/hqdefault.jpg`}
                          alt='비디오 썸네일'
                          className='w-24 h-18 rounded object-cover'
                        />
                        <div className='flex-1'>
                          <div className='flex gap-2 mb-2'>
                            {analysis.category && (
                              <span className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                                {analysis.category}
                              </span>
                            )}
                            {analysis.difficulty && (
                              <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                                {analysis.difficulty}
                              </span>
                            )}
                            {analysis.sentiment && (
                              <span className='px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full'>
                                {analysis.sentiment}
                              </span>
                            )}
                            {analysis.duration_estimate && (
                              <span className='px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full'>
                                ⏱️ {analysis.duration_estimate}
                              </span>
                            )}
                          </div>
                          <p className='text-sm text-gray-500'>
                            🔗{' '}
                            <a
                              href={analysis.youtube_url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-blue-600 hover:underline'
                            >
                              YouTube 링크
                            </a>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* AI 요약 */}
                    {analysis.ai_summary && (
                      <div className='p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500'>
                        <h4 className='font-semibold text-blue-900 mb-2 flex items-center gap-2'>
                          🤖 AI 요약
                        </h4>
                        <p className='text-blue-800 text-sm leading-relaxed'>
                          {analysis.ai_summary}
                        </p>
                      </div>
                    )}

                    {/* 주요 포인트 */}
                    {analysis.key_points && analysis.key_points.length > 0 && (
                      <div className='p-4 bg-green-50 rounded-lg'>
                        <h4 className='font-semibold text-green-900 mb-3 flex items-center gap-2'>
                          🎯 주요 포인트
                        </h4>
                        <ul className='space-y-2'>
                          {analysis.key_points.map((point, index) => (
                            <li key={index} className='flex items-start gap-2 text-sm'>
                              <span className='bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5'>
                                {index + 1}
                              </span>
                              <span className='text-green-800'>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 기존 설명 */}
                    <div className='p-4 bg-gray-50 rounded-lg'>
                      <h4 className='font-semibold text-gray-900 mb-2'>📄 설명</h4>
                      <p className='text-gray-700 text-sm'>{analysis.description}</p>
                    </div>

                    {analysis.user_description && (
                      <p className='text-sm text-blue-600 bg-blue-50 p-3 rounded-lg'>
                        📝 <strong>비공개 메모:</strong> {analysis.user_description}
                      </p>
                    )}

                    {/* 태그 섹션 */}
                    <div className='space-y-2'>
                      {analysis.ai_tags && analysis.ai_tags.length > 0 && (
                        <div>
                          <h5 className='text-sm font-medium text-gray-700 mb-1'>AI 추천 태그</h5>
                          <div className='flex gap-1 flex-wrap'>
                            {analysis.ai_tags.map((tag, index) => (
                              <span
                                key={index}
                                className='px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full'
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {analysis.tags && analysis.tags.length > 0 && (
                        <div>
                          <h5 className='text-sm font-medium text-gray-700 mb-1'>사용자 태그</h5>
                          <div className='flex gap-1 flex-wrap'>
                            {analysis.tags.map(tag => (
                              <span
                                key={tag.id}
                                className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <p className='text-xs text-gray-400 pt-2 border-t'>
                      생성일: {new Date(analysis.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
