import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        console.log('💾 Analysis 저장 API 호출됨')

        // Supabase 클라이언트 확인
        if (!supabase) {
            console.log('❌ Supabase 클라이언트가 설정되지 않음')
            return NextResponse.json(
                { error: 'Supabase 설정이 필요합니다.' },
                { status: 500 }
            )
        }

        const {
            youtube_url,
            title,
            description,
            user_description,
            summary,
            user_id
        } = await request.json()

        console.log('📥 저장 요청 데이터:', {
            youtube_url,
            title: title?.substring(0, 50) + '...',
            summary: summary?.substring(0, 100) + '...',
            user_id
        })

        // 필수 필드 검증
        if (!youtube_url || !title || !summary || !user_id) {
            console.log('❌ 필수 필드 누락')
            return NextResponse.json(
                { error: '필수 필드가 누락되었습니다.' },
                { status: 400 }
            )
        }

        // Supabase에 데이터 저장
        const { data, error } = await supabase
            .from('analysis')
            .insert([
                {
                    youtube_url,
                    title,
                    description: description || '',
                    user_description: user_description || '',
                    summary,
                    user_id,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ])
            .select()

        if (error) {
            console.error('❌ Supabase 저장 오류:', error)
            return NextResponse.json(
                { error: '데이터베이스 저장에 실패했습니다.' },
                { status: 500 }
            )
        }

        console.log('✅ Analysis 저장 성공:', data[0]?.id)
        return NextResponse.json({
            success: true,
            analysis: data[0],
            message: '분석 결과가 저장되었습니다.'
        })

    } catch (error) {
        console.error('💥 Analysis 저장 API 오류:', error)
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        )
    }
} 