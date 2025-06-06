import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 환경 변수가 올바르게 설정되었는지 확인
const hasValidConfig = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey.length > 10 &&
    supabaseUrl !== 'your_supabase_project_url_here' &&
    supabaseAnonKey !== 'your_supabase_anon_key_here'
)

// 실제 Supabase 클라이언트 생성
export const supabase = hasValidConfig
  ? createSupabaseClient(supabaseUrl!, supabaseAnonKey!)
  : null

// Supabase 클라이언트가 사용 가능한지 확인하는 헬퍼 함수
export const isSupabaseConfigured = () => {
  return hasValidConfig && supabase !== null
}

export type Analysis = {
  id: string
  youtube_url: string
  title: string
  description: string
  created_at: string
  updated_at: string
  user_id: string
  tags?: Tag[]
}

export type Tag = {
  id: string
  name: string
  created_at: string
  user_id: string
}

// 환경 변수가 없을 경우 데모 모드용 설정
const supabaseUrlDemo =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKeyDemo =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

// 데모 클라이언트 생성 (실제 Supabase 연결 없이 인터페이스만 제공)
const createDemoClient = () => {
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async (credentials: {
        email: string
        password: string
      }) => {
        // 데모 계정 확인
        if (
          credentials.email === 'demo@inclip.com' &&
          credentials.password === 'demo123'
        ) {
          const demoUser = {
            id: 'demo-user-id',
            email: 'demo@inclip.com',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            aud: 'authenticated',
            role: 'authenticated',
          }
          return {
            data: { user: demoUser, session: { user: demoUser } },
            error: null,
          }
        }
        return {
          data: { user: null },
          error: {
            message:
              '데모 모드입니다. 이메일: demo@inclip.com, 비밀번호: demo123을 사용하세요.',
          },
        }
      },
      signInWithOAuth: async (params: { provider: string; options?: any }) => {
        if (params.provider === 'google') {
          // 데모 모드에서는 구글 로그인을 시뮬레이션
          alert(
            '데모 모드에서는 구글 로그인을 사용할 수 없습니다.\n\n데모 계정을 사용해보세요:\n이메일: demo@inclip.com\n비밀번호: demo123'
          )
          return {
            data: { url: null, provider: 'google' },
            error: {
              message: '데모 모드에서는 구글 로그인을 사용할 수 없습니다.',
            },
          }
        }
        return {
          data: { url: null },
          error: {
            message: '데모 모드에서는 OAuth 로그인을 사용할 수 없습니다.',
          },
        }
      },
      signUp: async () => ({
        data: { user: null },
        error: {
          message:
            '데모 모드에서는 회원가입할 수 없습니다. 데모 계정(demo@inclip.com / demo123)을 사용하세요.',
        },
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: null,
            error: {
              message: '데모 모드: 실제 데이터베이스에 연결되지 않았습니다.',
            },
          }),
          order: () => ({
            limit: async () => ({ data: [], error: null }),
          }),
        }),
        order: () => ({
          limit: async () => ({ data: [], error: null }),
        }),
        single: async () => ({
          data: null,
          error: {
            message: '데모 모드: 실제 데이터베이스에 연결되지 않았습니다.',
          },
        }),
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({
            data: {
              id: 'demo-' + Date.now(),
              title: '데모 분석 결과',
              description:
                '이것은 데모 모드에서 생성된 샘플 분석 결과입니다.\n\n실제 프로젝트에서는:\n• YouTube API를 통한 영상 정보 추출\n• AI 모델을 활용한 자동 요약\n• 개인화된 분석 기록 저장\n• 태그 기반 분류 시스템\n\n이 모든 기능을 사용하려면 실제 Supabase 프로젝트를 연결하세요.',
              youtube_url: 'https://www.youtube.com/watch?v=demo',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_id: 'demo-user',
            },
            error: null,
          }),
        }),
      }),
      delete: () => ({
        eq: async () => ({ error: null }),
      }),
    }),
  } as any
}

export const createClient = () => {
  // 환경 변수가 제대로 설정되어 있으면 실제 Supabase 클라이언트 사용
  if (hasValidConfig) {
    return createSupabaseClient(supabaseUrl!, supabaseAnonKey!)
  }

  // 그렇지 않으면 데모 클라이언트 반환
  return createDemoClient()
}

export type Database = {
  public: {
    Tables: {
      analysis: {
        Row: {
          id: string
          youtube_url: string
          title: string
          description: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          youtube_url: string
          title: string
          description?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          youtube_url?: string
          title?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          user_id?: string
        }
      }
      analysis_tags: {
        Row: {
          analysis_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          analysis_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          analysis_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      search_history: {
        Row: {
          id: string
          analysis_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          analysis_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          analysis_id?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}
