import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase'

// 서버 사이드에서 사용할 Supabase 클라이언트 (RLS 우회 가능)
export const createServerClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.log('⚠️ Supabase 환경 변수가 설정되지 않음')
        return null
    }

    console.log('🔑 서버 클라이언트 생성 시도:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceRoleKey,
        keyType: supabaseServiceRoleKey.startsWith('sbp_') ? 'service_role' : 'anon'
    })

    return createSupabaseClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
} 