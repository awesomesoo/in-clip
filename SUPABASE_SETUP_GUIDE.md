# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [Supabase.com](https://supabase.com)에 접속하여 계정을 생성합니다.
2. "New project" 버튼을 클릭하여 새 프로젝트를 생성합니다.
3. 프로젝트 이름, 데이터베이스 비밀번호, 지역을 설정합니다.

## 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# 구글 OAuth 설정 (선택사항)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## 3. Supabase에서 키 찾기

1. Supabase 대시보드에서 프로젝트를 선택합니다.
2. 왼쪽 메뉴에서 "Settings" > "API"를 클릭합니다.
3. `Project URL`을 복사하여 `NEXT_PUBLIC_SUPABASE_URL`에 입력합니다.
4. `Project API keys`의 `anon public` 키를 복사하여 `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 입력합니다.

## 4. 데이터베이스 스키마 설정

Supabase SQL Editor에서 다음 스키마를 실행하세요 (schema.sql 파일 참조):

```sql
-- Users 테이블은 Supabase Auth에서 자동으로 생성됩니다.
-- 추가적인 사용자 프로필 정보가 필요한 경우 profiles 테이블을 생성할 수 있습니다.

-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS public.analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analysis_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.search_history ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view own analysis" ON public.analysis
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis" ON public.analysis
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analysis" ON public.analysis
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analysis" ON public.analysis
    FOR DELETE USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Users can view own tags" ON public.tags
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags" ON public.tags
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" ON public.tags
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON public.tags
    FOR DELETE USING (auth.uid() = user_id);
```

## 5. Google OAuth 설정 (선택사항)

Google OAuth를 사용하려면:

1. [Google Cloud Console](https://console.cloud.google.com)에서 프로젝트를 생성합니다.
2. "APIs & Services" > "Credentials"에서 OAuth 2.0 클라이언트 ID를 생성합니다.
3. 승인된 리디렉션 URI에 `https://your-project-id.supabase.co/auth/v1/callback`를 추가합니다.
4. 클라이언트 ID와 시크릿을 `.env.local`에 추가합니다.
5. Supabase 대시보드의 "Authentication" > "Providers"에서 Google 제공자를 활성화하고 클라이언트 ID와 시크릿을 입력합니다.

## 6. 설정 확인

1. 서버를 재시작합니다: `npm run dev`
2. `/test-env` 페이지에서 환경 변수가 올바르게 설정되었는지 확인합니다.
3. 회원가입과 로그인이 정상적으로 작동하는지 테스트합니다.

## 7. 주의사항

- `.env.local` 파일은 절대 Git에 커밋하지 마세요. (이미 .gitignore에 추가되어 있습니다)
- 프로덕션 환경에서는 환경 변수를 안전하게 관리하세요.
- Row Level Security(RLS)가 활성화되어 있어 사용자는 자신의 데이터만 접근할 수 있습니다.

## 문제 해결

- 연결이 안 될 경우: 환경 변수가 올바르게 설정되었는지 확인하세요.
- Google OAuth 오류: 리디렉션 URI와 도메인 설정을 확인하세요.
- 데이터베이스 오류: RLS 정책이 올바르게 설정되었는지 확인하세요.
