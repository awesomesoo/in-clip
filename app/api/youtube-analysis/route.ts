import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase'
import { createServerClient } from '../../../lib/supabase-server'
import ytdl from '@distube/ytdl-core'
import { Innertube } from 'youtubei.js'
import { YoutubeTranscript } from 'youtube-transcript'

// Gemini AI 설정
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
    try {
        const { url } = await request.json()

        if (!url) {
            return NextResponse.json({ error: '유튜브 URL이 필요합니다.' }, { status: 400 })
        }

        // 인증 헤더에서 토큰 추출
        const authHeader = request.headers.get('authorization')
        console.log('🔐 인증 헤더 확인:', authHeader ? 'Bearer 토큰 있음' : '인증 헤더 없음')

        // 유튜브 비디오 ID 추출
        const videoId = extractVideoId(url)
        if (!videoId) {
            return NextResponse.json({ error: '유효한 유튜브 URL이 아닙니다.' }, { status: 400 })
        }

        // 먼저 ytdl을 사용해서 영상 정보 가져오기
        let videoInfo = null
        let videoTitle = ''
        let videoDescription = ''

        try {
            console.log('📹 영상 정보 가져오는 중...')
            videoInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${videoId}`)
            videoTitle = videoInfo.videoDetails.title || ''
            videoDescription = videoInfo.videoDetails.description || ''
            console.log(`✅ 영상 정보 수집 완료: "${videoTitle}"`)
        } catch (error) {
            console.log('⚠️ 영상 정보 수집 실패:', error instanceof Error ? error.message : '알 수 없는 오류')
        }

        // 자막 추출 시도 (여러 방법으로)
        let transcript = null
        let transcriptSource = ''

        // 더 많은 언어 옵션과 자막 타입 시도
        const langOptions = [
            { lang: 'ko', name: '한국어' },
            { lang: 'en', name: '영어' },
            { lang: 'en-US', name: '영어(미국)' },
            { lang: 'en-GB', name: '영어(영국)' },
            { lang: 'ja', name: '일본어' },
            { lang: 'zh', name: '중국어' },
            { lang: 'zh-CN', name: '중국어(간체)' },
            { lang: 'zh-TW', name: '중국어(번체)' },
            { lang: 'es', name: '스페인어' },
            { lang: 'fr', name: '프랑스어' },
            { lang: 'de', name: '독일어' },
            { lang: 'ru', name: '러시아어' },
            { lang: 'pt', name: '포르투갈어' },
            { lang: 'it', name: '이탈리아어' },
            { lang: 'hi', name: '힌디어' },
            { lang: 'ar', name: '아랍어' },
            { lang: 'auto', name: '자동 감지' }
        ]

        for (const option of langOptions) {
            try {
                console.log(`${option.name}(${option.lang}) 자막 추출 시도...`)

                const transcriptData = await YoutubeTranscript.fetchTranscript(videoId,
                    option.lang === 'auto' ? {} : { lang: option.lang }
                )

                if (transcriptData && transcriptData.length > 0) {
                    transcript = transcriptData.map(item => item.text).join(' ')
                    transcriptSource = option.name
                    console.log(`✅ ${option.name} 자막 추출 성공: ${transcript.length}자`)
                    break
                }
            } catch (error) {
                console.log(`❌ ${option.name} 자막 추출 실패:`, error instanceof Error ? error.message : '알 수 없는 오류')
                continue
            }
        }

        // 모든 언어 시도 실패 시 다른 방법들 시도
        if (!transcript || transcript.trim().length === 0) {
            console.log('🔄 대안 방법들 시도...')

            // 언어 코드 없이 시도
            try {
                console.log('언어 코드 없이 자막 추출 시도...')
                const transcriptData = await YoutubeTranscript.fetchTranscript(videoId)
                if (transcriptData && transcriptData.length > 0) {
                    transcript = transcriptData.map(item => item.text).join(' ')
                    transcriptSource = '기본 자막'
                    console.log(`✅ 기본 자막 추출 성공: ${transcript.length}자`)
                }
            } catch (error) {
                console.log('❌ 기본 자막 추출 실패:', error instanceof Error ? error.message : '알 수 없는 오류')
            }

            // youtubei.js로 자막 추출 시도
            if (!transcript || transcript.trim().length === 0) {
                try {
                    console.log('youtubei.js로 자막 추출 시도...')
                    const yt = await Innertube.create()
                    const video = await yt.getInfo(videoId)

                    if (video.captions && video.captions.caption_tracks && video.captions.caption_tracks.length > 0) {
                        const captionTracks = video.captions.caption_tracks

                        // 한국어 자막 우선 검색
                        let captionTrack = captionTracks.find((track: any) =>
                            track.language_code === 'ko' || track.language_code === 'kr'
                        )

                        // 한국어가 없으면 영어 검색
                        if (!captionTrack) {
                            captionTrack = captionTracks.find((track: any) =>
                                track.language_code === 'en' || track.language_code.startsWith('en')
                            )
                        }

                        // 그것도 없으면 첫 번째 자막 사용
                        if (!captionTrack && captionTracks.length > 0) {
                            captionTrack = captionTracks[0]
                        }

                        if (captionTrack) {
                            // youtubei.js의 자막 추출 방법이 다를 수 있으므로 기본 정보만 사용
                            transcript = `영상 제목: ${video.basic_info.title || ''}\n영상 설명: ${video.basic_info.short_description || ''}`
                            transcriptSource = `youtubei.js (기본 정보)`
                            console.log(`✅ youtubei.js 영상 정보 추출 성공`)
                        }
                    }
                } catch (error) {
                    console.log('❌ youtubei.js 자막 추출 실패:', error instanceof Error ? error.message : '알 수 없는 오류')
                }
            }
        }

        // 자막 추출에 완전히 실패한 경우 영상 정보 활용
        if (!transcript || transcript.trim().length === 0) {
            console.log('⚠️ 모든 자막 추출 방법 실패 - 영상 정보 활용')
            if (videoTitle || videoDescription) {
                transcript = `이 영상의 제목: "${videoTitle || '제목 없음'}"
                
영상 설명:
${videoDescription ? videoDescription.substring(0, 2000) : '설명 없음'}

자막을 추출할 수 없어서 제목과 설명을 바탕으로 분석을 진행합니다.`
                transcriptSource = '영상 정보 기반'
                console.log(`📋 영상 정보 활용: 제목="${videoTitle}", 설명 길이=${videoDescription.length}자`)
            } else {
                transcript = `이 영상은 "${videoId}" ID를 가진 유튜브 영상입니다. 자막과 영상 정보를 모두 추출할 수 없어서 기본적인 분석만 가능합니다.`
                transcriptSource = '자막 없음'
            }
        } else {
            console.log(`📝 최종 자막 정보: ${transcriptSource}, 길이: ${transcript.length}자`)
        }

        // Gemini AI로 분석 (데모 모드 지원)
        let analysis
        if (!process.env.GEMINI_API_KEY) {
            // 데모 모드: 더미 분석 결과 생성
            analysis = {
                title: `분석된 영상 제목 - ${videoId}`,
                summary: `이 영상은 유튜브에서 분석한 내용입니다. 실제 분석 결과를 보려면 GEMINI_API_KEY를 설정하세요. 영상의 주요 내용과 핵심 포인트들을 요약하여 제공합니다.`,
                keyPoints: [
                    "영상의 핵심 내용 요약",
                    "주요 학습 포인트 정리",
                    "실용적인 정보 추출",
                    "시청자에게 유용한 인사이트"
                ],
                category: "교육",
                sentiment: "긍정적",
                difficulty: "중급",
                duration_estimate: "10분",
                tags: ["교육", "학습", "정보", "유튜브"]
            }
        } else {
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

            const isPlaceholderContent = transcript.includes('자막을 추출할 수 없어서')

            const prompt = isPlaceholderContent ? `
다음은 유튜브 영상 ID입니다: ${videoId}

자막을 추출할 수 없는 영상이므로, 영상 ID와 일반적인 유튜브 영상 패턴을 바탕으로 기본적인 정보를 생성해주세요:

응답 형식:
{
  "title": "유튜브 영상 (자막 없음)",
  "summary": "이 영상은 자막을 추출할 수 없어서 상세한 분석이 어렵습니다. 영상을 직접 시청하시기를 권장합니다.",
  "keyPoints": [
    "자막이 제공되지 않는 영상입니다",
    "직접 시청을 통해 내용을 확인해주세요",
    "영상의 제목과 설명을 참고하시기 바랍니다"
  ],
  "category": "일반",
  "sentiment": "중립적",
  "difficulty": "알 수 없음",
  "duration_estimate": "알 수 없음",
  "tags": ["유튜브", "영상", "자막없음"]
}

반드시 유효한 JSON 형식으로만 응답해주세요.
    ` : `
다음은 유튜브 영상의 자막입니다. 이를 분석하여 아래 형식으로 응답해주세요:

자막 내용:
${transcript}

응답 형식:
{
  "title": "영상의 제목을 추론하여 작성",
  "summary": "영상의 핵심 내용을 3-4문장으로 요약",
  "keyPoints": [
    "주요 포인트 1",
    "주요 포인트 2",
    "주요 포인트 3"
  ],
  "category": "영상의 카테고리 (예: 교육, 기술, 엔터테인먼트, 뉴스 등)",
  "sentiment": "영상의 전반적인 감정 (긍정적, 부정적, 중립적)",
  "difficulty": "내용의 난이도 (초급, 중급, 고급)",
  "duration_estimate": "예상 시청 시간 (분 단위)",
  "tags": ["관련", "태그", "목록"]
}

반드시 유효한 JSON 형식으로만 응답해주세요.
    `

            const result = await model.generateContent(prompt)
            const responseText = result.response.text()

            // JSON 파싱 시도
            try {
                analysis = JSON.parse(responseText)
            } catch (parseError) {
                // JSON 파싱 실패 시 텍스트에서 JSON 부분 추출 시도
                const jsonMatch = responseText.match(/\{[\s\S]*\}/)
                if (jsonMatch) {
                    try {
                        analysis = JSON.parse(jsonMatch[0])
                    } catch (error) {
                        return NextResponse.json({
                            error: 'AI 응답을 파싱할 수 없습니다.',
                            rawResponse: responseText
                        }, { status: 500 })
                    }
                } else {
                    return NextResponse.json({
                        error: 'AI 응답이 올바른 형식이 아닙니다.',
                        rawResponse: responseText
                    }, { status: 500 })
                }
            }
        }

        // Supabase에 분석 결과 저장
        let savedAnalysis = null
        try {
            // 서버 사이드에서는 service role을 사용하여 RLS 우회
            const supabase = createServerClient() || createClient()

            // Supabase가 올바르게 설정되어 있는지 확인
            if (supabase && typeof supabase.auth?.getUser === 'function') {
                let user = null
                let authError = null

                // 인증 헤더가 있으면 토큰을 사용해서 사용자 정보 조회
                if (authHeader) {
                    const token = authHeader.replace('Bearer ', '')
                    console.log('🔑 토큰으로 사용자 확인 시도')

                    try {
                        const { data, error } = await supabase.auth.getUser(token)
                        user = data?.user
                        authError = error
                        console.log('🔑 토큰 검증 결과:', {
                            success: !!user,
                            userId: user?.id,
                            email: user?.email,
                            error: error?.message
                        })
                    } catch (error) {
                        console.error('🔑 토큰 검증 실패:', error)
                        authError = error
                    }
                } else {
                    // 기본 세션에서 사용자 정보 가져오기
                    const result = await supabase.auth.getUser()
                    user = result.data?.user
                    authError = result.error
                }

                console.log('🔐 인증 상태 확인:', {
                    user: user ? { id: user.id, email: user.email } : null,
                    authError: authError
                })

                // 인증된 사용자만 데이터 저장 (익명 사용자는 저장하지 않음)
                if (!user?.id) {
                    console.log('⚠️ 인증되지 않은 사용자 - 데이터베이스에 저장하지 않음')
                    console.log('📋 사용자는 로그인이 필요합니다!')
                    return NextResponse.json({
                        success: true,
                        data: {
                            videoId,
                            url,
                            transcript: transcript.substring(0, 1000) + '...',
                            transcriptSource,
                            analysis: {
                                ...analysis,
                                title: videoTitle && videoTitle.trim() ? videoTitle : analysis.title
                            },
                            saved: false,
                            savedId: null,
                            actualVideoTitle: videoTitle,
                            message: '로그인하시면 분석 기록이 저장됩니다.'
                        }
                    })
                }

                const userId = user.id
                console.log('✅ 인증된 사용자 - 데이터베이스 저장 시작:', userId)

                // 분석 결과를 데이터베이스에 저장
                // 실제 유튜브 제목을 우선적으로 사용, 없으면 AI가 생성한 제목 사용
                const finalTitle = videoTitle && videoTitle.trim() ? videoTitle : analysis.title
                console.log('📝 제목 정보:', {
                    videoTitle: videoTitle,
                    aiTitle: analysis.title,
                    finalTitle: finalTitle
                })

                // 기본 분석 데이터 (모든 DB에 존재하는 컬럼들만)
                const analysisToSave = {
                    youtube_url: url,
                    title: finalTitle,
                    description: analysis.summary,
                    user_id: userId
                }

                // AI 분석 컬럼들이 존재하는지 확인하고 추가
                console.log('💾 기본 데이터 저장 시도')

                // 먼저 기본 데이터만 저장 시도
                let { data: insertData, error: insertError } = await supabase
                    .from('analysis')
                    .insert(analysisToSave)
                    .select()
                    .single()

                // 기본 저장이 성공하면 AI 데이터 업데이트 시도
                if (!insertError && insertData) {
                    console.log('✅ 기본 분석 저장 성공, AI 데이터 업데이트 시도')

                    // AI 데이터는 기본 컬럼들이 추가되면 나중에 업데이트
                    console.log('⚠️ AI 추가 컬럼들이 없어서 기본 분석만 저장됨')
                    console.log('📋 추가 정보:', {
                        videoId: videoId,
                        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                        transcriptLength: transcript.length
                    })

                    // 나중에 AI 컬럼들이 추가되면 여기서 업데이트할 수 있음
                }

                console.log('💾 저장할 데이터:', analysisToSave)

                console.log('💾 저장 시도 결과:', {
                    success: !insertError,
                    insertData: insertData,
                    error: insertError
                })

                if (insertError) {
                    console.error('❌ 분석 저장 실패:', {
                        errorMessage: insertError.message,
                        errorDetails: insertError.details,
                        errorHint: insertError.hint,
                        errorCode: insertError.code
                    })
                } else if (!insertData) {
                    console.error('❌ 분석 저장 실패: insertData가 null')
                } else {
                    console.log('✅ 분석 저장 성공:', {
                        analysisId: insertData.id,
                        title: insertData.title,
                        userId: insertData.user_id
                    })
                    savedAnalysis = insertData

                    // 분석이 성공적으로 저장되면 search_history에도 추가
                    console.log('🔍 검색 기록 추가 시도. User ID:', user?.id, 'Analysis ID:', insertData.id)

                    if (user?.id) {  // 실제 로그인한 사용자만
                        try {
                            const searchHistoryData = {
                                user_id: user.id,
                                analysis_id: insertData.id,
                                created_at: new Date().toISOString()
                            }

                            console.log('🔍 검색 기록 저장할 데이터:', searchHistoryData)

                            const { data: historyData, error: historyError } = await supabase
                                .from('search_history')
                                .insert(searchHistoryData)
                                .select()
                                .single()

                            if (historyError) {
                                console.error('❌ 검색 기록 저장 실패:', {
                                    errorMessage: historyError.message,
                                    errorDetails: historyError.details,
                                    errorHint: historyError.hint,
                                    errorCode: historyError.code
                                })
                            } else {
                                console.log('✅ 검색 기록 저장 성공:', {
                                    historyId: historyData?.id,
                                    analysisId: historyData?.analysis_id,
                                    title: historyData?.title
                                })
                            }
                        } catch (historyError) {
                            console.error('❌ 검색 기록 저장 실패 (Exception):', historyError)
                            // 검색 기록 추가 실패해도 분석 저장은 성공했으므로 계속 진행
                        }
                    } else {
                        console.log('⚠️ 사용자 ID가 없어서 검색 기록 추가 생략')
                    }
                }
            }
        } catch (saveError) {
            // 저장 실패해도 분석 결과는 반환 (데모 모드에서는 정상적인 동작)
        }

        return NextResponse.json({
            success: true,
            data: {
                videoId,
                url,
                transcript: transcript.substring(0, 1000) + '...', // 처음 1000자만 반환
                transcriptSource, // 자막 소스 정보 추가
                analysis: {
                    ...analysis,
                    title: videoTitle && videoTitle.trim() ? videoTitle : analysis.title // 실제 유튜브 제목을 우선적으로 사용
                },
                saved: savedAnalysis !== null,
                savedId: savedAnalysis?.id,
                actualVideoTitle: videoTitle // 실제 유튜브 제목 정보 추가
            }
        })

    } catch (error) {
        console.error('유튜브 분석 오류:', error)
        return NextResponse.json({
            error: '분석 중 오류가 발생했습니다.',
            details: error instanceof Error ? error.message : '알 수 없는 오류'
        }, { status: 500 })
    }
}

function extractVideoId(url: string): string | null {
    // 다양한 유튜브 URL 형식 지원
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch.*[?&]v=([^&\n?#]+)/,
        /youtu\.be\/([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/
    ]

    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) {
            return match[1]
        }
    }

    return null
} 