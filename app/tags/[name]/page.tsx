import { createServerClient } from '../../../lib/supabase-server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
    params: {
        name: string
    }
}

export default async function TagAnalysisPage({ params }: PageProps) {
    const tagName = decodeURIComponent(params.name)
    const supabase = createServerClient()

    const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .select(`
      id,
      name,
      created_at,
      analysis_tags (
        analysis (
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
        )
      )
    `)
        .eq('name', tagName)
        .single()

    if (tagError || !tagData) {
        notFound()
    }

    const analyses = tagData.analysis_tags?.map((at: any) => at.analysis).filter(Boolean) || []

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
                    #{tagName}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    '{tagName}' 태그 분석글
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
                                                    className={`px-2 py-1 text-xs rounded-full transition-colors ${tagRelation.tags.name === tagName
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
                        <p className="text-gray-600 mb-4">'{tagName}' 태그로 첫 번째 분석을 추가해보세요!</p>
                        <Link href="/analyze" className="btn btn-primary">
                            분석 시작하기
                        </Link>
                    </div>
                )}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">태그 정보</h3>
                <div className="text-sm text-gray-600 space-y-1">
                    <p>• 태그명: #{tagName}</p>
                    <p>• 생성일: {formatDate(tagData.created_at)}</p>
                    <p>• 분석글 수: {analyses.length}개</p>
                </div>
            </div>
        </div>
    )
} 