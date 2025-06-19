# 📺 InClip - 유튜브 영상 요약 서비스

유튜브 영상 링크를 붙여넣으면 AI가 자막을 분석하여 핵심 내용을 요약해주는 서비스입니다.

## ✨ 주요 기능

- 🎥 **유튜브 영상 자동 분석**: URL 입력만으로 자막 추출 및 AI 요약
- 🤖 **Gemini AI 활용**: 구글의 최신 AI 모델로 정확한 요약 제공
- 🏷️ **스마트 태깅**: 영상 내용에 맞는 카테고리 및 태그 자동 생성
- 📊 **구조화된 정보**: 요약, 주요 포인트, 메타데이터 등 체계적 제공
- 🌏 **다국어 지원**: 한국어/영어 자막 자동 감지

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 Gemini API 키를 추가하세요:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Gemini API 키 발급 방법**: [Google AI Studio](https://ai.google.dev/)에서 무료로 발급 가능

### 3. 개발 서버 실행

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어서 결과를 확인하세요.

## 📖 사용 방법

1. 메인 페이지에서 유튜브 링크를 입력 필드에 붙여넣기
2. "요약하기" 버튼 클릭
3. AI가 분석하는 동안 잠시 대기
4. 구조화된 분석 결과 확인

## 🛠️ 기술 스택

- **프론트엔드**: Next.js 15, React 19, TypeScript
- **AI**: Google Gemini 1.5 Flash
- **자막 추출**: youtube-transcript
- **스타일링**: Tailwind CSS (추정)

## 📋 상세 설정 가이드

더 자세한 설정 방법과 문제 해결은 [YOUTUBE_ANALYSIS_SETUP.md](./YOUTUBE_ANALYSIS_SETUP.md)를 참고하세요.

## ⚠️ 주의사항

- 자막이 있는 유튜브 영상만 분석 가능합니다
- Gemini API 사용량에 따른 비용이 발생할 수 있습니다
- 긴 영상의 경우 처리 시간이 오래 걸릴 수 있습니다

## 🔧 개발 정보

이 프로젝트는 [Next.js](https://nextjs.org)로 구축되었습니다. 개발에 대한 더 자세한 정보는:

- [Next.js 문서](https://nextjs.org/docs)
- [Next.js 튜토리얼](https://nextjs.org/learn)

## 🚀 배포

[Vercel Platform](https://vercel.com/new)을 사용하여 쉽게 배포할 수 있습니다. 환경 변수 설정을 잊지 마세요!
# project-1
