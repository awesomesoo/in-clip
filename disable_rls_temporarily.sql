-- 임시로 RLS 비활성화 (테스트용)
-- ⚠️ 주의: 프로덕션에서는 사용하지 마세요!
-- 이 명령은 Supabase SQL Editor에서 실행하세요

-- RLS 비활성화
ALTER TABLE public.analysis DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history DISABLE ROW LEVEL SECURITY;

-- 상태 확인
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS 활성화됨'
        ELSE 'RLS 비활성화됨'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('analysis', 'tags', 'analysis_tags', 'search_history');

SELECT '⚠️ RLS가 임시로 비활성화되었습니다. 테스트 완료 후 다시 활성화하세요!' as warning; 