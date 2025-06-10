-- RLS (Row Level Security) 정책 설정
-- 이 파일을 Supabase SQL Editor에서 실행하세요

-- 1. 테이블들에 RLS 활성화
ALTER TABLE public.analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책들 삭제 (있는 경우)
DROP POLICY IF EXISTS "Users can view own analysis" ON public.analysis;
DROP POLICY IF EXISTS "Users can insert own analysis" ON public.analysis;
DROP POLICY IF EXISTS "Users can update own analysis" ON public.analysis;
DROP POLICY IF EXISTS "Users can delete own analysis" ON public.analysis;

DROP POLICY IF EXISTS "Users can view own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can insert own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can update own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can delete own tags" ON public.tags;

DROP POLICY IF EXISTS "Users can view own analysis_tags" ON public.analysis_tags;
DROP POLICY IF EXISTS "Users can insert own analysis_tags" ON public.analysis_tags;
DROP POLICY IF EXISTS "Users can update own analysis_tags" ON public.analysis_tags;
DROP POLICY IF EXISTS "Users can delete own analysis_tags" ON public.analysis_tags;

DROP POLICY IF EXISTS "Users can view own search_history" ON public.search_history;
DROP POLICY IF EXISTS "Users can insert own search_history" ON public.search_history;
DROP POLICY IF EXISTS "Users can update own search_history" ON public.search_history;
DROP POLICY IF EXISTS "Users can delete own search_history" ON public.search_history;

-- 3. Analysis 테이블 정책 생성
CREATE POLICY "Users can view own analysis" ON public.analysis
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis" ON public.analysis
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analysis" ON public.analysis
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analysis" ON public.analysis
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Tags 테이블 정책 생성
CREATE POLICY "Users can view own tags" ON public.tags
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags" ON public.tags
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" ON public.tags
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON public.tags
    FOR DELETE USING (auth.uid() = user_id);

-- 5. Analysis_tags 테이블 정책 생성 (분석 소유자만 접근 가능)
CREATE POLICY "Users can view own analysis_tags" ON public.analysis_tags
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.analysis WHERE id = analysis_id
        )
    );

CREATE POLICY "Users can insert own analysis_tags" ON public.analysis_tags
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.analysis WHERE id = analysis_id
        )
    );

CREATE POLICY "Users can update own analysis_tags" ON public.analysis_tags
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM public.analysis WHERE id = analysis_id
        )
    );

CREATE POLICY "Users can delete own analysis_tags" ON public.analysis_tags
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM public.analysis WHERE id = analysis_id
        )
    );

-- 6. Search_history 테이블 정책 생성
CREATE POLICY "Users can view own search_history" ON public.search_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search_history" ON public.search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own search_history" ON public.search_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own search_history" ON public.search_history
    FOR DELETE USING (auth.uid() = user_id);

-- 7. 정책 상태 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('analysis', 'tags', 'analysis_tags', 'search_history')
ORDER BY tablename, policyname;

-- 완료 메시지
SELECT 'RLS 정책 설정이 완료되었습니다!' as message; 