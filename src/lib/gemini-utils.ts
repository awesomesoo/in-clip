import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function summarizeWithGemini(transcript: string): Promise<string> {
    // 데모 모드: API 키가 없으면 샘플 요약을 반환
    if (!process.env.GEMINI_API_KEY) {
        console.log('GEMINI_API_KEY not found, returning demo summary')
        return `## 📺 영상 요약

### 🎯 핵심 흐름
자막의 흐름을 따라 영상의 핵심 내용을 체계적으로 요약:
- 도입부: 데모 모드로 실행 중인 영상 분석 시스템입니다
- 전개부: 실제 API 키를 설정하면 Gemini AI가 자막을 기반으로 상세한 분석을 제공합니다
- 결론부: 환경 설정 후 실제 AI 요약 기능을 이용할 수 있습니다

### 📋 주요 포인트
영상에서 강조하는 핵심 메시지와 중요한 내용들:
- 이것은 데모 요약입니다 (자막 길이: ${transcript.length}자)
- 실제 API 키를 설정하면 Gemini AI가 실제 요약을 생성합니다
- 환경 변수 설정이 필요합니다

### 💡 인사이트
현재 API 키가 설정되지 않아 데모 모드로 실행되고 있습니다. 
실제 요약을 보려면 .env.local 파일에 GEMINI_API_KEY를 설정해주세요.

추출된 자막의 일부:
"${transcript.substring(0, 200)}..."

### ✨ 한줄 요약
Google AI Studio에서 API 키를 발급받아 설정하면 실제 AI 요약 기능을 이용할 수 있습니다.`
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

        const prompt = `
다음 유튜브 영상의 자막을 흐름에 맞추어 핵심 내용을 요약해주세요.
자막의 시간적 흐름을 고려하여 영상의 전개 과정을 반영하고, 핵심 메시지를 파악하여 요약해주세요.

## 📺 영상 요약

### 🎯 핵심 흐름
자막의 흐름을 따라 영상의 핵심 내용을 체계적으로 요약해주세요:
- 도입부: 영상이 어떻게 시작되는지
- 전개부: 주요 내용과 핵심 메시지
- 결론부: 영상의 마무리와 핵심 포인트

### 📋 주요 포인트
영상에서 강조하는 핵심 메시지와 중요한 내용들을 정리해주세요:
- 주요 포인트 1
- 주요 포인트 2  
- 주요 포인트 3

### 💡 인사이트
이 영상에서 얻을 수 있는 중요한 교훈이나 인사이트를 정리해주세요.

### ✨ 한줄 요약
영상의 핵심 메시지를 한 문장으로 압축해서 정리해주세요.

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