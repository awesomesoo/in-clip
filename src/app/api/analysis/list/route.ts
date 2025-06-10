import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        console.log('📋 Analysis 조회 API 호출됨')

        // Supabase 클라이언트 확인
        if (!supabase) {
            console.log('❌ Supabase 클라이언트가 설정되지 않음')
            return NextResponse.json(
                { error: 'Supabase 설정이 필요합니다.' },
                { status: 500 }
            )
        }

        const { searchParams } = new URL(request.url)
        const user_id = searchParams.get('user_id')
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = parseInt(searchParams.get('offset') || '0')

        if (!user_id) {
            console.log('❌ user_id가 없음')
            return NextResponse.json(
                { error: '사용자 ID가 필요합니다.' },
                { status: 400 }
            )
        }

        console.log('📥 조회 요청:', { user_id, limit, offset })

        // Supabase에서 데이터 조회
        const { data, error, count } = await supabase
            .from('analysis')
            .select('*', { count: 'exact' })
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            console.error('❌ Supabase 조회 오류:', error)
            return NextResponse.json(
                { error: '데이터베이스 조회에 실패했습니다.' },
                { status: 500 }
            )
        }

        console.log('✅ Analysis 조회 성공:', data?.length, '개 항목')
        return NextResponse.json({
            success: true,
            analyses: data || [],
            total: count || 0,
            limit,
            offset
        })

    } catch (error) {
        console.error('💥 Analysis 조회 API 오류:', error)
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        )
    }
} 