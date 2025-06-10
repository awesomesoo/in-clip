import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    console.log('🔍 인증 디버깅 API 호출됨')

    try {
        const supabase = createClient()

        console.log('🔧 Supabase 클라이언트 생성됨')

        // 인증 헤더 확인
        const authHeader = request.headers.get('authorization')
        console.log('🔑 Authorization 헤더:', authHeader ? '있음' : '없음')

        let user = null
        let authError = null

        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            console.log('🔑 토큰으로 사용자 확인 시도')

            const { data, error } = await supabase.auth.getUser(token)
            user = data?.user
            authError = error

            console.log('🔑 토큰 검증 결과:', {
                success: !!user,
                userId: user?.id,
                email: user?.email,
                error: error?.message
            })
        } else {
            // 기본 세션에서 사용자 정보 가져오기
            const result = await supabase.auth.getUser()
            user = result.data?.user
            authError = result.error

            console.log('🔑 기본 세션 결과:', {
                success: !!user,
                userId: user?.id,
                email: user?.email,
                error: authError?.message
            })
        }

        // Supabase 연결 테스트
        const { data: testData, error: testError } = await supabase
            .from('analysis')
            .select('count')
            .limit(1)

        console.log('🗄️ DB 연결 테스트:', {
            success: !testError,
            error: testError?.message
        })

        return NextResponse.json({
            success: true,
            auth: {
                hasUser: !!user,
                userId: user?.id,
                email: user?.email,
                authError: authError?.message
            },
            database: {
                connected: !testError,
                error: testError?.message
            },
            request: {
                hasAuthHeader: !!authHeader,
                method: request.method,
                url: request.url
            }
        })

    } catch (error) {
        console.error('❌ 디버깅 API 오류:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : '알 수 없는 오류'
        }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    return GET(request)  // POST도 같은 로직으로 처리
} 