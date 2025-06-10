'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Analysis {
  id: string
  title: string
  description: string
  youtube_url: string
  created_at: string
  tags?: Tag[]
}

interface Tag {
  id: string
  name: string
}

export default function FeedPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAnalyses()
    loadTags()
  }, [selectedTag])

  const loadAnalyses = async () => {
    setLoading(true)
    try {
      if (!supabase) {
        // Supabase가 설정되지 않은 경우 샘플 데이터 사용
        const sampleData: Analysis[] = [
          {
            id: '1',
            title: 'React 18 새로운 기능 소개',
            description:
              'React 18의 주요 변경사항과 새로운 기능들을 분석했습니다. Concurrent Features, Suspense 개선사항 등을 다룹니다.',
            youtube_url: 'https://youtube.com/watch?v=sample1',
            created_at: new Date().toISOString(),
            tags: [
              { id: '1', name: '프론트엔드' },
              { id: '2', name: '기술' },
            ],
          },
          {
            id: '2',
            title: '요리 초보를 위한 파스타 만들기',
            description:
              '집에서 간단하게 만들 수 있는 맛있는 파스타 레시피를 소개합니다. 재료 준비부터 플레이팅까지 자세히 설명합니다.',
            youtube_url: 'https://youtube.com/watch?v=sample2',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            tags: [
              { id: '3', name: '요리' },
              { id: '4', name: '꿀팁' },
            ],
          },
          {
            id: '3',
            title: '효과적인 시간 관리 방법',
            description:
              '바쁜 일상 속에서 시간을 효율적으로 관리하는 방법들을 소개합니다. 포모도로 기법, 우선순위 설정 등 실용적인 팁들을 다룹니다.',
            youtube_url: 'https://youtube.com/watch?v=sample3',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            tags: [
              { id: '5', name: '자기계발' },
              { id: '6', name: '공부' },
            ],
          },
        ]

        const filteredData = selectedTag
          ? sampleData.filter(analysis =>
            analysis.tags?.some(tag => tag.name === selectedTag)
          )
          : sampleData

        setAnalyses(filteredData)
        return
      }

      let query = supabase
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
        .order('created_at', { ascending: false })

      if (selectedTag) {
        query = query.contains('analysis_tags.tags.name', [selectedTag])
      }

      const { data, error } = await query.limit(20)

      if (error) throw error

      // 태그 데이터 구조 변환
      const formattedData =
        data?.map(analysis => ({
          ...analysis,
          tags:
            analysis.analysis_tags?.map((t: any) => t.tags).filter(Boolean) ||
            [],
        })) || []

      setAnalyses(formattedData)
    } catch (error: any) {
      console.error('Error fetching analyses:', error)
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const loadTags = async () => {
    // 기본 태그들
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
      { id: 'frontend', name: '프론트엔드' },
    ]

    if (!supabase) {
      setAllTags(defaultTags)
      return
    }

    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name')

      if (error) throw error

      // 기본 태그와 사용자 태그 합치기
      const allTags = [...defaultTags]
      data?.forEach(tag => {
        if (!allTags.find(t => t.name === tag.name)) {
          allTags.push(tag)
        }
      })

      setAllTags(allTags)
    } catch (error) {
      console.error('Error loading tags:', error)
      setAllTags(defaultTags)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    )

    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    if (diffInHours < 48) return '어제'

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
    <div className='feed-container'>
      <div className='feed-main'>
        <div className='feed-header'>
          <h1 className='feed-title'>커뮤니티 피드</h1>
          <p className='feed-subtitle'>
            다른 사용자들이 분석한 유튜브 영상들을 확인하고,<br /> 새로운 인사이트를
            발견해보세요.
          </p>
        </div>

        <div className='feed-actions'>
          <Link href='/analyze' className='btn-feed-primary'>
            ✨ 새로운 분석 추가하기
          </Link>
        </div>

        {/* 태그 필터 섹션 */}
        <div className='feed-filter-section'>
          <h3 className='filter-title'>
            <svg
              className='filter-icon'
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
            카테고리별 필터링
          </h3>
          <div className='filter-tags'>
            <button
              onClick={() => setSelectedTag('')}
              className={`tag-button ${!selectedTag ? 'active' : ''}`}
            >
              🌟 전체보기
            </button>
            {allTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(tag.name)}
                className={`tag-button ${selectedTag === tag.name ? 'active' : ''
                  }`}
              >
                #{tag.name}
              </button>
            ))}
          </div>
          {selectedTag && (
            <div className='filter-info'>
              💡 '{selectedTag}' 태그가 포함된 분석 결과를 표시하고 있습니다.
            </div>
          )}
        </div>

        {error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '1rem',
              color: '#dc2626',
              marginBottom: '1.5rem',
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className='loading-container'>
            <div className='loading-spinner'></div>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>
              분석 결과를 불러오는 중...
            </p>
          </div>
        ) : (
          <div className='feed-content'>
            {analyses && analyses.length > 0 ? (
              analyses.map(analysis => {
                const videoId = extractVideoId(analysis.youtube_url)
                const thumbnailUrl = videoId
                  ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
                  : null

                return (
                  <div key={analysis.id} className='feed-card'>
                    <div className='card-content'>
                      {thumbnailUrl && (
                        <div className='card-thumbnail'>
                          <img
                            src={thumbnailUrl}
                            alt={analysis.title}
                            onError={e => {
                              ; (
                                e.target as HTMLImageElement
                              ).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                            }}
                          />
                          <div className='thumbnail-overlay'>
                            <svg
                              className='play-icon'
                              fill='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path d='M8 5v14l11-7z' />
                            </svg>
                          </div>
                        </div>
                      )}

                      <div className='card-body'>
                        <div className='card-header'>
                          <Link
                            href={`/analysis/${analysis.id}`}
                            className='card-title'
                          >
                            {analysis.title}
                          </Link>
                          <div className='card-date'>
                            <svg
                              style={{ width: '1rem', height: '1rem' }}
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
                            {formatDate(analysis.created_at)}
                          </div>
                        </div>

                        <p className='card-description'>
                          {analysis.description}
                        </p>

                        {analysis.tags && analysis.tags.length > 0 && (
                          <div className='card-tags'>
                            {analysis.tags.map(tag => (
                              <button
                                key={tag.id}
                                onClick={() => setSelectedTag(tag.name)}
                                className='card-tag'
                              >
                                #{tag.name}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className='card-actions'>
                          <Link
                            href={analysis.youtube_url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='card-link'
                          >
                            <svg
                              className='card-link-icon'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                              />
                            </svg>
                            YouTube에서 보기
                          </Link>
                          <Link
                            href={`/analysis/${analysis.id}`}
                            className='card-link'
                          >
                            <svg
                              className='card-link-icon'
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
                            자세히 보기
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className='empty-state'>
                <div className='empty-icon'>
                  <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                    />
                  </svg>
                </div>
                <h3 className='empty-title'>
                  {selectedTag
                    ? `'${selectedTag}' 태그의 분석이 없습니다`
                    : '아직 분석된 영상이 없습니다'}
                </h3>
                <p className='empty-description'>
                  {selectedTag
                    ? '다른 태그를 선택하거나 직접 새로운 분석을 추가해보세요!'
                    : '첫 번째 분석을 추가하여 커뮤니티를 시작해보세요!'}
                </p>
                <Link href='/analyze' className='btn-feed-primary'>
                  🚀 분석 시작하기
                </Link>
              </div>
            )}
          </div>
        )}

        {analyses && analyses.length > 0 && !loading && (
          <div className='feed-footer'>
            <p className='footer-text'>
              {selectedTag
                ? `📊 '${selectedTag}' 태그의 분석 결과 ${analyses.length}개를 표시 중입니다.`
                : `📈 총 ${analyses.length}개의 분석 결과를 표시 중입니다.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
