# Google OAuth 설정 가이드

## 1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. API 및 서비스 > 라이브러리로 이동
4. "Google+ API" 검색 후 활성화

## 2. OAuth 2.0 클라이언트 ID 생성

1. API 및 서비스 > 사용자 인증 정보로 이동
2. "사용자 인증 정보 만들기" > "OAuth 클라이언트 ID" 클릭
3. 애플리케이션 유형: "웹 애플리케이션" 선택
4. 이름 입력 (예: InClip Web Client)

### 승인된 리디렉션 URI 설정:

- 개발 환경: `http://localhost:3000/auth/callback`
- 배포 환경: `https://yourdomain.com/auth/callback`

## 3. Supabase 설정

1. [Supabase 대시보드](https://app.supabase.com/)에서 프로젝트 선택
2. Authentication > Providers로 이동
3. Google 제공업체 활성화
4. Google Cloud Console에서 얻은 정보 입력:
   - Client ID: `your-google-client-id`
   - Client Secret: `your-google-client-secret`

### Supabase 리디렉션 URL:

- `https://[your-project-ref].supabase.co/auth/v1/callback`

## 4. 환경 변수 설정

`.env.local` 파일에 다음 변수들을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 5. 확인사항

- Google Cloud Console에서 OAuth 동의 화면 설정 완료
- Supabase에서 Google 제공업체 활성화 및 설정 완료
- 환경 변수 올바르게 설정
- 리디렉션 URL이 정확히 설정되어 있는지 확인

## 6. 테스트

1. 개발 서버 실행: `npm run dev`
2. `/login` 페이지로 이동
3. "Google로 로그인" 버튼 클릭
4. Google 인증 후 `/auth/callback`으로 리디렉션 확인
5. 메인 페이지로 최종 리디렉션 확인

## 문제 해결

### 일반적인 오류:

1. **"redirect_uri_mismatch"**: Google Cloud Console의 리디렉션 URI 확인
2. **"invalid_client"**: Client ID/Secret 확인
3. **"Access blocked"**: OAuth 동의 화면 설정 확인

### 개발 중 주의사항:

- localhost:3000은 Google OAuth에서 허용되는 도메인입니다
- HTTPS 없이도 localhost에서는 테스트 가능합니다
- 배포시에는 반드시 HTTPS 도메인을 사용해야 합니다
