import { NextRequest, NextResponse } from 'next/server'
import { extractVideoId, getTranscript } from '@/lib/youtube-utils'
import { summarizeWithGemini } from '@/lib/gemini-utils'

export async function POST(request: NextRequest) {
    try {
        console.log('🎬 Summarize API 호출됨')

        const { url } = await request.json()
        console.log('📥 요청 URL:', url)

        if (!url) {
            console.log('❌ URL이 없음')
            return NextResponse.json(
                { error: '유튜브 URL이 필요합니다.' },
                { status: 400 }
            )
        }

        // 환경 변수 확인 (데모 모드 허용)
        const hasApiKey = !!process.env.GEMINI_API_KEY
        console.log('🔑 API 키 존재 여부:', hasApiKey)

        if (!hasApiKey) {
            console.log('⚠️ GEMINI_API_KEY가 설정되지 않음 - 데모 모드로 실행')
        }

        // 1. 비디오 ID 추출
        let videoId: string
        try {
            videoId = extractVideoId(url)
            console.log('🎯 추출된 비디오 ID:', videoId)
        } catch (error) {
            console.log('❌ 비디오 ID 추출 실패:', error)
            return NextResponse.json(
                { error: '유효하지 않은 유튜브 URL입니다.' },
                { status: 400 }
            )
        }

        // 2. 자막 추출
        let transcript: string
        try {
            console.log('📝 자막 추출 시작...')
            transcript = await getTranscript(videoId)
            console.log('✅ 자막 추출 완료. 길이:', transcript.length, '문자')
            console.log('📖 자막 미리보기:', transcript.substring(0, 100) + '...')
        } catch (error) {
            console.log('❌ 자막 추출 실패:', error)
            return NextResponse.json(
                { error: '자막을 찾을 수 없습니다. 자막이 있는 영상을 사용해주세요.' },
                { status: 400 }
            )
        }

        // 3. Gemini로 요약 생성
        let summary: string
        try {
            console.log('🤖 Gemini 요약 생성 시작...')
            summary = await summarizeWithGemini(transcript)
            console.log('✅ Gemini 요약 생성 완료. 길이:', summary.length, '문자')
            console.log('📄 요약 미리보기:', summary.substring(0, 150) + '...')
        } catch (error) {
            console.log('❌ Gemini 요약 생성 실패:', error)
            return NextResponse.json(
                { error: '요약 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' },
                { status: 500 }
            )
        }

        console.log('🎉 요약 API 성공!')
        return NextResponse.json({
            summary,
            metadata: {
                videoId,
                transcriptLength: transcript.length,
                summaryLength: summary.length,
                hasApiKey,
                timestamp: new Date().toISOString()
            }
        })
    } catch (error) {
        console.error('💥 Summarize API error:', error)
        return NextResponse.json(
            { error: '서버 오류가 발생했습니다.' },
            { status: 500 }
        )
    }
} 