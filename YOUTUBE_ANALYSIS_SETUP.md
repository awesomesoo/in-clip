# 📺 유튜브 영상 분석 기능 설정 가이드

## 🚀 기능 개요

이 프로젝트에 유튜브 영상 자막을 분석하여 AI로 요약하는 기능이 추가되었습니다.

### 주요 기능
- 유튜브 URL 입력 → 자막 추출 → AI 요약
- 한국어/영어 자막 지원
- Gemini AI를 사용한 구조화된 요약
- 반응형 UI 디자인

## 🔧 설정 방법

### 1. Gemini API 키 발급

1. [Google AI Studio](https://ai.google.dev/)에 접속
2. 구글 계정으로 로그인
3. "Get API Key" 클릭하여 API 키 생성
4. 프로젝트 루트에 `.env.local` 파일 생성:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

### 2. Supabase 데이터베이스 설정

1. Supabase 프로젝트에서 SQL 에디터를 열어주세요
2. `add_youtube_analysis_columns.sql` 파일의 내용을 실행하여 테이블 컬럼을 추가해주세요:

```sql
-- analysis 테이블에 AI 분석 결과 컬럼 추가
ALTER TABLE analysis 
ADD COLUMN IF NOT EXISTS video_id TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS transcript TEXT,
ADD COLUMN IF NOT EXISTS ai_summary TEXT,
ADD COLUMN IF NOT EXISTS key_points JSONB,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS sentiment TEXT,
ADD COLUMN IF NOT EXISTS difficulty TEXT,
ADD COLUMN IF NOT EXISTS duration_estimate TEXT,
ADD COLUMN IF NOT EXISTS ai_tags JSONB;
```

### 3. 패키지 설치 확인

필요한 패키지들이 이미 설치되어 있는지 확인:

```bash
npm install @google/generative-ai youtube-transcript
```

### 4. 개발 서버 실행

```bash
npm run dev
```

## 📁 구현된 파일들

### API 라우트
- `app/api/youtube-analysis/route.ts` - 유튜브 분석 API 엔드포인트

### 메인 페이지
- `app/page.tsx` - 메인 페이지에 분석 기능 통합

## 🎯 사용 방법

1. 메인 페이지에서 유튜브 URL 입력 필드에 링크 붙여넣기
2. "요약하기" 버튼 클릭
3. AI가 자막을 추출하고 분석하는 동안 대기
4. 구조화된 분석 결과 확인:
   - 📋 요약: 영상의 핵심 내용
   - 🎯 주요 포인트: 번호가 매겨진 주요 항목들
   - 🏷️ 관련 태그: 영상과 관련된 키워드들
   - 카테고리, 난이도, 감정 등의 메타데이터

## ⚠️ 주의사항

- 자막이 있는 영상만 분석 가능
- 긴 영상은 처리 시간이 오래 걸릴 수 있음
- Gemini API 사용량에 따른 비용 발생 가능

## 🐛 문제 해결

### "자막을 찾을 수 없습니다" 오류
- 영상에 자막이 없거나 자막이 비공개 상태
- 다른 영상으로 시도해보세요

### "요약 생성에 실패했습니다" 오류
- GEMINI_API_KEY 환경 변수 확인
- API 키의 권한 및 할당량 확인

### "유효하지 않은 유튜브 URL" 오류
- URL 형식 확인 (youtube.com 또는 youtu.be)
- 올바른 동영상 링크인지 확인 