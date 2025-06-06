import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase'

// 환경 변수가 없을 경우 데모 모드용 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

// 데모 서버 클라이언트 생성
const createDemoServerClient = () => {
    return {
        from: (table: string) => ({
            select: () => ({
                eq: () => ({
                    single: async () => ({ data: null, error: { message: '데모 모드: 실제 데이터베이스에 연결되지 않았습니다.' } }),
                    order: () => ({
                        limit: async () => ({ data: [], error: null })
                    })
                }),
                order: () => ({
                    limit: async () => ({ data: [], error: null })
                }),
                single: async () => ({ data: null, error: { message: '데모 모드: 실제 데이터베이스에 연결되지 않았습니다.' } }),
                limit: async () => ({ data: [], error: null })
            })
        })
    } as any
}

export const createServerClient = () => {
    // 환경 변수가 제대로 설정되어 있으면 실제 Supabase 클라이언트 사용
    if (supabaseUrl !== 'https://demo.supabase.co' && supabaseAnonKey !== 'demo-key') {
        return createSupabaseClient(supabaseUrl, supabaseAnonKey)
    }

    // 그렇지 않으면 데모 클라이언트 반환
    return createDemoServerClient()
} 