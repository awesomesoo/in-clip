import { createServerClient } from '../../lib/supabase-server'
import Link from 'next/link'

interface Tag {
    id: string;
    name: string;
    created_at: string;
    analysis_tags: {
        analysis_id: string;
    }[];
}

export default async function TagsPage() {
    const supabase = createServerClient()
    let tags: Tag[] | null = null
    let error: any = null

    // Supabase가 null인 경우 처리
    if (supabase) {
        try {
            const result = await supabase
                .from('tags')
                .select(`
          id,
          name,
          created_at,
          analysis_tags (
            analysis_id
          )
        `)
                .order('name')

            tags = result.data
            error = result.error
        } catch (e) {
            console.error('Error fetching tags:', e)
            error = e
        }
    } else {
        console.warn('⚠️ Supabase 클라이언트가 초기화되지 않았습니다. 환경 변수를 확인해주세요.')
        // 환경 변수가 없을 때 기본 상태로 설정
        tags = []
        error = null
    }

    if (error) {
        console.error('Error fetching tags:', error)
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    태그 목록
                </h1>
                <p className="text-gray-600">
                    카테고리별로 분석된 영상들을 확인해보세요.
                </p>
            </div>

            <div className="flex justify-center">
                <Link href="/analyze" className="btn btn-primary">
                    새로운 분석 추가
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
                    데이터를 불러오는 중 오류가 발생했습니다.
                </div>
            )}

            {!supabase && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
                    ⚠️ 데이터베이스 연결이 설정되지 않았습니다. 환경 변수를 확인해주세요.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tags && tags.length > 0 ? (
                    tags.map((tag: Tag) => {
                        const analysisCount = tag.analysis_tags?.length || 0

                        return (
                            <Link
                                key={tag.id}
                                href={`/tags/${encodeURIComponent(tag.name)}`}
                                className="card hover:shadow-lg transition-shadow group"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            #{tag.name}
                                        </h3>
                                        <span className="text-sm text-gray-500">
                                            {analysisCount}개
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600">
                                        생성일: {formatDate(tag.created_at)}
                                    </p>

                                    <div className="pt-2 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">
                                                분석글 {analysisCount}개
                                            </span>
                                            <svg className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })
                ) : (
                    <div className="col-span-full text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {!supabase ? '데이터베이스 연결이 필요합니다' : '아직 태그가 없습니다'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {!supabase ?
                                '환경 변수를 설정하고 다시 시도해주세요.' :
                                '첫 번째 분석을 추가하여 태그를 만들어보세요!'
                            }
                        </p>
                        <Link href="/analyze" className="btn btn-primary">
                            분석 시작하기
                        </Link>
                    </div>
                )}
            </div>

            {tags && tags.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-2">태그 사용 팁</h3>
                    <ul className="text-blue-700 text-sm space-y-1">
                        <li>• 태그를 클릭하면 해당 태그가 달린 모든 분석글을 볼 수 있습니다</li>
                        <li>• 새로운 분석을 추가할 때 적절한 태그를 달아 분류해보세요</li>
                        <li>• 기존 태그를 활용하면 관련 콘텐츠를 쉽게 찾을 수 있습니다</li>
                    </ul>
                </div>
            )}
        </div>
    )
} 