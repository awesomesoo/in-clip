'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{
        name: string
    }>
}

interface Analysis {
    id: string
    title: string
    description: string
    youtube_url: string
    user_description?: string
    created_at: string
    updated_at: string
}

export default function TagPage({ params }: PageProps) {
    const [analyses, setAnalyses] = useState<Analysis[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [resolvedParams, setResolvedParams] = useState<{ name: string } | null>(null)

    useEffect(() => {
        const resolveParams = async () => {
            const resolved = await params
            setResolvedParams(resolved)
        }
        resolveParams()
    }, [params])

    useEffect(() => {
        if (resolvedParams) {
            loadAnalyses()
        }
    }, [resolvedParams])

    const loadAnalyses = async () => {
        if (!resolvedParams) return

        try {
            if (!supabase) {
                // Supabase가 설정되지 않은 경우 샘플 데이터 사용
                const sampleAnalyses: Analysis[] = [
                    {
                        id: '1',
                        title: 'React 18 새로운 기능 소개',
                        description:
                            'React 18의 주요 변경사항과 새로운 기능들을 분석했습니다.\n\n주요 내용:\n1. Concurrent Features - React 18의 가장 큰 변화\n2. Suspense 개선사항 - 데이터 로딩 최적화\n3. Automatic Batching - 성능 향상\n4. useId Hook - SSR 호환성 개선\n\n이러한 새로운 기능들을 통해 React 애플리케이션의 성능과 사용자 경험을 크게 향상시킬 수 있습니다.',
                        youtube_url: 'https://youtube.com/watch?v=sample1',
                        user_description: '대학 강의 정리용',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                    {
                        id: '2',
                        title: '요리 초보를 위한 파스타 만들기',
                        description:
                            '집에서 간단하게 만들 수 있는 맛있는 파스타 레시피를 소개합니다.\n\n재료:\n- 스파게티 면 200g\n- 마늘 3쪽\n- 올리브오일 3큰술\n- 파마산 치즈\n- 소금, 후추\n\n조리 과정:\n1. 물을 끓여 스파게티를 삶습니다\n2. 팬에 올리브오일과 마늘을 볶아 향을 냅니다\n3. 삶은 스파게티를 팬에 넣고 볶습니다\n4. 파마산 치즈를 뿌려 완성합니다',
                        youtube_url: 'https://youtube.com/watch?v=sample2',
                        user_description: '주말 요리 연습용',
                        created_at: new Date(Date.now() - 86400000).toISOString(),
                        updated_at: new Date(Date.now() - 86400000).toISOString(),
                    },
                ]

                // 태그 이름에 따라 필터링 (샘플 데이터용)
                const tagNameDecoded = decodeURIComponent(resolvedParams.name)
                const filteredAnalyses = sampleAnalyses.filter((analysis, index) => {
                    // 간단한 필터링 로직 (실제로는 태그 관계를 확인해야 함)
                    return tagNameDecoded === '프론트엔드' ? index === 0 : index === 1
                })

                setAnalyses(filteredAnalyses)
                return
            }

            const tagNameDecoded = decodeURIComponent(resolvedParams.name)

            // 태그별 분석 조회
            const { data, error } = await supabase
                .from('analysis')
                .select(
                    `
                    id,
                    title,
                    description,
                    youtube_url,
                    user_description,
                    created_at,
                    updated_at,
                    analysis_tags!inner (
                        tags!inner (
                            name
                        )
                    )
                `
                )
                .eq('analysis_tags.tags.name', tagNameDecoded)
                .order('created_at', { ascending: false })

            if (error) throw error

            setAnalyses(data || [])
        } catch (error: any) {
            console.error('Error loading analyses:', error)
            setError('데이터를 불러오는 중 오류가 발생했습니다.')
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
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const extractVideoId = (url: string) => {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
        ]
        for (const pattern of patterns) {
            const match = url.match(pattern)
            if (match) return match[1]
        }
        return null
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/tags" className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    태그 목록으로
                </Link>
            </div>

            <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-lg font-semibold mb-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    #{resolvedParams?.name}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    '{resolvedParams?.name}' 태그 분석글
                </h1>
                <p className="text-gray-600">
                    총 {analyses.length}개의 분석글이 있습니다.
                </p>
            </div>

            <div className="flex justify-center">
                <Link href="/analyze" className="btn btn-primary">
                    새로운 분석 추가
                </Link>
            </div>

            <div className="space-y-6">
                {analyses && analyses.length > 0 ? (
                    analyses.map((analysis: any) => {
                        const videoId = extractVideoId(analysis.youtube_url)
                        const thumbnailUrl = videoId
                            ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                            : null

                        return (
                            <div key={analysis.id} className="card hover:shadow-lg transition-shadow">
                                <div className="flex flex-col md:flex-row gap-4">
                                    {thumbnailUrl && (
                                        <div className="md:w-48 flex-shrink-0">
                                            <img
                                                src={thumbnailUrl}
                                                alt={analysis.title}
                                                className="w-full h-36 object-cover rounded-lg"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <Link
                                                href={`/analysis/${analysis.id}`}
                                                className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                                            >
                                                {analysis.title}
                                            </Link>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {formatDate(analysis.created_at)}
                                            </p>
                                        </div>

                                        <p className="text-gray-700 line-clamp-3">
                                            {analysis.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {analysis.analysis_tags?.filter((tagRelation: any) => tagRelation.tags).map((tagRelation: any) => (
                                                <Link
                                                    key={tagRelation.tags.id}
                                                    href={`/tags/${encodeURIComponent(tagRelation.tags.name)}`}
                                                    className={`px-2 py-1 text-xs rounded-full transition-colors ${tagRelation.tags.name === resolvedParams?.name
                                                        ? 'bg-blue-200 text-blue-900 font-medium'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    #{tagRelation.tags.name}
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-4 pt-2">
                                            <Link
                                                href={analysis.youtube_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                유튜브에서 보기
                                            </Link>
                                            <Link
                                                href={`/analysis/${analysis.id}`}
                                                className="text-sm text-gray-600 hover:text-gray-800"
                                            >
                                                자세히 보기
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">이 태그에 해당하는 분석글이 없습니다</h3>
                        <p className="text-gray-600 mb-4">'{resolvedParams?.name}' 태그로 첫 번째 분석을 추가해보세요!</p>
                        <Link href="/analyze" className="btn btn-primary">
                            분석 시작하기
                        </Link>
                    </div>
                )}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">태그 정보</h3>
                <div className="text-sm text-gray-600 space-y-1">
                    <p>• 태그명: #{resolvedParams?.name}</p>
                    <p>• 생성일: {formatDate(resolvedParams?.created_at || '')}</p>
                    <p>• 분석글 수: {analyses.length}개</p>
                </div>
            </div>
        </div>
    )
} 