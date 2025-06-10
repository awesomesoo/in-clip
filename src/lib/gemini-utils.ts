import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function summarizeWithGemini(transcript: string): Promise<string> {
    // 데모 모드: API 키가 없으면 샘플 요약을 반환
    if (!process.env.GEMINI_API_KEY) {
        console.log('GEMINI_API_KEY not found, returning demo summary')
        return `## 📺 영상 요약

### 🎯 핵심 내용
- 이것은 데모 요약입니다
- 실제 API 키를 설정하면 Gemini AI가 실제 요약을 생성합니다
- 자막 길이: ${transcript.length}자

### 📋 상세 내용
현재 API 키가 설정되지 않아 데모 모드로 실행되고 있습니다. 
실제 요약을 보려면 .env.local 파일에 GEMINI_API_KEY를 설정해주세요.

추출된 자막의 일부:
"${transcript.substring(0, 200)}..."

### 💡 인사이트
- 환경 변수 설정이 필요합니다
- Google AI Studio에서 API 키를 발급받아 설정하세요
- 실제 API를 사용하면 더 정확하고 상세한 요약을 받을 수 있습니다`
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const prompt = `
다음 유튜브 영상의 자막을 요약해주세요. 
요약은 다음 형식으로 작성해주세요:

## 📺 영상 요약

### 🎯 핵심 내용
- 핵심 포인트 1
- 핵심 포인트 2
- 핵심 포인트 3

### 📋 상세 내용
영상의 주요 내용을 자세히 설명해주세요.

### 💡 인사이트
이 영상에서 얻을 수 있는 중요한 교훈이나 인사이트를 정리해주세요.

자막 내용:
${transcript}
`

        const result = await model.generateContent(prompt)
        const response = await result.response
        const summary = response.text()

        if (!summary) {
            throw new Error('Empty response from Gemini API')
        }

        return summary
    } catch (error) {
        console.error('Error with Gemini API:', error)
        throw new Error('Summary generation failed')
    }
} 