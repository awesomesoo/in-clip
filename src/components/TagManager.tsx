'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { isSupabaseConfigured } from '@/lib/supabase'
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  getDemoData,
} from '@/lib/database'

interface Tag {
  id: string
  name: string
  created_at: string
  user_id: string
}

export default function TagManager() {
  const { user } = useAuth()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    if (user) {
      loadTags()
    }
  }, [user])

  const loadTags = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!isSupabaseConfigured()) {
        // 데모 모드
        setIsDemo(true)
        const demoData = getDemoData()
        setTags(demoData.tags)
        return
      }

      if (!user) return

      const data = await getTags(user.id)
      setTags(data)
    } catch (err) {
      console.error('태그 목록 로드 오류:', err)
      setError('태그 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newTagName.trim() || !user || isDemo) {
      if (isDemo) {
        alert('데모 모드에서는 태그를 생성할 수 없습니다.')
      }
      return
    }

    try {
      setError(null)
      await createTag({
        name: newTagName.trim(),
        user_id: user.id,
      })
      setNewTagName('')
      setIsCreating(false)
      await loadTags()
    } catch (err) {
      console.error('태그 생성 오류:', err)
      setError('태그를 생성하는데 실패했습니다.')
    }
  }

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.id)
    setEditName(tag.name)
  }

  const handleSave = async () => {
    if (!editingId || !editName.trim() || !user || isDemo) {
      if (isDemo) {
        alert('데모 모드에서는 편집할 수 없습니다.')
      }
      return
    }

    try {
      setError(null)
      await updateTag(editingId, { name: editName.trim() })
      setEditingId(null)
      setEditName('')
      await loadTags()
    } catch (err) {
      console.error('태그 업데이트 오류:', err)
      setError('태그를 업데이트하는데 실패했습니다.')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (isDemo) {
      alert('데모 모드에서는 삭제할 수 없습니다.')
      return
    }

    if (
      !confirm(
        `"${name}" 태그를 정말로 삭제하시겠습니까?\n이 태그가 연결된 분석들에서도 제거됩니다.`
      )
    ) {
      return
    }

    try {
      setError(null)
      await deleteTag(id)
      await loadTags()
    } catch (err) {
      console.error('태그 삭제 오류:', err)
      setError('태그를 삭제하는데 실패했습니다.')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditName('')
    setIsCreating(false)
    setNewTagName('')
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
        <h2 className='text-2xl font-bold text-gray-900'>태그 관리</h2>
        <div className='flex gap-2 items-center'>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
            >
              새 태그 추가
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

      {/* 새 태그 생성 폼 */}
      {isCreating && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
          <h3 className='text-lg font-semibold text-green-900 mb-3'>
            새 태그 추가
          </h3>
          <div className='flex gap-2'>
            <input
              type='text'
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              placeholder='태그 이름을 입력하세요'
              className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              onKeyPress={e => e.key === 'Enter' && handleCreate()}
            />
            <button
              onClick={handleCreate}
              className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors'
            >
              추가
            </button>
            <button
              onClick={handleCancel}
              className='px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors'
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 태그 목록 */}
      {tags.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          아직 태그가 없습니다. 새 태그를 추가해보세요!
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {tags.map(tag => (
            <div
              key={tag.id}
              className='bg-white border border-gray-200 rounded-lg p-4 shadow-sm'
            >
              {editingId === tag.id ? (
                // 편집 모드
                <div className='space-y-3'>
                  <input
                    type='text'
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    onKeyPress={e => e.key === 'Enter' && handleSave()}
                  />
                  <div className='flex gap-2'>
                    <button
                      onClick={handleSave}
                      className='flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm'
                    >
                      저장
                    </button>
                    <button
                      onClick={handleCancel}
                      className='flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm'
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                // 보기 모드
                <div>
                  <div className='flex justify-between items-start mb-2'>
                    <h3 className='font-semibold text-gray-900 text-lg'>
                      #{tag.name}
                    </h3>
                    <div className='flex gap-1'>
                      <button
                        onClick={() => handleEdit(tag)}
                        className='text-blue-600 hover:text-blue-800 text-sm p-1'
                        title='편집'
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id, tag.name)}
                        className='text-red-600 hover:text-red-800 text-sm p-1'
                        title='삭제'
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <p className='text-xs text-gray-400'>
                    생성일: {new Date(tag.created_at).toLocaleString('ko-KR')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 안내 메시지 */}
      {tags.length > 0 && (
        <div className='bg-blue-50 border border-blue-200 rounded-md p-4'>
          <h3 className='text-sm font-semibold text-blue-900 mb-2'>
            💡 태그 사용 팁
          </h3>
          <ul className='text-sm text-blue-800 space-y-1'>
            <li>• 태그는 분석 결과를 분류하고 검색하는데 사용됩니다</li>
            <li>• 일관된 태그 이름을 사용하면 더 효과적입니다</li>
            <li>• 태그를 삭제하면 관련된 모든 분석에서도 제거됩니다</li>
          </ul>
        </div>
      )}
    </div>
  )
}
