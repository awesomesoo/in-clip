import { createClient } from './supabase'
import type { Database } from './supabase'

type Tables = Database['public']['Tables']
type Analysis = Tables['analysis']['Row']
type AnalysisInsert = Tables['analysis']['Insert']
type AnalysisUpdate = Tables['analysis']['Update']
type Tag = Tables['tags']['Row']
type TagInsert = Tables['tags']['Insert']
type TagUpdate = Tables['tags']['Update']
type SearchHistory = Tables['search_history']['Row']
type SearchHistoryInsert = Tables['search_history']['Insert']

const supabase = createClient()

// ===== ANALYSIS CRUD =====

/**
 * 새로운 분석 결과를 생성합니다
 */
export async function createAnalysis(data: AnalysisInsert) {
  const { data: analysis, error } = await supabase
    .from('analysis')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('분석 생성 오류:', error)
    throw error
  }

  return analysis
}

/**
 * 사용자의 모든 분석 결과를 가져옵니다
 */
export async function getAnalyses(userId: string) {
  const { data: analyses, error } = await supabase
    .from('analysis')
    .select(
      `
      *,
      tags!analysis_tags(
        id,
        name
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('분석 목록 조회 오류:', error)
    throw error
  }

  return analyses
}

/**
 * 특정 분석 결과를 ID로 가져옵니다
 */
export async function getAnalysisById(id: string) {
  const { data: analysis, error } = await supabase
    .from('analysis')
    .select(
      `
      *,
      tags!analysis_tags(
        id,
        name
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('분석 조회 오류:', error)
    throw error
  }

  return analysis
}

/**
 * 분석 결과를 업데이트합니다
 */
export async function updateAnalysis(id: string, data: AnalysisUpdate) {
  const { data: analysis, error } = await supabase
    .from('analysis')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('분석 업데이트 오류:', error)
    throw error
  }

  return analysis
}

/**
 * 분석 결과를 삭제합니다
 */
export async function deleteAnalysis(id: string) {
  const { error } = await supabase.from('analysis').delete().eq('id', id)

  if (error) {
    console.error('분석 삭제 오류:', error)
    throw error
  }

  return true
}

// ===== TAGS CRUD =====

/**
 * 새로운 태그를 생성합니다
 */
export async function createTag(data: TagInsert) {
  const { data: tag, error } = await supabase
    .from('tags')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('태그 생성 오류:', error)
    throw error
  }

  return tag
}

/**
 * 사용자의 모든 태그를 가져옵니다
 */
export async function getTags(userId: string) {
  const { data: tags, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId)
    .order('name')

  if (error) {
    console.error('태그 목록 조회 오류:', error)
    throw error
  }

  return tags
}

/**
 * 태그 이름으로 검색합니다
 */
export async function getTagByName(name: string, userId: string) {
  const { data: tag, error } = await supabase
    .from('tags')
    .select('*')
    .eq('name', name)
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116은 'not found' 에러
    console.error('태그 검색 오류:', error)
    throw error
  }

  return tag
}

/**
 * 태그를 업데이트합니다
 */
export async function updateTag(id: string, data: TagUpdate) {
  const { data: tag, error } = await supabase
    .from('tags')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('태그 업데이트 오류:', error)
    throw error
  }

  return tag
}

/**
 * 태그를 삭제합니다
 */
export async function deleteTag(id: string) {
  const { error } = await supabase.from('tags').delete().eq('id', id)

  if (error) {
    console.error('태그 삭제 오류:', error)
    throw error
  }

  return true
}

// ===== ANALYSIS-TAGS JUNCTION CRUD =====

/**
 * 분석에 태그를 연결합니다
 */
export async function addTagToAnalysis(analysisId: string, tagId: string) {
  const { data, error } = await supabase
    .from('analysis_tags')
    .insert({
      analysis_id: analysisId,
      tag_id: tagId,
    })
    .select()
    .single()

  if (error) {
    console.error('태그 연결 오류:', error)
    throw error
  }

  return data
}

/**
 * 분석에서 태그를 제거합니다
 */
export async function removeTagFromAnalysis(analysisId: string, tagId: string) {
  const { error } = await supabase
    .from('analysis_tags')
    .delete()
    .eq('analysis_id', analysisId)
    .eq('tag_id', tagId)

  if (error) {
    console.error('태그 제거 오류:', error)
    throw error
  }

  return true
}

/**
 * 분석의 모든 태그를 업데이트합니다
 */
export async function updateAnalysisTags(analysisId: string, tagIds: string[]) {
  // 기존 태그 연결 모두 제거
  const { error: deleteError } = await supabase
    .from('analysis_tags')
    .delete()
    .eq('analysis_id', analysisId)

  if (deleteError) {
    console.error('기존 태그 제거 오류:', deleteError)
    throw deleteError
  }

  // 새로운 태그 연결
  if (tagIds.length > 0) {
    const insertData = tagIds.map(tagId => ({
      analysis_id: analysisId,
      tag_id: tagId,
    }))

    const { error: insertError } = await supabase
      .from('analysis_tags')
      .insert(insertData)

    if (insertError) {
      console.error('새로운 태그 연결 오류:', insertError)
      throw insertError
    }
  }

  return true
}

// ===== SEARCH HISTORY CRUD =====

/**
 * 검색 기록을 추가합니다
 */
export async function addSearchHistory(data: SearchHistoryInsert) {
  const { data: history, error } = await supabase
    .from('search_history')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('검색 기록 추가 오류:', error)
    throw error
  }

  return history
}

/**
 * 사용자의 검색 기록을 가져옵니다
 */
export async function getSearchHistory(userId: string, limit: number = 10) {
  const { data: history, error } = await supabase
    .from('search_history')
    .select(
      `
      *,
      analysis(
        id,
        title,
        youtube_url,
        created_at
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('검색 기록 조회 오류:', error)
    throw error
  }

  return history
}

/**
 * 검색 기록을 삭제합니다
 */
export async function deleteSearchHistory(id: string) {
  const { error } = await supabase.from('search_history').delete().eq('id', id)

  if (error) {
    console.error('검색 기록 삭제 오류:', error)
    throw error
  }

  return true
}

/**
 * 사용자의 모든 검색 기록을 삭제합니다
 */
export async function clearSearchHistory(userId: string) {
  const { error } = await supabase
    .from('search_history')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('검색 기록 전체 삭제 오류:', error)
    throw error
  }

  return true
}

// ===== 통합 헬퍼 함수들 =====

/**
 * 태그 이름으로 태그를 찾거나 생성합니다
 */
export async function findOrCreateTag(name: string, userId: string) {
  // 먼저 기존 태그 찾기
  let tag = await getTagByName(name, userId)

  // 없으면 새로 생성
  if (!tag) {
    tag = await createTag({ name, user_id: userId })
  }

  return tag
}

/**
 * 태그 이름 배열로 태그들을 찾거나 생성합니다
 */
export async function findOrCreateTags(tagNames: string[], userId: string) {
  const tags = []

  for (const name of tagNames) {
    const tag = await findOrCreateTag(name, userId)
    tags.push(tag)
  }

  return tags
}

/**
 * 분석을 생성하고 태그도 함께 설정합니다
 */
export async function createAnalysisWithTags(
  analysisData: AnalysisInsert,
  tagNames: string[]
) {
  // 분석 생성
  const analysis = await createAnalysis(analysisData)

  // 태그들 찾거나 생성
  if (tagNames.length > 0) {
    const tags = await findOrCreateTags(tagNames, analysisData.user_id)
    const tagIds = tags.map(tag => tag.id)

    // 태그들을 분석에 연결
    await updateAnalysisTags(analysis.id, tagIds)
  }

  return analysis
}

// ===== 데모 모드 처리 =====

/**
 * 데모 데이터를 반환합니다 (Supabase가 설정되지 않은 경우)
 */
export function getDemoData() {
  const demoAnalyses = [
    {
      id: 'demo-1',
      youtube_url: 'https://www.youtube.com/watch?v=demo1',
      title: 'React 18 새로운 기능 소개',
      description: 'React 18의 주요 변경사항과 새로운 기능들을 분석했습니다.',
      user_description: '대학 강의 정리용',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'demo-user',
      tags: [
        { id: 'tag-1', name: '프론트엔드' },
        { id: 'tag-2', name: 'React' },
      ],
    },
    {
      id: 'demo-2',
      youtube_url: 'https://www.youtube.com/watch?v=demo2',
      title: 'TypeScript 타입 시스템 완벽 가이드',
      description: 'TypeScript의 타입 시스템에 대한 심층 분석입니다.',
      user_description: '프로젝트 참고자료',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      user_id: 'demo-user',
      tags: [
        { id: 'tag-1', name: '프론트엔드' },
        { id: 'tag-3', name: 'TypeScript' },
      ],
    },
  ]

  const demoTags = [
    {
      id: 'tag-1',
      name: '프론트엔드',
      created_at: new Date().toISOString(),
      user_id: 'demo-user',
    },
    {
      id: 'tag-2',
      name: 'React',
      created_at: new Date().toISOString(),
      user_id: 'demo-user',
    },
    {
      id: 'tag-3',
      name: 'TypeScript',
      created_at: new Date().toISOString(),
      user_id: 'demo-user',
    },
  ]

  const demoSearchHistory = [
    {
      id: 'history-1',
      analysis_id: 'demo-1',
      user_id: 'demo-user',
      created_at: new Date().toISOString(),
      analysis: demoAnalyses[0],
    },
    {
      id: 'history-2',
      analysis_id: 'demo-2',
      user_id: 'demo-user',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      analysis: demoAnalyses[1],
    },
  ]

  return {
    analyses: demoAnalyses,
    tags: demoTags,
    searchHistory: demoSearchHistory,
  }
}
