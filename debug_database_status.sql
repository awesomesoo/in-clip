-- 현재 데이터베이스 상태 확인 쿼리

-- 1. analysis 테이블의 데이터 확인
SELECT 
    'analysis' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN user_id LIKE 'c127ca9c-c3c4-457f-bd04-10e782f8e6c4' THEN 1 END) as user_count
FROM analysis;

-- 2. search_history 테이블의 데이터 확인  
SELECT 
    'search_history' as table_name,
    COUNT(*) as total_count,
    COUNT(CASE WHEN user_id LIKE 'c127ca9c-c3c4-457f-bd04-10e782f8e6c4' THEN 1 END) as user_count
FROM search_history;

-- 3. 특정 사용자의 분석 데이터 확인
SELECT 
    id,
    title,
    youtube_url,
    created_at,
    user_id
FROM analysis 
WHERE user_id = 'c127ca9c-c3c4-457f-bd04-10e782f8e6c4'
ORDER BY created_at DESC;

-- 4. 특정 사용자의 검색 기록 확인
SELECT 
    sh.id,
    sh.analysis_id,
    sh.user_id,
    sh.created_at,
    a.title
FROM search_history sh
LEFT JOIN analysis a ON sh.analysis_id = a.id
WHERE sh.user_id = 'c127ca9c-c3c4-457f-bd04-10e782f8e6c4'
ORDER BY sh.created_at DESC;

-- 5. 누락된 검색 기록 확인 (analysis에는 있지만 search_history에는 없는 것들)
SELECT 
    a.id as analysis_id,
    a.title,
    a.created_at,
    a.user_id,
    'MISSING_FROM_SEARCH_HISTORY' as status
FROM analysis a
LEFT JOIN search_history sh ON a.id = sh.analysis_id AND a.user_id = sh.user_id
WHERE sh.id IS NULL 
  AND a.user_id = 'c127ca9c-c3c4-457f-bd04-10e782f8e6c4'; 