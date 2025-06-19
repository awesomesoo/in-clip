'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { isSupabaseConfigured } from '@/lib/supabase'
import { createAnalysisWithTags } from '@/lib/database'

interface CreateAnalysisProps {
  onAnalysisCreated?: () => void
}

export default function CreateAnalysis({
  onAnalysisCreated,
}: CreateAnalysisProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    youtube_url: '',
    title: '',
    description: '',
    user_description: '',
    tags: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isDemo = !isSupabaseConfigured()

  const validateYouTubeUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return youtubeRegex.test(url)
  }

  const extractVideoId = (url: string): string | null => {
    const regexes = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ]

    for (const regex of regexes) {
      const match = url.match(regex)
      if (match) return match[1]
    }

    return null
  }

  const getThumbnailUrl = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError('로그인이 필요합니다.')
      return
    }

    if (isDemo) {
      alert(
        '데모 모드에서는 새로운 분석을 생성할 수 없습니다.\n\n실제 Supabase 프로젝트를 연결하면 모든 기능을 사용할 수 있습니다.'
      )
      return
    }

    if (!formData.youtube_url.trim()) {
      setError('YouTube URL을 입력해주세요.')
      return
    }

    if (!validateYouTubeUrl(formData.youtube_url)) {
      setError('올바른 YouTube URL을 입력해주세요.')
      return
    }

    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // 태그 처리
      const tagNames = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      // 분석 생성
      await createAnalysisWithTags(
        {
          youtube_url: formData.youtube_url.trim(),
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          user_description: formData.user_description.trim() || null,
          user_id: user.id,
        },
        tagNames
      )

      setSuccess(true)
      setFormData({
        youtube_url: '',
        title: '',
        description: '',
        user_description: '',
        tags: '',
      })

      // 성공 후 콜백 실행
      onAnalysisCreated?.()

      // 3초 후 성공 메시지 숨김
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('분석 생성 오류:', err)
      setError('분석을 생성하는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const videoId = formData.youtube_url
    ? extractVideoId(formData.youtube_url)
    : null
  const thumbnailUrl = videoId ? getThumbnailUrl(videoId) : null

  return (
    <div className='bg-white border border-gray-200 rounded-lg p-6 shadow-sm'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-bold text-gray-900'>새 분석 생성</h2>
      </div>

      {/* 성공 메시지 */}
      {success && (
        <div className='bg-green-50 border border-green-200 rounded-md p-4 mb-6'>
          <p className='text-green-800'>✅ 분석이 성공적으로 생성되었습니다!</p>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-md p-4 mb-6'>
          <p className='text-red-800'>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* YouTube URL */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            YouTube URL *
          </label>
          <input
            type='url'
            value={formData.youtube_url}
            onChange={e =>
              setFormData({ ...formData, youtube_url: e.target.value })
            }
            placeholder='https://www.youtube.com/watch?v=...'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
          <p className='text-xs text-gray-500 mt-1'>
            분석할 YouTube 동영상의 URL을 입력하세요
          </p>
        </div>

        {/* 썸네일 미리보기 */}
        {thumbnailUrl && (
          <div className='border border-gray-200 rounded-md p-3'>
            <p className='text-sm font-medium text-gray-700 mb-2'>미리보기</p>
            <img
              src={thumbnailUrl}
              alt='YouTube 썸네일'
              className='w-full max-w-sm rounded-md'
              onError={e => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}

        {/* 제목 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            제목 *
          </label>
          <input
            type='text'
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder='분석 결과의 제목을 입력하세요'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
        </div>

        {/* 설명 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            설명
          </label>
          <textarea
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder='분석 내용에 대한 상세 설명을 입력하세요'
            rows={3}
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        {/* 비공개 메모 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            비공개 메모
          </label>
          <input
            type='text'
            value={formData.user_description}
            onChange={e =>
              setFormData({ ...formData, user_description: e.target.value })
            }
            placeholder='예: 대학 강의 정리용, 프로젝트 참고자료'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <p className='text-xs text-gray-500 mt-1'>
            이 분석의 용도나 개인적인 메모를 남겨보세요
          </p>
        </div>

        {/* 태그 */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            태그
          </label>
          <input
            type='text'
            value={formData.tags}
            onChange={e => setFormData({ ...formData, tags: e.target.value })}
            placeholder='React, 프론트엔드, 강의'
            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <p className='text-xs text-gray-500 mt-1'>
            쉼표로 구분하여 여러 태그를 입력하세요. 없는 태그는 자동으로
            생성됩니다.
          </p>
        </div>

        {/* 제출 버튼 */}
        <div className='flex gap-2 pt-4'>
          <button
            type='submit'
            disabled={loading}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            {loading ? (
              <span className='flex items-center justify-center'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                생성 중...
              </span>
            ) : (
              '분석 생성'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
